from __future__ import annotations

from typing import List, Optional, Union, Dict, Any
from dataclasses import dataclass, asdict
import base64
from io import BytesIO
from PIL import Image
import shutil
import re
import numpy as np

from langchain_nomic import NomicEmbeddings
from langchain_community.vectorstores.utils import filter_complex_metadata
from langchain_core.documents import Document

from app.services.docling_service import DoclingService
from app.services.chroma_service import ChromaService
from app.core.config import settings

# Metadata classes

@dataclass
class PdfMetadata:
    """Structured metadata for PDF documents (e.g., arXiv papers)."""

    doc_id: str
    pdf_url: str
    title: str
    summary: str
    published: str
    authors: List[str]

    github_url: Optional[str] = None
    github_readme: Optional[str] = None

@dataclass
class RepoMetadata:
    """Metadata for GitHub repositories."""
    repo_url: str
    readme: str
    arxiv_id: str
    filename: str


# Embedding Service Wrapper
class NomicEmbeddingService:
    """Service for local Nomic embeddings with multimodal support."""

    def __init__(self):
        self.embedder = NomicEmbeddings(  # type: ignore[call-arg]
            model="nomic-embed-text-v1.5",
            inference_mode="remote",
            nomic_api_key=settings.nomic_api_key,
            vision_model="nomic-embed-vision-v1.5",
        )

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.embedder.embed_documents(texts)
        # L2 Normalize
        return [self._normalize(e) for e in embeddings]

    def _normalize(self, vector: List[float]) -> List[float]:
        """Manual L2 normalization to ensure unit length."""
        arr = np.array(vector)
        norm = np.linalg.norm(arr)
        if norm == 0:
            return vector
        return (arr / norm).tolist()

    def embed_query(self, text: str) -> List[float]:
        """
        Embed a single text query.
        Queries should be prefixed with 'search_query:' for optimal retrieval.
        """
        # Add search_query prefix if not already present
        normalized = text if text.strip().startswith("search_query:") else f"search_query: {text}"
        emb = self.embedder.embed_query(normalized)
        return self._normalize(emb)

    # (Vision embedding disabled for simplicity — can re-enable easily)
    def embed_images(
        self, images: List[Union[Image.Image, bytes, str]]
    ) -> List[List[float]]:
        """
        Embed images using nomic-embed-vision-v1.5.

        Args:
            images: List of PIL Images, raw bytes, or base64 strings

        Returns:
            List of embedding vectors
        """
        # Convert all images to PIL Images for Nomic vision model
        # The nomic.embed.image() function accepts PIL Images and converts them internally
        pil_images = []
        for img in images:
            if isinstance(img, Image.Image):
                pil_images.append(img)
            elif isinstance(img, bytes):
                pil_images.append(Image.open(BytesIO(img)))
            elif isinstance(img, str):
                # Assume base64 encoded string
                img_bytes = base64.b64decode(img)
                pil_images.append(Image.open(BytesIO(img_bytes)))
            else:
                raise ValueError(f"Unsupported image type: {type(img)}")

        embeddings = self.embedder.embed_image(pil_images)
        dim = len(embeddings[0]) if embeddings else 0
        print(f"DEBUG: Nomic returned {len(embeddings)} image embeddings, dim={dim}")
        
        # Normalize image embeddings too
        normalized_embeddings = [self._normalize(e) for e in embeddings]
        
        if normalized_embeddings:
            print(f"DEBUG: First 5 dims of first image embedding: {normalized_embeddings[0][:5]}")
        return normalized_embeddings


# Utility: extract GitHub URL from PDF text

def extract_github_url(text: str) -> Optional[str]:
    """
    Extract a GitHub repository URL from text.
    Example matches:
        https://github.com/owner/repo
    """
    pattern = r"https://github\.com/[A-Za-z0-9_-]+/[A-Za-z0-9_-]+"
    match = re.search(pattern, text)
    return match.group(0) if match else None


