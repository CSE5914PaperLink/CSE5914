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
from docling_core.transforms.chunker.hybrid_chunker import HybridChunker
from docling_core.transforms.chunker.tokenizer.huggingface import HuggingFaceTokenizer
from transformers import AutoTokenizer


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

    def extract_chunks(self, doc) -> List[Dict[str, Any]]:
        """
        Extract text chunks + Docling structural metadata using HybridChunker.
        Normalizes bbox coordinates to 0-1 range.
        """
        tokenizer = HuggingFaceTokenizer(
            tokenizer=AutoTokenizer.from_pretrained("nomic-ai/nomic-embed-text-v1.5"),
        )
        chunker = HybridChunker(tokenizer=tokenizer)
        results = []

        for chunk in chunker.chunk(doc):
            raw_meta = chunk.meta.export_json_dict()
            metadata = self.extract_useful_metadata(raw_meta)

            results.append(
                {
                    "text": chunker.contextualize(chunk),  # enriched text
                    "metadata": metadata,
                }
            )
        return results

    def extract_useful_metadata(self, raw_meta: dict) -> dict:
        """
        Extracts only the useful metadata from Docling's chunk metadata
        and converts it into Chroma-safe primitives.
        Normalizes bbox coordinates to 0-1 range.
        """
        out = {}

        doc_items = raw_meta.get("doc_items", [])
        if doc_items:
            prov = doc_items[0].get("prov", [])
            if prov:
                p = prov[0]
                page_no = p.get("page_no")
                out["page"] = page_no

                bbox = p.get("bbox")
                if bbox:
                    # Default to US Letter size (612 x 792 points) if page size unknown
                    # TODO: Could extract actual page sizes from document
                    page_width, page_height = 612, 792

                    # Normalize coordinates to 0-1 range
                    bbox_left = (
                        bbox.get("l") / page_width
                        if bbox.get("l") is not None
                        else None
                    )
                    bbox_right = (
                        bbox.get("r") / page_width
                        if bbox.get("r") is not None
                        else None
                    )
                    # Flip y-coordinates (PDF uses bottom-left origin)
                    bbox_top = (
                        (page_height - bbox.get("t")) / page_height
                        if bbox.get("t") is not None
                        else None
                    )
                    bbox_bottom = (
                        (page_height - bbox.get("b")) / page_height
                        if bbox.get("b") is not None
                        else None
                    )

                    out["bbox_left"] = bbox_left
                    out["bbox_top"] = bbox_top
                    out["bbox_right"] = bbox_right
                    out["bbox_bottom"] = bbox_bottom

        if "headings" in raw_meta:
            out["headings"] = " > ".join(raw_meta["headings"])

        return out

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

        page_sizes = {}

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
        doc = convert_result.document
        images = self.extract_images(doc)
        chunks = self.extract_chunks(doc)

        return {
            "images": images,
            "chunks": chunks,
        }
