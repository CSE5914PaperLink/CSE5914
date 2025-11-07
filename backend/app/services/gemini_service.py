from __future__ import annotations

from typing import Iterable, List, Optional, Sequence, Any

from google import genai
from google.genai import types

from app.core.config import settings
from app.services.docling_service import DocChunkMetadata, DoclingService
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
        *,
        task_type: str = "retrieval_document",
        output_dimensionality: Optional[int] = None,
    ) -> List[List[float]]:
        """Embed a batch of texts. Returns list of vectors in the same order."""
        cfg = types.EmbedContentConfig(
            output_dimensionality=output_dimensionality,
            task_type=task_type,
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
    # Ensure a typed list of DocChunkMetadata and filter out empty texts
    chunk_payloads: List[DocChunkMetadata] = [
        c for c in (meta.chunks or []) if (getattr(c, "text", "") or "").strip()
    ]
    if not chunk_payloads and markdown.strip():
        # No chunks from Docling; we'll fallback to splitting the markdown if chunking is desired
        chunk_payloads = [
            DocChunkMetadata(
                index=0, text=markdown.strip(), headings=[], page_numbers=[]
            )
        ]

    # Optional fallback: if only a single large chunk or no chunks, split markdown into overlapping chunks
    def _split_markdown(md: str, target: int, overlap: int) -> List[DocChunkMetadata]:
        # Paragraph-aware greedy splitter with character budget and overlap
        paragraphs = [p.strip() for p in md.split("\n\n") if p.strip()]
        pieces: List[str] = []
        cur: List[str] = []
        cur_len = 0
        for p in paragraphs:
            sep = "\n\n" if cur else ""
            add_len = (2 if sep else 0) + len(p)
            if cur_len + add_len <= target:
                cur.append(p)
                cur_len += add_len
            else:
                if cur:
                    pieces.append(sep.join(cur) if sep else "".join(cur))
                cur = [p]
                cur_len = len(p)
        if cur:
            pieces.append("\n\n".join(cur))

        # Apply simple overlap by carrying tail of previous chunk
        if overlap > 0 and len(pieces) > 1:
            with_overlap: List[str] = []
            tail_chars = max(0, overlap)
            prev_tail = ""
            for i, piece in enumerate(pieces):
                if i > 0 and prev_tail:
                    merged = (prev_tail + "\n\n" + piece).strip()
                else:
                    merged = piece
                with_overlap.append(merged)
                prev_tail = piece[-tail_chars:]
            pieces = with_overlap

        return [
            DocChunkMetadata(index=i, text=s, headings=[], page_numbers=[])
            for i, s in enumerate(pieces)
            if s.strip()
        ]

    prepared_chunks: List[DocChunkMetadata] = []
    if chunk and markdown.strip():
        if chunk_payloads:
            # Use Docling chunks, but further split any chunk that exceeds chunk_size
            for c in chunk_payloads:
                text = c.text.strip()
                if not text:
                    continue
                if len(text) > chunk_size:
                    pieces = _split_markdown(text, chunk_size, chunk_overlap)
                    # Preserve source index/headings/pages on derived pieces
                    for p in pieces:
                        prepared_chunks.append(
                            DocChunkMetadata(
                                index=c.index,
                                text=p.text,
                                headings=c.headings,
                                page_numbers=c.page_numbers,
                            )
                        )
                else:
                    prepared_chunks.append(c)
        else:
            # No chunks available; split whole markdown
            prepared_chunks = _split_markdown(markdown, chunk_size, chunk_overlap)
    else:
        prepared_chunks = chunk_payloads or [
            DocChunkMetadata(
                index=0, text=markdown.strip(), headings=[], page_numbers=[]
            )
        ]

    # Short-circuit if there's nothing to embed
    if not markdown.strip():
        raise RuntimeError("No markdown extracted from PDF; cannot embed")

    # Prepare chunk text payloads (keeping insertion order for deterministic ids)
    chunk_texts: List[str] = [c.text for c in prepared_chunks]
    chunk_ids: List[str] = [
        f"{doc_id}::chunk::{str(i).zfill(4)}" for i, _ in enumerate(prepared_chunks)
    ]

    # Debug log: how many chunks will be ingested
    try:
        print(
            f"[ingest] doc_id={doc_id} markdown_len={len(markdown)} chunks={len(prepared_chunks)}"
        )
    except Exception:
        pass

    # Get embedding(s) for doc-level markdown + each chunk
    embedder = GeminiEmbeddingService()
    to_embed: List[str] = [markdown] + chunk_texts
    vectors = embedder.embed_texts(to_embed, task_type="retrieval_document")
    if len(vectors) != len(to_embed):
        raise RuntimeError("Embedding service returned mismatched vector count")
    doc_vector = vectors[0]
    chunk_vectors = vectors[1:]

    # Prepare metadata
    base_md = {
        "doc_id": doc_id,
        "source": "docling",
        "format": "pdf",
        "length": len(markdown),
    }
    if extra_metadata:
        base_md.update({k: v for k, v in extra_metadata.items() if k not in base_md})

    doc_metadata = {**base_md, "kind": "doc", "chunk_count": len(prepared_chunks)}

    chunk_metadatas: List[dict] = []
    for storage_index, c in enumerate(prepared_chunks):
        headings = list(c.headings)
        chunk_metadatas.append(
            {
                **base_md,
                "kind": "chunk",
                "root_id": doc_id,
                "chunk_index": storage_index,
                "chunk_source_index": c.index,
                "headings": headings,
                "page_numbers": list(c.page_numbers),
                "preview": c.text[:300],
            }
        )

    all_ids = [doc_id] + chunk_ids
    all_embeddings = [doc_vector] + chunk_vectors
    all_documents = [markdown] + chunk_texts
    all_metadatas = [doc_metadata] + chunk_metadatas

    # Upsert into Chroma
    chroma = ChromaService()
    chroma.upsert(
        ids=all_ids,
        embeddings=all_embeddings,
        documents=all_documents,
        metadatas=all_metadatas,
    )
