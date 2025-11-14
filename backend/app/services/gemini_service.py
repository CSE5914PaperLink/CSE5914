from __future__ import annotations

import logging
from typing import Iterable, List, Optional, Sequence, Any

from google import genai
from google.genai import types

from app.core.config import settings
from app.services.docling_service import DoclingService
from app.services.chroma_service import ChromaService
from app.services.github_service import RepoFile

logger = logging.getLogger(__name__)


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


def ingest_repo_files_into_chroma(
    repo_url: str,
    arxiv_id: str,
    repo_files: list[RepoFile],
    base_metadata: Optional[dict] = None,
) -> int:
    """Ingest GitHub repository files into Chroma DB.

    Takes a list of RepoFile objects, generates embeddings for their content,
    and upserts them into Chroma with metadata linking back to the arxiv_id.

    Args:
        repo_url: GitHub repository URL (used in IDs and metadata).
        arxiv_id: arXiv paper ID (used for linking).
        repo_files: List of RepoFile objects to ingest.
        base_metadata: Optional base metadata dict to merge into all records.

    Returns:
        Number of files successfully ingested.
    """
    if not repo_files:
        logger.info(f"No repo files to ingest for {repo_url}")
        return 0

    # Filter files: skip very large content to avoid token limits
    MAX_CONTENT_LENGTH = 50000
    filtered_files = []
    for f in repo_files:
        if len(f.content) > MAX_CONTENT_LENGTH:
            logger.debug(
                f"Skipping {f.path} from {repo_url} (size {len(f.content)} > {MAX_CONTENT_LENGTH})"
            )
            continue
        filtered_files.append(f)

    if not filtered_files:
        logger.warning(f"All files from {repo_url} exceeded size limit")
        return 0

    # Get embeddings for all file contents
    embedder = GeminiEmbeddingService()
    texts = [f.content for f in filtered_files]

    try:
        vectors = embedder.embed_texts(texts)
    except Exception as e:
        logger.error(f"Failed to embed repo files from {repo_url}: {e}")
        return 0

    if len(vectors) != len(filtered_files):
        logger.error(
            f"Embedding count mismatch: got {len(vectors)} vectors for {len(filtered_files)} files"
        )
        return 0

    # Build Chroma upsert data
    ids = []
    embeddings = []
    documents = []
    metadatas = []

    for file, vector in zip(filtered_files, vectors):
        # Create unique ID combining arxiv_id, repo, and file path
        file_id = f"{arxiv_id}|github|{repo_url}|{file.path}"
        ids.append(file_id)
        embeddings.append(vector)
        documents.append(file.content)

        # Build metadata
        md = {
            "arxiv_id": arxiv_id,
            "source": "github",
            "repo_url": repo_url,
            "file_path": file.path,
            "language": file.language,
            "kind": file.kind,
            "content_type": f"github_{file.kind}",
            "length": len(file.content),
        }
        if base_metadata:
            md.update({k: v for k, v in base_metadata.items() if k not in md})
        metadatas.append(md)

    # Upsert into Chroma
    try:
        chroma = ChromaService()
        chroma.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
        logger.info(
            f"Ingested {len(ids)} repo files from {repo_url} for arxiv_id {arxiv_id}"
        )
        return len(ids)
    except Exception as e:
        logger.error(f"Failed to upsert repo files to Chroma: {e}")
        return 0
