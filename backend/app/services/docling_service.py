from __future__ import annotations

import tempfile
from dataclasses import dataclass
from typing import Any, Optional

from docling.document_converter import DocumentConverter


@dataclass
class DoclingMetadata:
    """
    Minimal metadata extracted from a PDF using Docling: full markdown export.
    """

    markdown: Optional[str] = None


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

        return meta
