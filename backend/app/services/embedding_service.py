from __future__ import annotations

from typing import List, Optional, Union, Dict, Any
from dataclasses import dataclass, asdict
import base64
from io import BytesIO
from PIL import Image
import shutil

from langchain_nomic import NomicEmbeddings
from langchain_community.vectorstores.utils import filter_complex_metadata
from langchain_core.documents import Document


from app.services.docling_service import DoclingService
from app.services.chroma_service import ChromaService
from app.core.config import settings

@dataclass
class PdfMetadata:
    """Structured metadata for PDF documents (e.g., arXiv papers)."""

    doc_id: str
    pdf_url: str
    title: str
    summary: str
    published: str
    authors: List[str]

@dataclass
class RepoMetadata:
    """Metadata for GitHub repositories."""
    repo_url: str
    readme: str
    arxiv_id: str
    filename: str

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
        """
        Embed text documents.
        Documents are automatically prefixed with 'search_document:' by the model.
        """
        return self.embedder.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        """
        Embed a single text query.
        Queries should be prefixed with 'search_query:' for optimal retrieval.
        """
        # Add search_query prefix if not already present
        return self.embedder.embed_query(text)

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
        if embeddings:
            print(f"DEBUG: First 5 dims of first image embedding: {embeddings[0][:5]}")
        return embeddings


def ingest_pdf_bytes_into_chroma(pdf_bytes: bytes, extra_metadata: PdfMetadata):
    docling = DoclingService()
    docs = docling.extract_from_bytes(pdf_bytes)

    image_info = docs["images"]
    chunk_info = docs["chunks"]

    embedder = NomicEmbeddingService()
    chroma = ChromaService(embedding_fn=embedder.embedder)

    chroma_text_docs = []
    # Text metadata: doc_id, title, type, page, bbox_*, headings
    for chunk in chunk_info:
        merged_meta = {
            **chunk["metadata"],  # docling chunk metadata
            "doc_id": extra_metadata.doc_id,
            "title": extra_metadata.title,
            "type": "text",
        }
        chroma_text_docs.append(
            Document(
                page_content=chunk["text"],
                metadata=merged_meta,
            )
        )
        print("\n\n\n\nChunk:", chunk["text"])
    chroma.vectorstore.add_documents(chroma_text_docs, embedding_fn=embedder.embedder)

    # Image metadata: doc_id, title, type, picture_number, page, caption, bbox_*
    for meta in image_info["metadatas"]:
        meta.update(
            {
                "doc_id": extra_metadata.doc_id,
                "title": extra_metadata.title,
                "type": "image",
            }
        )

    chroma.vectorstore.add_images(
        image_info["uris"],
        metadatas=image_info["metadatas"],
        ids=image_info["ids"],
    )

    # Cleanup
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
    repo_files: List[Dict[str, Any]],
    base_metadata: Dict[str, Any],
) -> int:
    """
    Ingest GitHub repo files (including README text) into Chroma.
    repo_files: each item should contain {"path": "...", "content": "..."}
    """
    embedder = NomicEmbeddingService()
    chroma = ChromaService(embedding_fn=embedder.embedder)

    documents = []
    readme_text = ""

    # 1) extract README if exists
    for f in repo_files:
        name = f.get("path", "").lower()
        if "readme" in name:
            readme_text = f.get("content") or ""

    # 2) generate metadata template
    for f in repo_files:
        text = f.get("content")
        if not text:
            continue

        filename = f.get("path", "unknown")

        merged_meta = {
            **base_metadata,  
            "repo_url": repo_url,
            "root_id": arxiv_id,  
            "type": "repo",
            "filename": filename,
            "github_readme": readme_text,
        }

        documents.append(
            Document(
                page_content=text,
                metadata=merged_meta,
            )
        )

    if documents:
        chroma.vectorstore.add_documents(documents, embedding_fn=embedder.embedder)

    return len(documents)
