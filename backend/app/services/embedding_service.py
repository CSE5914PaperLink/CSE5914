from __future__ import annotations

from typing import List, Optional, Union, Dict, Any
from dataclasses import dataclass, asdict
import base64
from io import BytesIO
from PIL import Image
import shutil

from langchain_nomic import NomicEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.utils import filter_complex_metadata


from app.services.docling_service import DoclingService
from app.services.chroma_service import ChromaService


@dataclass
class PdfMetadata:
    """Structured metadata for PDF documents (e.g., arXiv papers)."""

    doc_id: str
    pdf_url: str
    title: str
    summary: str
    published: str
    authors: List[str]


class NomicEmbeddingService:
    """Service for local Nomic embeddings with multimodal support."""

    def __init__(self):
        self.embedder = NomicEmbeddings(  # type: ignore[call-arg]
            model="nomic-embed-text-v1.5",
            inference_mode="local",
            vision_model="nomic-embed-vision-v1.5",
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            length_function=len,
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


def ingest_pdf_bytes_into_chroma(
    pdf_bytes: bytes,
    extra_metadata: PdfMetadata,
) -> dict:
    """
    Ingest PDF into Chroma with text chunks and separately embedded images.
    Returns dict with ingestion stats including image count.

    Args:
        pdf_bytes: Raw PDF bytes
        extra_metadata: Structured metadata (e.g., arXiv paper info)
    """
    docling = DoclingService()
    docs = docling.extract_from_bytes(pdf_bytes)
    docling_doc, markdown, image_info = (
        docs["doc"],
        docs["markdown"],
        docs["images"],
    )

    embedder = NomicEmbeddingService()
    chroma = ChromaService(embedding_fn=embedder.embedder)

    # Process text chunks - add 'type' field to metadata
    base_metadata = asdict(extra_metadata)
    base_metadata["type"] = "text"  # Add type field for text chunks

    chunks = embedder.splitter.create_documents([markdown], metadatas=[base_metadata])

    chroma.vectorstore.add_documents(
        filter_complex_metadata(chunks), embedding_fn=embedder.embedder
    )

    # Add 'type' field to image metadata
    for img_meta in image_info["metadatas"]:
        img_meta["doc_id"] = extra_metadata.doc_id
        img_meta["title"] = extra_metadata.title
        img_meta["type"] = "image"
    print("DEBUG: Text chunk metadatas:", getattr(chunks[0], "metadata", {}).keys())
    print("DEBUG: Image chunk metadatas:", image_info["metadatas"][0].keys())
    chroma.vectorstore.add_images(
        image_info["uris"],
        metadatas=image_info["metadatas"],
        ids=image_info["ids"],
    )

    if image_info["tmp_dir"]:
        shutil.rmtree(image_info["tmp_dir"], ignore_errors=True)

    print(
        f"INGESTED PDF: {len(chunks)} text chunks, {len(image_info['uris'])} image chunks"
    )

    return {"text_chunks": len(chunks), "image_chunks": len(image_info["uris"])}
