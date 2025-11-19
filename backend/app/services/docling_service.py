from __future__ import annotations

import base64
import os, io
import tempfile
from uuid import uuid4
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional


from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions


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
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_ocr = False
        pipeline_options.do_table_structure = True
        pipeline_options.generate_picture_images = True
        pipeline_options.images_scale = 2.0
        self._converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
            }
        )

    def extract_images(self, doc: Any) -> Dict[str, Any]:
        """
        Extract images from a Docling document and include
        the actual image data inside metadata as base64.
        Normalizes bbox coordinates to 0-1 range relative to page dimensions.
        """

        uris: List[str] = []
        metadatas: List[dict] = []
        ids: List[str] = []

        pictures = getattr(doc, "pictures", None)
        if not pictures:
            return {"uris": uris, "metadatas": metadatas, "ids": ids, "tmp_dir": None}

        tmp_dir = tempfile.mkdtemp(prefix="doc_images_")

        # Get page dimensions for normalization
        # Try multiple approaches to access page dimensions from Docling
        page_sizes = {}

        # Method 1: Try _pages attribute
        if hasattr(doc, "_pages"):
            for page_no, page in enumerate(doc._pages, 1):
                if hasattr(page, "_size"):
                    size = page._size
                    if hasattr(size, "width") and hasattr(size, "height"):
                        page_sizes[page_no] = (size.width, size.height)

        # Method 2: Try pages property
        if not page_sizes and hasattr(doc, "pages"):
            for page_no, page in enumerate(doc.pages, 1):
                if hasattr(page, "size"):
                    size = page.size
                    if hasattr(size, "width") and hasattr(size, "height"):
                        page_sizes[page_no] = (size.width, size.height)

        # Method 3: Standard PDF page size fallback (US Letter / A4)
        # If we can't get page sizes, use a standard default
        use_default = len(page_sizes) == 0
        if use_default:
            print(
                "WARNING: Could not extract page sizes from Docling document, using default 612x792 (US Letter)"
            )

        for i, pic in enumerate(pictures, 1):
            prov = getattr(pic, "prov", None)
            if not prov:
                continue

            image_obj = getattr(pic, "image", None)
            img = getattr(image_obj, "pil_image", None)
            if img is None:
                continue

            img_id = str(uuid4())
            img_path = os.path.join(tmp_dir, f"{img_id}.png")

            # Save PNG file for compatibility with LangChain API behavior
            img.save(img_path, format="PNG")

            # Convert image to PNG bytes → base64 string
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            b64_data = base64.b64encode(buf.getvalue()).decode("utf-8")

            bbox = getattr(prov[0], "bbox", None)
            page_no = prov[0].page_no

            # Normalize bbox coordinates to 0-1 range
            bbox_left, bbox_top, bbox_right, bbox_bottom = None, None, None, None
            if bbox:
                # Get page size (from dict or use default)
                if page_no in page_sizes:
                    page_width, page_height = page_sizes[page_no]
                else:
                    # Default to US Letter size (612 x 792 points)
                    page_width, page_height = 612, 792

                # Normalize coordinates to 0-1 range
                bbox_left = bbox.l / page_width if page_width > 0 else None
                bbox_right = bbox.r / page_width if page_width > 0 else None
                # Note: Docling uses bottom-left origin, so we need to flip y-coordinates
                bbox_top = (
                    (page_height - bbox.t) / page_height if page_height > 0 else None
                )
                bbox_bottom = (
                    (page_height - bbox.b) / page_height if page_height > 0 else None
                )
                print(
                    f"DEBUG: Image {i} on page {page_no} - Original bbox: l={bbox.l:.1f}, t={bbox.t:.1f}, r={bbox.r:.1f}, b={bbox.b:.1f}"
                )
                print(f"DEBUG: Page size: {page_width:.1f}x{page_height:.1f}")
                print(
                    f"DEBUG: Normalized bbox: left={bbox_left:.3f}, top={bbox_top:.3f}, right={bbox_right:.3f}, bottom={bbox_bottom:.3f}"
                )

            metadata = {
                "picture_number": i,
                "page": page_no,
                "caption": pic.caption_text(doc),
                "bbox_left": bbox_left,
                "bbox_top": bbox_top,
                "bbox_right": bbox_right,
                "bbox_bottom": bbox_bottom,
                "image_b64": b64_data,
            }

            uris.append(img_path)
            metadatas.append(metadata)
            ids.append(img_id)

        return {
            "uris": uris,
            "metadatas": metadatas,
            "ids": ids,
            "tmp_dir": tmp_dir,
        }

    def extract_from_bytes(self, pdf_bytes: bytes) -> dict[str, Any]:
        # Docling accepts file paths or URLs. On Windows, libraries cannot
        # reopen a NamedTemporaryFile while it's still open. Use a temp
        # directory so the file is closed before conversion.
        with tempfile.TemporaryDirectory() as td:
            tmp_path = os.path.join(td, "input.pdf")
            with open(tmp_path, "wb") as f:
                f.write(pdf_bytes)

            result = self._converter.convert(tmp_path)

            return self._extract_metadata(result)

    def _extract_metadata(
        self,
        convert_result: Any,
    ) -> dict[str, Any]:
        # Extract document from conversion result
        docling_doc = convert_result.document

        # Export to markdown
        markdown = docling_doc.export_to_markdown()

        image_info = self.extract_images(docling_doc)

        # meta.markdown = markdown

        # # Extract images using the conversion result's page images
        # images: List[ImageAsset] = []

        # print(f"DEBUG: Attempting to extract images from pictures")
        # if hasattr(doc, "pictures") and doc.pictures:
        #     print(f"DEBUG: Found {len(doc.pictures)} pictures in document")

        #     # Prepare PDF renderer once
        #     pdf_doc = None
        #     if HAS_PDFIUM and pdf_path and os.path.exists(pdf_path):
        #         try:
        #             pdf_doc = pdfium.PdfDocument(pdf_path)
        #             print(f"DEBUG: Opened PDF with pypdfium2 for image cropping")
        #         except Exception as e:
        #             print(f"DEBUG: Failed to open PDF for pypdfium2: {e}")
        #             pdf_doc = None
        #     else:
        #         if not HAS_PDFIUM:
        #             print(
        #                 "DEBUG: pypdfium2 not available; cannot render pages for cropping"
        #             )
        #         elif not pdf_path:
        #             print(
        #                 "DEBUG: No pdf_path provided; cannot render pages for cropping"
        #             )

        #     # Try to extract each picture
        #     for idx, picture in enumerate(doc.pictures):
        #         try:
        #             filename = f"image_{idx}.png"
        #             img_data = None
        #             page_no = None
        #             bbox = None
        #             bbox_dict = None

        #             # Get page number and bbox from picture's provenance
        #             if hasattr(picture, "prov") and picture.prov:
        #                 if len(picture.prov) > 0:
        #                     prov = picture.prov[0]
        #                     if hasattr(prov, "page_no"):
        #                         page_no = prov.page_no
        #                     if hasattr(prov, "bbox"):
        #                         bbox = prov.bbox
        #                         # Convert bbox object to dict for serialization
        #                         if bbox:
        #                             try:
        #                                 bbox_dict = {
        #                                     "l": float(bbox.l),
        #                                     "r": float(bbox.r),
        #                                     "t": float(bbox.t),
        #                                     "b": float(bbox.b),
        #                                 }
        #                                 print(
        #                                     f"DEBUG: Picture {idx} - page {page_no}, bbox: {bbox_dict}"
        #                                 )
        #                             except Exception as e:
        #                                 print(
        #                                     f"DEBUG: Failed to convert bbox to dict: {e}"
        #                                 )

        #             # Extract image by rendering the page and cropping with bbox
        #             if page_no and bbox and pdf_doc is not None:
        #                 try:
        #                     page_index = max(0, int(page_no) - 1)
        #                     page = pdf_doc[page_index]
        #                     # Determine page size in points
        #                     pw, ph = page.get_size()
        #                     # Render at 2x scale for clarity
        #                     scale = 2
        #                     pil_page = page.render(scale=scale).to_pil()
        #                     img_w, img_h = pil_page.size
        #                     # Convert bbox (PDF bottom-left) to pixel box (PIL top-left)
        #                     left = int(max(0, bbox.l * scale))
        #                     right = int(min(img_w, bbox.r * scale))
        #                     # bbox.t/b are distances from bottom, convert to from top
        #                     top = int(max(0, (ph - bbox.t) * scale))
        #                     bottom = int(min(img_h, (ph - bbox.b) * scale))
        #                     # Validate box
        #                     if right > left and bottom > top:
        #                         cropped = pil_page.crop((left, top, right, bottom))
        #                         buffer = BytesIO()
        #                         cropped.save(buffer, format="PNG")
        #                         img_data = buffer.getvalue()
        #                         print(
        #                             f"DEBUG: Cropped image {idx} on page {page_no}: {len(img_data)} bytes"
        #                         )
        #                     else:
        #                         print(
        #                             f"DEBUG: Skipped invalid crop box for picture {idx}: {(left, top, right, bottom)}"
        #                         )
        #                 except Exception as e:
        #                     print(
        #                         f"DEBUG: pypdfium2 crop failed for picture {idx}: {e}"
        #                     )
        #                     import traceback

        #                     traceback.print_exc()

        #             if img_data:
        #                 if isinstance(img_data, bytes):
        #                     b64 = base64.b64encode(img_data).decode("ascii")
        #                 else:
        #                     # Should not happen after our crop logic
        #                     print(f"DEBUG: Unexpected img_data type: {type(img_data)}")
        #                     continue

        #                 images.append(
        #                     ImageAsset(
        #                         filename=filename,
        #                         data_base64=b64,
        #                         media_type="image/png",
        #                         page=page_no,
        #                         bbox=bbox_dict,
        #                     )
        #                 )
        #                 print(
        #                     f"DEBUG: Successfully extracted image {filename} from page {page_no} with bbox"
        #                 )
        #             else:
        #                 print(f"DEBUG: Picture {idx} - no image data obtained")

        #         except Exception as e:
        #             print(f"DEBUG: Failed to extract picture {idx}: {e}")
        #             import traceback

        #             traceback.print_exc()
        #             continue

        # # Close PDF if opened to release file handle (Windows)
        # try:
        #     if "pdf_doc" in locals() and pdf_doc is not None:
        #         pdf_doc.close()
        # except Exception:
        #     pass

        # print(f"DEBUG: Total images extracted: {len(images)}")
        # meta.images = images
        return {
            "doc": docling_doc,
            "markdown": markdown,
            "images": image_info,
        }
