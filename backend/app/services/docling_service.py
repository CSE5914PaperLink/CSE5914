from __future__ import annotations

import os
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
        # Docling accepts file paths or URLs. On Windows, libraries cannot
        # reopen a NamedTemporaryFile while it's still open. Use a temp
        # directory so the file is closed before conversion.
        with tempfile.TemporaryDirectory() as td:
            tmp_path = os.path.join(td, "input.pdf")
            with open(tmp_path, "wb") as f:
                f.write(pdf_bytes)
            result = self._converter.convert(tmp_path)
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
