from __future__ import annotations

from typing import List, Optional, Union
import json
import base64
from io import BytesIO

from langchain_nomic import NomicEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from PIL import Image

from app.services.docling_service import DoclingService, ImageAsset
from app.services.chroma_service import ChromaService


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
            chunk_overlap=200,
        )

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed text documents."""
        return self.embedder.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        """Embed a single text query."""
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
    doc_id: str,
    extra_metadata: Optional[dict] = None,
) -> dict:
    """
    Ingest PDF into Chroma with text chunks and separately embedded images.
    Returns dict with ingestion stats including image count.
    """
    docling = DoclingService()
    meta = docling.extract_from_bytes(pdf_bytes)
    markdown = meta.markdown or ""

    if not markdown.strip():
        raise RuntimeError("No content extracted from PDF")

    embedder = NomicEmbeddingService()

    # Process text chunks
    chunks = embedder.splitter.create_documents([markdown])
    chunk_texts = [chunk.page_content for chunk in chunks]
    chunk_ids = [f"{doc_id}::chunk::{i}" for i in range(len(chunks))]
    text_embeddings = embedder.embed_texts(chunk_texts)
    emb_dim = (
        len(text_embeddings[0]) if text_embeddings and text_embeddings[0] else None
    )

    base_metadata = {"doc_id": doc_id, "source": "docling", "format": "pdf"}
    if extra_metadata:
        base_metadata.update(extra_metadata)

    # Create metadata for text chunks
    text_metadatas = [
        {
            **base_metadata,
            "chunk_index": i,
            "chunk_type": "text",
        }
        for i, text in enumerate(chunk_texts)
    ]

    # Prepare lists for all items (text + images)
    all_ids = chunk_ids.copy()
    all_embeddings = text_embeddings.copy()
    all_documents = chunk_texts.copy()
    all_metadatas = text_metadatas.copy()

    # Process and embed images separately
    images = meta.images or []
    if images:
        print(f"DEBUG: Embedding {len(images)} images from {doc_id}")

        # Prepare images for embedding (use base64 data)
        image_data_list = []
        for img in images:
            try:
                # Decode base64 to bytes
                img_bytes = base64.b64decode(img.data_base64)
                image_data_list.append(img_bytes)
            except Exception as e:
                print(f"DEBUG: Failed to decode image {img.filename}: {e}")
                continue

        # Embed all images at once
        if image_data_list:
            try:
                image_embeddings = embedder.embed_images(image_data_list)
                print(f"DEBUG: Successfully embedded {len(image_embeddings)} images")
                print(f"DEBUG: Image embedding dim = {len(image_embeddings[0])}")
                print(
                    f"DEBUG: First image embedding sample = {image_embeddings[0][:5]}"
                )
                # Add image embeddings to Chroma with metadata including bounding boxes
                for idx, (img, img_emb) in enumerate(zip(images, image_embeddings)):
                    # Extract bounding box from image asset
                    bbox_data = img.bbox  # Dict with keys: l, r, t, b (PDF coordinates)
                    page_no = img.page

                    img_id = f"{doc_id}::image::{idx}"
                    img_metadata = {
                        **base_metadata,
                        "chunk_type": "image",
                        "image_index": idx,
                        "filename": img.filename,
                        "media_type": img.media_type or "image/png",
                        "page": page_no,
                        # Store base64 for later retrieval (sanitize will convert to JSON string if needed)
                        "image_data": img.data_base64,
                    }

                    # Add bounding box if available (will be JSON-serialized by sanitize)
                    if bbox_data:
                        img_metadata["bbox"] = bbox_data
                        img_metadata["bbox_left"] = bbox_data.get("l", 0.0)
                        img_metadata["bbox_right"] = bbox_data.get("r", 0.0)
                        img_metadata["bbox_top"] = bbox_data.get("t", 0.0)
                        img_metadata["bbox_bottom"] = bbox_data.get("b", 0.0)

                    # Create a simple document text for the image
                    img_doc = f"Image: {img.filename} from page {page_no}"
                    if bbox_data:
                        img_doc += f" (bbox: l={bbox_data.get('l'):.1f}, r={bbox_data.get('r'):.1f}, t={bbox_data.get('t'):.1f}, b={bbox_data.get('b'):.1f})"

                    all_ids.append(img_id)
                    all_embeddings.append(img_emb)
                    all_documents.append(img_doc)
                    all_metadatas.append(img_metadata)

            except Exception as e:
                print(f"DEBUG: Failed to embed images: {e}")
                import traceback

                traceback.print_exc()

    # Upsert all items (text chunks + images) to Chroma
    chroma = ChromaService(embedding_dim=emb_dim)
    chroma.upsert(
        ids=all_ids,
        embeddings=all_embeddings,
        documents=all_documents,
        metadatas=all_metadatas,
    )

    print("DEBUG: Verifying Chroma contents for this doc_id...")
    res = chroma.collection.get(
        where={"doc_id": doc_id},
        include=["metadatas"],
    )
    n_text = sum(1 for m in res["metadatas"] if m.get("chunk_type") == "text")
    n_image = sum(1 for m in res["metadatas"] if m.get("chunk_type") == "image")
    print(
        f"DEBUG: Chroma has {n_text} text chunks and {n_image} image chunks for doc_id={doc_id}"
    )

    print(
        f"Ingested {len(chunk_ids)} text chunks and {len(images)} image embeddings for {doc_id}"
    )
    return {"text_chunks": len(chunk_ids), "image_chunks": len(images)}
