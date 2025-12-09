"""
API Routes matching the specified structure for Lovable frontend.
These endpoints provide a clean, standardized API interface.
"""

from __future__ import annotations

import logging
from typing import Optional, List, Dict, Any, cast
from datetime import datetime
from enum import Enum

from fastapi import APIRouter, HTTPException, Body, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, HttpUrl
import httpx

from app.services.docling_service import DoclingService
from app.services.embedding_service import ingest_pdf_bytes_into_chroma, PdfMetadata
from app.services.chroma_service import ChromaService
from app.services.embedding_service import NomicEmbeddingService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["api"])

# In-memory status tracking (can be replaced with Redis/database for production)
ingestion_status: Dict[str, Dict[str, Any]] = {}

UA = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"


class IngestionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# Request/Response Models

class IngestRequest(BaseModel):
    paper_id: str = Field(..., description="Unique identifier for the paper")
    pdf_url: HttpUrl = Field(..., description="URL to the PDF file")
    user_id: str = Field(..., description="User ID who initiated the ingestion")


class IngestResponse(BaseModel):
    success: bool
    doc_id: str
    text_chunks: List[str] = Field(default_factory=list)
    images: Optional[List[str]] = Field(default=None, description="List of image URLs or base64 strings")
    github_url: Optional[str] = Field(default=None, description="GitHub repository URL detected from PDF (or null if not found)")


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., description="Search query string")
    user_id: str = Field(..., description="User ID performing the search")
    limit: Optional[int] = Field(default=10, ge=1, le=100, description="Maximum number of results")


class SearchResult(BaseModel):
    doc_id: str
    chunk_text: str
    score: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SemanticSearchResponse(BaseModel):
    results: List[SearchResult]


class IngestionStatusResponse(BaseModel):
    status: IngestionStatus
    progress: Optional[float] = Field(default=None, ge=0, le=100, description="Progress percentage")
    github_url: Optional[str] = Field(default=None, description="GitHub repository URL detected from PDF (or null if not found)")


class ContextRequest(BaseModel):
    query: str = Field(..., description="Query string for context retrieval")
    paper_ids: List[str] = Field(..., description="List of paper IDs to search within")


class ContextChunk(BaseModel):
    text: str
    source: str
    relevance: float


class ContextResponse(BaseModel):
    context_chunks: List[ContextChunk]


# Helper Functions

async def process_pdf_ingestion(
    paper_id: str,
    pdf_url: str,
    user_id: str,
):
    """Background task to process PDF ingestion."""
    try:
        logger.info(f"[INGESTION] Starting ingestion for paper_id: {paper_id}")
        
        # Update status to processing
        ingestion_status[paper_id] = {
            "status": IngestionStatus.PROCESSING,
            "progress": 10,
            "user_id": user_id,
            "started_at": datetime.now().isoformat(),
        }

        # Fetch PDF
        logger.info(f"[INGESTION] Fetching PDF from: {pdf_url}")
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(60.0, connect=10.0),
            headers={"User-Agent": UA},
            follow_redirects=True,
        ) as client:
            ingestion_status[paper_id]["progress"] = 30
            response = await client.get(str(pdf_url))
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to fetch PDF from {pdf_url}"
                )
            pdf_bytes = response.content
            logger.info(f"[INGESTION] PDF downloaded, size: {len(pdf_bytes)} bytes")

        # Extract and ingest
        ingestion_status[paper_id]["progress"] = 50
        logger.info(f"[INGESTION] Starting Docling extraction...")
        
        # Extract text chunks and images using Docling
        from app.services.docling_service import DoclingService
        
        docling = DoclingService()
        docs = docling.extract_from_bytes(pdf_bytes)
        
        chunk_info = docs["chunks"]
        image_info = docs["images"]
        
        logger.info(f"[INGESTION] Extracted {len(chunk_info)} text chunks, {len(image_info.get('uris', []))} images")
        
        # Extract text chunks
        text_chunks = [chunk["text"] for chunk in chunk_info]
        
        # Extract image base64 data
        images = []
        for img_meta in image_info.get("metadatas", []):
            img_b64 = img_meta.get("image_b64")
            if img_b64:
                images.append(f"data:image/png;base64,{img_b64}")
        
        # Ingest into ChromaDB
        logger.info(f"[INGESTION] Storing {len(chunk_info)} chunks into ChromaDB...")
        pdf_meta = PdfMetadata(
            doc_id=paper_id,
            pdf_url=str(pdf_url),
            title="",  # Will be populated if available
            summary="",
            published="",
            authors=[],
        )
        
        stats = ingest_pdf_bytes_into_chroma(pdf_bytes, extra_metadata=pdf_meta)
        
        # Capture GitHub URL detected during ingestion
        detected_github_url = pdf_meta.github_url
        
        logger.info(f"[INGESTION] Successfully stored in ChromaDB: {stats.get('text_chunks', 0)} text chunks, {stats.get('image_chunks', 0)} images")
        if detected_github_url:
            logger.info(f"[INGESTION] Detected GitHub URL: {detected_github_url}")
        
        ingestion_status[paper_id]["progress"] = 90
        
        # Update status to completed with text chunks and images
        ingestion_status[paper_id].update({
            "status": IngestionStatus.COMPLETED,
            "progress": 100,
            "text_chunks": text_chunks[:10],  # Store first 10 for response (avoid storing all in memory)
            "text_chunks_count": stats.get("text_chunks", 0),
            "images": images[:10] if images else None,  # Store first 10 images
            "image_chunks_count": stats.get("image_chunks", 0),
            "github_url": detected_github_url,  # Store detected GitHub URL
            "completed_at": datetime.now().isoformat(),
        })
        
        logger.info(f"[INGESTION] ✅ Completed ingestion for paper_id: {paper_id}")
        
    except Exception as e:
        logger.error(f"[INGESTION] ❌ Failed for {paper_id}: {e}", exc_info=True)
        ingestion_status[paper_id] = {
            "status": IngestionStatus.FAILED,
            "progress": 0,
            "error": str(e),
            "failed_at": datetime.now().isoformat(),
        }


