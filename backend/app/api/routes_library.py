from __future__ import annotations

from typing import Optional, List
import json
import base64

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, Response
import httpx
from xml.etree import ElementTree as ET

from app.services.embedding_service import ingest_pdf_bytes_into_chroma
from app.services.chroma_service import ChromaService

router = APIRouter(prefix="/library", tags=["library"])

ARXIV_API = "https://export.arxiv.org/api/query"
UA = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"


@router.get("/debug/list_all")
def debug_list_all():
    """Debug endpoint to see all docs in Chroma with their image counts."""
    chroma = ChromaService()
    try:
        data = chroma.collection.get(include=["metadatas"], limit=100)
        
        # Group by doc_id and count images
        doc_info = {}
        for i, chunk_id in enumerate(data.get("ids", [])):
            md = (data.get("metadatas") or [{}])[i] or {}
            doc_id = md.get("doc_id", "unknown")
            
            if doc_id not in doc_info:
                images_json = md.get("images", "[]")
                try:
                    images = json.loads(images_json) if isinstance(images_json, str) else []
                    doc_info[doc_id] = {
                        "doc_id": doc_id,
                        "chunk_count": 1,
                        "image_count": len(images),
                        "sample_chunk_id": chunk_id,
                        "arxiv_id": md.get("arxiv_id"),
                        "title": md.get("title"),
                    }
                except:
                    doc_info[doc_id] = {
                        "doc_id": doc_id,
                        "chunk_count": 1,
                        "image_count": 0,
                        "sample_chunk_id": chunk_id,
                        "arxiv_id": md.get("arxiv_id"),
                        "title": md.get("title"),
                    }
            else:
                doc_info[doc_id]["chunk_count"] += 1
        
        return JSONResponse({"documents": list(doc_info.values()), "total_docs": len(doc_info)})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


def _fetch_arxiv_metadata(arxiv_id: str) -> dict:
    """Fetch minimal metadata (title, authors, summary, published) for a given arXiv id."""
    try:
        r = httpx.get(
            ARXIV_API,
            params={"id_list": arxiv_id},
            headers={"User-Agent": UA},
            timeout=30.0,
        )
    except httpx.HTTPError:
        return {}
    if r.status_code != 200:
        return {}
    try:
        root = ET.fromstring(r.text)
    except ET.ParseError:
        return {}
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    entry = root.find("atom:entry", ns)
    if entry is None:
        return {}

    def _t(tag: str) -> str:
        el = entry.find(f"atom:{tag}", ns)
        return (el.text or "").strip() if el is not None else ""

    title = _t("title")
    summary = _t("summary")
    published = _t("published")
    authors: List[str] = []
    for a in entry.findall("atom:author", ns):
        name_el = a.find("atom:name", ns)
        if name_el is not None and name_el.text:
            authors.append(name_el.text.strip())
    return {
        "title": title,
        "summary": summary,
        "published": published,
        "authors": authors,
    }


@router.post("/check_batch")
def check_batch_papers(arxiv_ids: List[str]):
    """Check if multiple papers exist in ChromaDB by their arxiv_ids."""
    chroma = ChromaService()
    results = {}
    
    # Build doc_ids for all papers
    doc_ids = [f"arxiv:{aid}" for aid in arxiv_ids]
    
    # Try to query all at once using where clause with OR conditions
    # This is much faster than individual queries
    try:
        # Get all chunks that match any of the doc_ids
        data = chroma.collection.get(
            include=["metadatas"],
            limit=10000  # High limit to catch all matching chunks
        )
        
        # Build set of doc_ids that exist
        existing_doc_ids = set()
        for i, chunk_id in enumerate(data.get("ids", [])):
            md = (data.get("metadatas") or [{}])[i] or {}
            if md.get("doc_id"):
                existing_doc_ids.add(md["doc_id"])
        
        # Check each arxiv_id
        for arxiv_id in arxiv_ids:
            doc_id = f"arxiv:{arxiv_id}"
            results[arxiv_id] = doc_id in existing_doc_ids
            
    except Exception as e:
        # If batch query fails, fall back to individual queries
        for arxiv_id in arxiv_ids:
            doc_id = f"arxiv:{arxiv_id}"
            try:
                data = chroma.collection.get(
                    where={"doc_id": doc_id},
                    limit=1,
                    include=[]
                )
                results[arxiv_id] = len(data.get("ids", [])) > 0
            except Exception:
                results[arxiv_id] = False
    
    return JSONResponse({"results": results})


@router.post("/add/{arxiv_id}")
async def add_arxiv(arxiv_id: str):
    """Download an arXiv PDF and ingest into vector DB."""
    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, connect=10.0),
        headers={"User-Agent": UA},
        follow_redirects=True,
    ) as client:
        r = await client.get(pdf_url)
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail="Failed to fetch PDF")
        pdf_bytes = r.content
    # Fetch and attach minimal metadata
    meta = _fetch_arxiv_metadata(arxiv_id)
    extra_md = {"arxiv_id": arxiv_id, "pdf_url": pdf_url, **meta}
    # Ingest (doc_id prefixes to avoid collisions)
    stats = ingest_pdf_bytes_into_chroma(
        pdf_bytes, doc_id=f"arxiv:{arxiv_id}", extra_metadata=extra_md
    )
    return JSONResponse({
        "status": "ok",
        "arxiv_id": arxiv_id,
        "metadata": extra_md,
        "ingestion": stats,
    })


