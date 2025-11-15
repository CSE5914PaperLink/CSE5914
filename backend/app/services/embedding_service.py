from __future__ import annotations

from typing import List, Optional

from langchain_nomic import NomicEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.services.docling_service import DoclingService
from app.services.chroma_service import ChromaService


class NomicEmbeddingService:
    """Service for local Nomic embeddings."""

    def __init__(self):
        self.embedder = NomicEmbeddings(
            model="nomic-embed-text-v1.5",
            inference_mode="local",
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        return self.embedder.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        return self.embedder.embed_query(text)


def ingest_pdf_bytes_into_chroma(
    pdf_bytes: bytes,
    doc_id: str,
    extra_metadata: Optional[dict] = None,
) -> None:
    docling = DoclingService()
    meta = docling.extract_from_bytes(pdf_bytes)
    markdown = meta.markdown or ""

    if not markdown.strip():
        raise RuntimeError("No content extracted from PDF")

    embedder = NomicEmbeddingService()
    chunks = embedder.splitter.create_documents([markdown])

    chunk_texts = [chunk.page_content for chunk in chunks]
    chunk_ids = [f"{doc_id}::chunk::{i}" for i in range(len(chunks))]
    embeddings = embedder.embed_texts(chunk_texts)

    base_metadata = {"doc_id": doc_id, "source": "docling", "format": "pdf"}
    if extra_metadata:
        base_metadata.update(extra_metadata)

    metadatas = [
        {**base_metadata, "chunk_index": i, "preview": text[:200]}
        for i, text in enumerate(chunk_texts)
    ]

    chroma = ChromaService()
    chroma.upsert(
        ids=chunk_ids,
        embeddings=embeddings,
        documents=chunk_texts,
        metadatas=metadatas,
    )

    print(f"Ingested {len(chunk_ids)} chunks for {doc_id}")