# API Endpoints

@router.post("/ingest", response_model=IngestResponse)
async def ingest_pdf(
    request: IngestRequest,
    background_tasks: BackgroundTasks,
):
    """
    Ingest a PDF document using Docling.
    Processing happens asynchronously in the background.
    """
    paper_id = request.paper_id
    
    # Check if already exists
    if paper_id in ingestion_status:
        status_data = ingestion_status[paper_id]
        if status_data.get("status") == IngestionStatus.COMPLETED:
            return IngestResponse(
                success=True,
                doc_id=paper_id,
                text_chunks=status_data.get("text_chunks", [])[:10],  # Return first 10
                images=status_data.get("images"),
                github_url=status_data.get("github_url"),
            )
    
    # Initialize status
    ingestion_status[paper_id] = {
        "status": IngestionStatus.PENDING,
        "progress": 0,
        "user_id": request.user_id,
        "pdf_url": str(request.pdf_url),
        "created_at": datetime.now().isoformat(),
    }
    
    # Start background processing
    background_tasks.add_task(
        process_pdf_ingestion,
        paper_id,
        str(request.pdf_url),
        request.user_id,
    )
    
    return IngestResponse(
        success=True,
        doc_id=paper_id,
        text_chunks=[],  # Empty initially, will be populated when processing completes
        images=None,
        github_url=None,  # Will be populated when processing completes
    )


@router.post("/search/semantic", response_model=SemanticSearchResponse)
async def semantic_search(
    request: SemanticSearchRequest = Body(...),
):
    """
    Perform semantic search across ingested documents using ChromaDB.
    """
    try:
        chroma = ChromaService()
        embedder = NomicEmbeddingService()
        
        # Embed query
        query_vector = embedder.embed_query(request.query)
        
        # Search in ChromaDB
        results = chroma.collection.query(
            query_embeddings=[query_vector],
            n_results=request.limit or 10,
            include=["documents", "metadatas", "distances"],
        )
        
        # Format results
        search_results: List[SearchResult] = []
        
        documents = (results.get("documents") or [[]])[0]
        metadatas = (results.get("metadatas") or [[]])[0]
        distances = (results.get("distances") or [[]])[0]
        
        for i, doc_text in enumerate(documents):
            if i >= len(metadatas) or i >= len(distances):
                continue
                
            metadata = metadatas[i] or {}
            distance = distances[i]
            
            # Convert distance to score (lower distance = higher score)
            # ChromaDB uses cosine distance, so score = 1 - distance
            score = max(0.0, 1.0 - distance) if distance is not None else 0.0
            
            search_results.append(
                SearchResult(
                    doc_id=metadata.get("doc_id", "unknown"),
                    chunk_text=doc_text,
                    score=round(score, 4),
                    metadata=metadata,
                )
            )
        
        return SemanticSearchResponse(results=search_results)
        
    except Exception as e:
        logger.error(f"Semantic search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/ingest/status/{paper_id}", response_model=IngestionStatusResponse)
async def get_ingestion_status(paper_id: str):
    """
    Get the ingestion status for a paper.
    Returns default "pending" status if paper hasn't been ingested yet.
    """
    # Check if paper is in status tracking
    if paper_id in ingestion_status:
        status_data = ingestion_status[paper_id]
        return IngestionStatusResponse(
            status=IngestionStatus(status_data["status"]),
            progress=status_data.get("progress"),
            github_url=status_data.get("github_url"),
        )
    
    # Check if paper exists in ChromaDB (may have been ingested before status tracking)
    # Try to find GitHub URL from metadata
    chroma = ChromaService()
    try:
        data = chroma.collection.get(
            where={"doc_id": paper_id},
            limit=1,
            include=["metadatas"],
        )
        if data.get("ids"):
            # Try to find github_url from metadata
            metadatas = data.get("metadatas", [])
            github_url = None
            if metadatas and len(metadatas) > 0:
                # Check metadata for github_url or repo_url
                for meta in metadatas:
                    if meta:
                        # Check for repo_url (for repo chunks)
                        if meta.get("repo_url"):
                            github_url = meta.get("repo_url")
                            break
                        # Check for github_url (if stored in PDF metadata)
                        if meta.get("github_url"):
                            github_url = meta.get("github_url")
                            break
            
            return IngestionStatusResponse(
                status=IngestionStatus.COMPLETED,
                progress=100,
                github_url=github_url,
            )
    except Exception:
        pass
    
    # Paper not found - return default pending status
    return IngestionStatusResponse(
        status=IngestionStatus.PENDING,
        progress=0,
        github_url=None,
    )