def ingest_pdf_bytes_into_chroma(pdf_bytes: bytes, extra_metadata: PdfMetadata):
    """
    Extract text & images using Docling, embed them using Nomic,
    store into Chroma vector DB.
    """

    docling = DoclingService()
    docs = docling.extract_from_bytes(pdf_bytes)

    image_info = docs["images"]
    chunk_info = docs["chunks"]

    embedder = NomicEmbeddingService()
    chroma = ChromaService(embedding_fn=embedder.embedder)

    chroma_text_docs = []
    detected_repo_url = None

    for chunk in chunk_info:
        text = chunk["text"]

        # Try detecting GitHub repo URL once
        if detected_repo_url is None:
            detected_repo_url = extract_github_url(text)

        merged_meta = {
            **chunk["metadata"],
            "doc_id": extra_metadata.doc_id,
            "title": extra_metadata.title,
            "type": "text",
        }

        chroma_text_docs.append(
            Document(
                page_content=text,
                metadata=merged_meta,
            )
        )

    # Save GitHub URL into PdfMetadata
    if detected_repo_url:
        extra_metadata.github_url = detected_repo_url

    chroma.vectorstore.add_documents(chroma_text_docs, embedding_fn=embedder.embedder)



    # Process and store images as text embeddings
    if image_info["uris"]:
        print(f"Processing {len(image_info['uris'])} images with text annotations...")
        try:
            # Create documents from image descriptions (caption + annotation)
            chroma_image_docs = []
            
            for meta in image_info["metadatas"]:
                caption = meta.get("caption", "")
                annotation = meta.get("annotation", "")
                print(f"Caption: {caption}")
                print(f"Annotation: {annotation}")
                # Combine caption and annotation as the searchable text
                description = f"{caption}\n\n{annotation}" if annotation else caption
                
                if not description.strip():
                    # Skip images with no description
                    continue
                
                # Update metadata with doc info (keep image_b64 for retrieval)
                merged_meta = {
                    **meta,
                    "doc_id": extra_metadata.doc_id,
                    "title": extra_metadata.title,
                    "type": "image",
                }
                
                chroma_image_docs.append(
                    Document(
                        page_content=description,
                        metadata=merged_meta,
                    )
                )
            
            if chroma_image_docs:
                # Add using standard add_documents (embeds the text descriptions)
                # Filter metadata for ChromaDB compatibility
                filtered_image_docs = filter_complex_metadata(chroma_image_docs)
                chroma.vectorstore.add_documents(filtered_image_docs)
                print(f"Successfully added {len(chroma_image_docs)} images (as text embeddings) to Chroma.")
            else:
                print("No images with descriptions to embed.")

        except Exception as e:
            print(f"Error embedding/storing image descriptions: {e}")

    if image_info["tmp_dir"]:
        shutil.rmtree(image_info["tmp_dir"], ignore_errors=True)

    print(
        f"INGESTED PDF: {len(chunk_info)} text chunks, {len(image_info['uris'])} image chunks"
    )

    return {
        "text_chunks": len(chunk_info),
        "image_chunks": len(image_info["uris"]),
    }

def ingest_repo_files_into_chroma(
    repo_url: str,
    arxiv_id: str,
    repo_files: List[Any],
    base_metadata: Dict[str, Any],
) -> int:

    embedder = NomicEmbeddingService()
    chroma = ChromaService(embedding_fn=embedder.embedder)

    documents = []
    readme_text = ""

    # Detect README
    for f in repo_files:
        if hasattr(f, "path"):   # RepoFile object
            path = f.path.lower()
            content = f.content
        else:                    
            path = f.get("path", "").lower()
            content = f.get("content", "")

        if "readme" in path:
            readme_text = content or ""

    # Attach README to metadata
    base_metadata["github_readme"] = readme_text

    # Build documents
    for f in repo_files:
        if hasattr(f, "path"):
            path = f.path
            content = f.content
        else:
            path = f.get("path", "")
            content = f.get("content", "")

        if not content:
            continue

        merged_meta = {
            **base_metadata,
            "doc_id": arxiv_id, 
            "repo_url": repo_url,
            "root_id": arxiv_id,
            "type": "repo",
            "filename": path,
            "github_readme": readme_text,
            "kind": "chunk",  
        }

        documents.append(
            Document(
                page_content=content,
                metadata=merged_meta,
            )
        )

    if documents:
        filtered_docs = filter_complex_metadata(documents)
        chroma.vectorstore.add_documents(filtered_docs, embedding_fn=embedder.embedder)

    return len(documents)
