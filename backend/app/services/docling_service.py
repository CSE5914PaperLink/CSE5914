from __future__ import annotations

import os
import tempfile
from dataclasses import dataclass
from typing import Any, Optional, List
import base64
import re
import mimetypes

from docling.document_converter import DocumentConverter
from PIL import Image
from io import BytesIO

try:
    import pypdfium2 as pdfium

    HAS_PDFIUM = True
except ImportError:
    HAS_PDFIUM = False


@dataclass
class ImageAsset:
    filename: str
    data_base64: str
    media_type: Optional[str] = None
    page: Optional[int] = None
    bbox: Optional[dict] = (
        None  # Bounding box in PDF coordinates: {"l": left, "r": right, "t": top, "b": bottom}
    )


@dataclass
class DoclingMetadata:
    """
    Minimal metadata extracted from a PDF using Docling, including
    full markdown export and extracted image assets (figures/charts, etc.).
    """

    markdown: Optional[str] = None
    images: List[ImageAsset] | None = None


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
        return self._extract_metadata(result, convert_result=result)

    def extract_from_bytes(self, pdf_bytes: bytes) -> DoclingMetadata:
        # Docling accepts file paths or URLs. On Windows, libraries cannot
        # reopen a NamedTemporaryFile while it's still open. Use a temp
        # directory so the file is closed before conversion.
        with tempfile.TemporaryDirectory() as td:
            tmp_path = os.path.join(td, "input.pdf")
            with open(tmp_path, "wb") as f:
                f.write(pdf_bytes)

            result = self._converter.convert(tmp_path)

            return self._extract_metadata(
                result, convert_result=result, pdf_path=tmp_path
            )

    def _extract_metadata(
        self,
        doc_or_result: Any,
        assets_dir: Optional[str] = None,
        convert_result: Optional[Any] = None,
        pdf_path: Optional[str] = None,
    ) -> DoclingMetadata:
        # Handle both cases: old signature (doc) and new signature (convert_result)
        if convert_result is not None:
            doc = convert_result.document
            result = convert_result
        else:
            doc = (
                doc_or_result.document
                if hasattr(doc_or_result, "document")
                else doc_or_result
            )
            result = doc_or_result

        # Export to markdown
        markdown: str = ""
        try:
            markdown = doc.export_to_markdown()
        except Exception as e:
            print(f"DEBUG: Markdown export failed: {e}")
            try:
                markdown = getattr(doc, "export_to_text", lambda: "")()
            except Exception:
                markdown = ""

        meta = DoclingMetadata()
        meta.markdown = markdown or ""

        # Extract images using the conversion result's page images
        images: List[ImageAsset] = []

        print(f"DEBUG: Attempting to extract images from pictures")
        if hasattr(doc, "pictures") and doc.pictures:
            print(f"DEBUG: Found {len(doc.pictures)} pictures in document")

            # Prepare PDF renderer once
            pdf_doc = None
            if HAS_PDFIUM and pdf_path and os.path.exists(pdf_path):
                try:
                    pdf_doc = pdfium.PdfDocument(pdf_path)
                    print(f"DEBUG: Opened PDF with pypdfium2 for image cropping")
                except Exception as e:
                    print(f"DEBUG: Failed to open PDF for pypdfium2: {e}")
                    pdf_doc = None
            else:
                if not HAS_PDFIUM:
                    print(
                        "DEBUG: pypdfium2 not available; cannot render pages for cropping"
                    )
                elif not pdf_path:
                    print(
                        "DEBUG: No pdf_path provided; cannot render pages for cropping"
                    )

            # Try to extract each picture
            for idx, picture in enumerate(doc.pictures):
                try:
                    filename = f"image_{idx}.png"
                    img_data = None
                    page_no = None
                    bbox = None
                    bbox_dict = None

                    # Get page number and bbox from picture's provenance
                    if hasattr(picture, "prov") and picture.prov:
                        if len(picture.prov) > 0:
                            prov = picture.prov[0]
                            if hasattr(prov, "page_no"):
                                page_no = prov.page_no
                            if hasattr(prov, "bbox"):
                                bbox = prov.bbox
                                # Convert bbox object to dict for serialization
                                if bbox:
                                    try:
                                        bbox_dict = {
                                            "l": float(bbox.l),
                                            "r": float(bbox.r),
                                            "t": float(bbox.t),
                                            "b": float(bbox.b),
                                        }
                                        print(
                                            f"DEBUG: Picture {idx} - page {page_no}, bbox: {bbox_dict}"
                                        )
                                    except Exception as e:
                                        print(
                                            f"DEBUG: Failed to convert bbox to dict: {e}"
                                        )

                    # Extract image by rendering the page and cropping with bbox
                    if page_no and bbox and pdf_doc is not None:
                        try:
                            page_index = max(0, int(page_no) - 1)
                            page = pdf_doc[page_index]
                            # Determine page size in points
                            pw, ph = page.get_size()
                            # Render at 2x scale for clarity
                            scale = 2
                            pil_page = page.render(scale=scale).to_pil()
                            img_w, img_h = pil_page.size
                            # Convert bbox (PDF bottom-left) to pixel box (PIL top-left)
                            left = int(max(0, bbox.l * scale))
                            right = int(min(img_w, bbox.r * scale))
                            # bbox.t/b are distances from bottom, convert to from top
                            top = int(max(0, (ph - bbox.t) * scale))
                            bottom = int(min(img_h, (ph - bbox.b) * scale))
                            # Validate box
                            if right > left and bottom > top:
                                cropped = pil_page.crop((left, top, right, bottom))
                                buffer = BytesIO()
                                cropped.save(buffer, format="PNG")
                                img_data = buffer.getvalue()
                                print(
                                    f"DEBUG: Cropped image {idx} on page {page_no}: {len(img_data)} bytes"
                                )
                            else:
                                print(
                                    f"DEBUG: Skipped invalid crop box for picture {idx}: {(left, top, right, bottom)}"
                                )
                        except Exception as e:
                            print(
                                f"DEBUG: pypdfium2 crop failed for picture {idx}: {e}"
                            )
                            import traceback

                            traceback.print_exc()

                    if img_data:
                        if isinstance(img_data, bytes):
                            b64 = base64.b64encode(img_data).decode("ascii")
                        else:
                            # Should not happen after our crop logic
                            print(f"DEBUG: Unexpected img_data type: {type(img_data)}")
                            continue

                        images.append(
                            ImageAsset(
                                filename=filename,
                                data_base64=b64,
                                media_type="image/png",
                                page=page_no,
                                bbox=bbox_dict,
                            )
                        )
                        print(
                            f"DEBUG: Successfully extracted image {filename} from page {page_no} with bbox"
                        )
                    else:
                        print(f"DEBUG: Picture {idx} - no image data obtained")

                except Exception as e:
                    print(f"DEBUG: Failed to extract picture {idx}: {e}")
                    import traceback

                    traceback.print_exc()
                    continue

        # Close PDF if opened to release file handle (Windows)
        try:
            if "pdf_doc" in locals() and pdf_doc is not None:
                pdf_doc.close()
        except Exception:
            pass

        print(f"DEBUG: Total images extracted: {len(images)}")
        meta.images = images
        return meta