@router.post("/context", response_model=ContextResponse)
async def get_paper_context(
    request: ContextRequest = Body(...),
):
    """
    Retrieve relevant context chunks from specified papers for RAG.
    """
    try:
        chroma = ChromaService()
        embedder = NomicEmbeddingService()
        
        # Embed query
        query_vector = embedder.embed_query(request.query)
        
        # Search within specified paper_ids
        where_filter = {"doc_id": {"$in": request.paper_ids}}
        
        results = chroma.collection.query(
            query_embeddings=[query_vector],
            n_results=min(20, len(request.paper_ids) * 5),  # Reasonable limit
            where=cast(Any, where_filter),
            include=["documents", "metadatas", "distances"],
        )
        
        # Format context chunks
        context_chunks: List[ContextChunk] = []
        
        documents = (results.get("documents") or [[]])[0]
        metadatas = (results.get("metadatas") or [[]])[0]
        distances = (results.get("distances") or [[]])[0]
        
        for i, doc_text in enumerate(documents):
            if i >= len(metadatas) or i >= len(distances):
                continue
                
            metadata = metadatas[i] or {}
            distance = distances[i]
            
            # Convert distance to relevance score
            relevance = max(0.0, 1.0 - distance) if distance is not None else 0.0
            
            # Build source identifier
            doc_id = metadata.get("doc_id", "unknown")
            title = metadata.get("title", doc_id)
            source = f"{title} ({doc_id})"
            
            context_chunks.append(
                ContextChunk(
                    text=doc_text,
                    source=source,
                    relevance=round(relevance, 4),
                )
            )
        
        return ContextResponse(context_chunks=context_chunks)
        
    except Exception as e:
        logger.error(f"Context retrieval failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Context retrieval failed: {str(e)}")


@router.delete("/embeddings/{paper_id}")
async def delete_embeddings(paper_id: str):
    """
    Delete all embeddings for a specific paper (both text and image chunks).
    """
    try:
        chroma = ChromaService()
        
        # Find all chunks for this paper_id (both text and image types)
        # Query without type filter to get everything with this doc_id
        data = chroma.collection.get(
            where={"doc_id": paper_id},
            include=["metadatas"],
        )
        
        ids_to_delete = data.get("ids", [])
        
        # Also check for any chunks with root_id or old ID patterns
        if not ids_to_delete:
            # Try with root_id (for repo files)
            root_data = chroma.collection.get(
                where={"root_id": paper_id},
                include=["metadatas"],
            )
            ids_to_delete = root_data.get("ids", [])
        
        # Delete from ChromaDB
        if ids_to_delete:
            chroma.delete(ids_to_delete)
            logger.info(f"Deleted {len(ids_to_delete)} chunks (text + images) for paper_id: {paper_id}")
        else:
            logger.warning(f"No chunks found to delete for paper_id: {paper_id}")
        
        # Remove from status tracking if present
        if paper_id in ingestion_status:
            del ingestion_status[paper_id]
        
        return JSONResponse({
            "success": True,
            "deleted_count": len(ids_to_delete),
        })
        
    except Exception as e:
        logger.error(f"Failed to delete embeddings for {paper_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete embeddings: {str(e)}")


# Debug endpoint to check extraction status
@router.get("/ingest/debug/all")
async def get_all_ingestion_statuses():
    """
    Debug endpoint to see all papers being tracked for ingestion.
    """
    return JSONResponse({
        "total_tracked": len(ingestion_status),
        "statuses": ingestion_status,
    })


@router.get("/ingest/debug/chromadb-check/{paper_id}")
async def debug_check_chromadb(paper_id: str):
    """
    Debug endpoint to check if a paper exists in ChromaDB.
    """
    try:
        chroma = ChromaService()
        
        # Check if paper exists in ChromaDB
        data = chroma.collection.get(
            where={"doc_id": paper_id},
            limit=10,
            include=["metadatas"],
        )
        
        chunk_count = len(data.get("ids", []))
        
        return JSONResponse({
            "paper_id": paper_id,
            "exists_in_chromadb": chunk_count > 0,
            "chunk_count": chunk_count,
            "sample_metadata": data.get("metadatas", [])[:3] if chunk_count > 0 else None,
        })
    except Exception as e:
        logger.error(f"Debug check failed for {paper_id}: {e}", exc_info=True)
        return JSONResponse({
            "paper_id": paper_id,
            "exists_in_chromadb": False,
            "error": str(e),
        })

