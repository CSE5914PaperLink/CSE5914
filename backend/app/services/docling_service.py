from __future__ import annotations

import tempfile
from dataclasses import dataclass, field
from typing import Any, List, Optional, Sequence, Set

from docling.document_converter import DocumentConverter
from docling.chunking import HierarchicalChunker


@dataclass
class DoclingMetadata:
    """
    Minimal metadata extracted from a PDF using Docling: full markdown export.
    """

    markdown: Optional[str] = None
    chunks: List["DocChunkMetadata"] = field(default_factory=list)


@dataclass
class DocChunkMetadata:
    """Lightweight chunk metadata for downstream retrieval/highlighting."""

    index: int
    text: str
    headings: Sequence[str]
    page_numbers: Sequence[int]


class DoclingService:
    """
    Service wrapper around Docling to convert documents and derive metadata.

    Usage:
        svc = DoclingService()
        meta = svc.extract_from_bytes(pdf_bytes)
        # or
        meta = svc.extract_from_url(url)
    """

    def __init__(self) -> None:
        self._converter = DocumentConverter()
        self._chunker = HierarchicalChunker()

    def extract_from_url(self, url: str) -> DoclingMetadata:
        result = self._converter.convert(url)
        return self._extract_metadata(result)

    def extract_from_bytes(self, pdf_bytes: bytes) -> DoclingMetadata:
        # Docling accepts file paths or URLs; write bytes to a temp file
        with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
            tmp.write(pdf_bytes)
            tmp.flush()
            result = self._converter.convert(tmp.name)
        return self._extract_metadata(result)

    def _extract_metadata(self, convert_result: Any) -> DoclingMetadata:
        doc = convert_result.document

        # Export to markdown
        try:
            markdown: str = doc.export_to_markdown()
        except Exception:
            markdown = getattr(doc, "export_to_text", lambda: "")()

        meta = DoclingMetadata()
        meta.markdown = markdown
        try:
            meta.chunks = self._extract_chunks(doc)
        except Exception:
            meta.chunks = []

        return meta

    def _extract_chunks(self, doc: Any) -> List[DocChunkMetadata]:
        chunk_infos: List[DocChunkMetadata] = []
        for idx, chunk in enumerate(self._chunker.chunk(doc)):
            text = (chunk.text or "").strip()
            if not text:
                continue
            headings: Sequence[str] = [
                h.strip()
                for h in (getattr(chunk.meta, "headings", None) or [])
                if isinstance(h, str) and h.strip()
            ]
            pages: Set[int] = set()
            for item in getattr(chunk.meta, "doc_items", []) or []:
                for prov in getattr(item, "prov", []) or []:
                    page_no = getattr(prov, "page_no", None)
                    if page_no is None:
                        continue
                    try:
                        pages.add(int(page_no) + 1)
                    except (ValueError, TypeError):
                        continue
            chunk_infos.append(
                DocChunkMetadata(
                    index=idx,
                    text=text,
                    headings=headings,
                    page_numbers=sorted(pages),
                )
            )
        if not chunk_infos and doc is not None:
            fallback_text = getattr(doc, "export_to_text", lambda: "")()
            if fallback_text.strip():
                chunk_infos.append(
                    DocChunkMetadata(
                        index=0,
                        text=fallback_text.strip(),
                        headings=[],
                        page_numbers=[],
                    )
                )
        return chunk_infos
