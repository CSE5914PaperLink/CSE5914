from __future__ import annotations

from typing import Iterable, List, Optional, Sequence, Any

from google import genai
from google.genai import types

from app.core.config import settings
from app.services.docling_service import DoclingService
from app.services.chroma_service import ChromaService


class GeminiEmbeddingService:
    """Service to create embeddings using Google Gemini."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self._api_key = api_key or settings.gemini_api_key
        if not self._api_key:
            raise RuntimeError("Gemini API key not configured")
        self._client = genai.Client(api_key=self._api_key)
        self._model = model or settings.gemini_embedding_model

    def embed_texts(
        self,
        texts: Sequence[str],
        output_dimensionality: Optional[int] = None,
    ) -> List[List[float]]:
        """Embed a batch of texts. Returns list of vectors in the same order."""
        cfg = types.EmbedContentConfig(
            output_dimensionality=output_dimensionality, task_type="retrieval_document"
        )
        # The Gemini API accepts at most 100 items per BatchEmbedContentsRequest.
        # Split into chunks of up to 100 and aggregate results while preserving order.
        max_batch = 100
        vectors: List[List[float]] = []

        texts_list = list(texts)
        for i in range(0, len(texts_list), max_batch):
            batch = texts_list[i : i + max_batch]
            # The SDK typing is strict; pass a list[str] at runtime and silence static type check
            resp = self._client.models.embed_content(
                model=self._model,
                contents=batch,  # type: ignore[arg-type]
                config=cfg,
            )

            resp_any: Any = resp
            if hasattr(resp_any, "embeddings"):
                vectors.extend([list(e.values) for e in resp_any.embeddings])
            elif hasattr(resp_any, "embedding"):
                # Single-item response
                vectors.append(list(resp_any.embedding.values))
            else:
                # Unexpected shape; raise to surface the issue early
                raise RuntimeError(
                    "Unexpected embedding response shape from Gemini API"
                )

        return vectors


def ingest_pdf_bytes_into_chroma(
    pdf_bytes: bytes,
    doc_id: str,
    extra_metadata: Optional[dict] = None,
    *,
    chunk: bool = True,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> None:
    """Pipeline: PDF bytes -> Docling markdown -> Gemini embeddings -> Chroma upsert.

    For now, embeds the full markdown as a single vector. Chunking can be added later.
    """
    # Extract markdown via Docling
    docling = DoclingService()
    meta = docling.extract_from_bytes(pdf_bytes)
    markdown = meta.markdown or ""

    # Short-circuit if there's nothing to embed
    if not markdown.strip():
        raise RuntimeError("No markdown extracted from PDF; cannot embed")

    # Get embedding(s)
    embedder = GeminiEmbeddingService()
    texts = [markdown]
    vectors = embedder.embed_texts(texts)

    # Prepare metadata
    base_md = {
        "doc_id": doc_id,
        "source": "docling",
        "format": "pdf",
        "length": len(markdown),
    }
    if extra_metadata:
        base_md.update({k: v for k, v in extra_metadata.items() if k not in base_md})

    # Upsert into Chroma
    chroma = ChromaService()
    chroma.upsert(
        ids=[doc_id],
        embeddings=vectors,
        documents=texts,
        metadatas=[base_md],
    )