@router.get("/list")
def list_library(limit: int = 500, offset: int = 0):
    chroma = ChromaService()
    # Chroma doesn't have simple list; use where filter hack by querying all with empty where
    # We'll store ids by doing a range over collection count (not exposed). Instead, rely on get with 'include'.
    # Workaround: use .get with no ids returns all (may be heavy). Limit manually.
    # Only fetch metadata, not documents, to reduce response size
    data = chroma.collection.get(
        include=["metadatas"], limit=limit, offset=offset
    )
    results = []
    for i, _id in enumerate(data.get("ids", [])):
        md = (data.get("metadatas") or [{}])[i] or {}
        results.append(
            {
                "id": _id,
                "metadata": md,
            }
        )
    return JSONResponse({"results": results, "count": len(results)})


@router.get("/chunks/{doc_id}")
def list_chunks(doc_id: str, limit: int = 200, offset: int = 0):
    """List chunk vectors for a given root document id."""
    chroma = ChromaService()
    try:
        data = chroma.collection.get(
            where={"kind": "chunk", "root_id": doc_id},
            include=["metadatas", "documents"],
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    results = []
    for i, _id in enumerate(data.get("ids", [])):
        md = (data.get("metadatas") or [{}])[i] or {}
        if md.get("kind") != "chunk":
            continue
        doc = (data.get("documents") or [None])[i]
        results.append(
            {
                "id": _id,
                "metadata": md,
                "document": doc,
            }
        )
    return JSONResponse({"results": results, "count": len(results)})


@router.delete("/delete/{doc_id}")
def delete_item(doc_id: str):
    """Delete a paper/vector by its id in the Chroma collection."""
    chroma = ChromaService()

    try:
        # If the provided id is a root document id (not a chunk id), delete all
        # entries that belong to that root (metadata.doc_id == doc_id or id startswith root::chunk::).
        to_delete = []

        # Fetch all items and filter - Chroma .get with where can be used but not all deployments support complex filters.
        data = chroma.collection.get(include=["metadatas", "documents"])
        for i, _id in enumerate(data.get("ids", [])):
            md = (data.get("metadatas") or [{}])[i] or {}
            # If metadata stores doc_id, compare; else check chunk prefix
            if (
                md.get("doc_id") == doc_id
                or str(_id).startswith(f"{doc_id}::chunk::")
                or str(_id) == doc_id
            ):
                to_delete.append(_id)

        if not to_delete:
            # Fall back: try to delete the exact id if present
            chroma.delete([doc_id])
            return JSONResponse({"status": "deleted", "id": doc_id})

        chroma.delete(to_delete)
        return JSONResponse({"status": "deleted", "deleted_count": len(to_delete)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/images/{doc_id}")
def get_images(doc_id: str):
    """Retrieve all images for a document from Chroma metadata."""
    chroma = ChromaService()
    try:
        print(f"DEBUG: Fetching images for doc_id={doc_id}")
        # Fetch chunks for this doc_id
        data = chroma.collection.get(
            where={"doc_id": doc_id},
            include=["metadatas"],
            limit=1,  # only need one chunk to get images (all chunks share same images)
        )
        print(f"DEBUG: Found {len(data.get('ids', []))} chunks for doc_id={doc_id}")
        
        if not data.get("ids"):
            return JSONResponse({"images": []})
        
        md = (data.get("metadatas") or [{}])[0] or {}
        images_json = md.get("images", "[]")
        print(f"DEBUG: Raw images_json: {images_json[:200] if images_json else 'None'}")
        images = json.loads(images_json) if isinstance(images_json, str) else []
        print(f"DEBUG: Parsed {len(images)} images")
        
        return JSONResponse({"doc_id": doc_id, "images": images})
    except Exception as e:
        print(f"DEBUG: Error fetching images: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/images/{doc_id}/{filename}")
def get_image_file(doc_id: str, filename: str):
    """Serve a specific image file as binary data."""
    chroma = ChromaService()
    try:
        data = chroma.collection.get(
            where={"doc_id": doc_id},
            include=["metadatas"],
            limit=1,
        )
        if not data.get("ids"):
            raise HTTPException(status_code=404, detail="Document not found")
        
        md = (data.get("metadatas") or [{}])[0] or {}
        images_json = md.get("images", "[]")
        images = json.loads(images_json) if isinstance(images_json, str) else []
        
        for img in images:
            if img.get("filename") == filename:
                img_bytes = base64.b64decode(img["data_base64"])
                media_type = img.get("media_type") or "image/png"
                return Response(content=img_bytes, media_type=media_type)
        
        raise HTTPException(status_code=404, detail="Image not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
