from __future__ import annotations

import json
import logging
import re
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException

from app.services.chroma_service import ChromaService
from app.services.gemini_service import GeminiService
from app.services.section_utils import (
    SECTION_KEYWORDS,
    normalize_heading,
    section_sort_key,
)


MAX_SECTION_CHARACTERS = 3000
MAX_CITATIONS_PER_SECTION = 4


logger = logging.getLogger(__name__)


class ComparisonService:
    def __init__(self, chroma_service: Optional[ChromaService] = None):
        self.chroma = chroma_service or ChromaService()
        self.gemini = GeminiService()

    def compare_documents(self, doc_a: str, doc_b: str) -> Dict[str, Any]:
        chunks_a = self._fetch_chunks(doc_a)
        chunks_b = self._fetch_chunks(doc_b)

        if not chunks_a:
            raise HTTPException(status_code=404, detail=f"Document {doc_a} not found")
        if not chunks_b:
            raise HTTPException(status_code=404, detail=f"Document {doc_b} not found")

        doc_info_a = self._extract_doc_info(chunks_a, fallback_id=doc_a)
        doc_info_b = self._extract_doc_info(chunks_b, fallback_id=doc_b)

        grouped_a = self._group_by_section(chunks_a)
        grouped_b = self._group_by_section(chunks_b)
        images_a = self._fetch_images(doc_a)
        images_b = self._fetch_images(doc_b)
        assigned_images_a = self._assign_images_to_sections(
            grouped_a, images_a
        )
        assigned_images_b = self._assign_images_to_sections(
            grouped_b, images_b
        )

        section_names = sorted(
            set(grouped_a.keys()) | set(grouped_b.keys()), key=section_sort_key
        )

        sections_output = []
        for section in section_names:
            chunks_section_a = grouped_a.get(section, [])
            chunks_section_b = grouped_b.get(section, [])

            if not chunks_section_a and not chunks_section_b:
                continue

            comparison = self._build_section_comparison(
                section,
                doc_info_a,
                doc_info_b,
                chunks_section_a,
                chunks_section_b,
                assigned_images_a.get(section, []),
                assigned_images_b.get(section, []),
            )
            if comparison:
                sections_output.append(comparison)

        overall_summary = self._build_overall_summary(
            doc_info_a, doc_info_b, chunks_a, chunks_b
        )

        return {
            "doc_a": doc_info_a,
            "doc_b": doc_info_b,
            "sections": sections_output,
            "overall_summary": overall_summary,
        }

    def _fetch_chunks(self, doc_id: str) -> List[Dict[str, Any]]:
        result = self.chroma.collection.get(
            where={"$and": [{"doc_id": {"$eq": doc_id}}, {"type": {"$eq": "text"}}]},
            include=["documents", "metadatas"],
        )
        documents = result.get("documents") or []
        metadatas = result.get("metadatas") or []
        ids = result.get("ids") or []

        chunks = []
        for text, meta, chunk_id in zip(documents, metadatas, ids):
            if not isinstance(meta, dict):
                continue
            meta_copy = dict(meta)
            meta_copy["chunk_id"] = chunk_id
            chunks.append({"text": text, "metadata": meta_copy})
        return chunks

    def _extract_doc_info(
        self, chunks: List[Dict[str, Any]], fallback_id: str
    ) -> Dict[str, Any]:
        if not chunks:
            return {"doc_id": fallback_id, "title": fallback_id}
        meta = chunks[0]["metadata"]
        title = meta.get("title") or meta.get("doc_id") or fallback_id
        return {"doc_id": meta.get("doc_id", fallback_id), "title": title}

    def _group_by_section(
        self, chunks: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        total = len(chunks)
        for chunk in chunks:
            meta = chunk["metadata"]
            heading = meta.get("headings")
            chunk_index = meta.get("chunk_index", 0)
            normalized = normalize_heading(heading, chunk_index=chunk_index, total_chunks=total)
            if not normalized:
                normalized = "Additional Content"
            grouped[normalized].append(chunk)
        return grouped

    def _fetch_images(self, doc_id: str) -> List[Dict[str, Any]]:
        result = self.chroma.collection.get(
            where={"$and": [{"doc_id": {"$eq": doc_id}}, {"type": {"$eq": "image"}}]},
            include=["metadatas"],
        )
        metadatas = result.get("metadatas") or []
        ids = result.get("ids") or []
        images: List[Dict[str, Any]] = []
        for meta, image_id in zip(metadatas, ids):
            if not isinstance(meta, dict):
                continue
            img = dict(meta)
            img["chunk_id"] = image_id
            images.append(img)
        return images

    def _build_section_comparison(
        self,
        section: str,
        doc_a: Dict[str, Any],
        doc_b: Dict[str, Any],
        chunks_a: List[Dict[str, Any]],
        chunks_b: List[Dict[str, Any]],
        section_images_a: List[Dict[str, Any]],
        section_images_b: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        text_a = self._aggregate_section_text(chunks_a)
        text_b = self._aggregate_section_text(chunks_b)
        citations_a = self._build_citations(chunks_a)
        citations_b = self._build_citations(chunks_b)

        if not text_a or not text_b:
            return None

        prompt = self._build_prompt(section, doc_a, doc_b, text_a, text_b)
        try:
            response_text = self.gemini.generate_content(
                prompt,
                temperature=0.2,
                max_output_tokens=800,
                system_instruction=(
                    "You compare research paper sections. Respond with strict JSON only."
                ),
            )
        except Exception as exc:
            logger.error(
                "LLM comparison failed for section %s (%s vs %s): %s",
                section,
                doc_a.get("doc_id"),
                doc_b.get("doc_id"),
                exc,
            )
            return {
                "section": section,
                "paper_a_summary": "Summary unavailable.",
                "paper_b_summary": "Summary unavailable.",
                "similarities": "",
                "differences": "",
                "notes": "Unable to generate comparison data due to LLM error.",
                "paper_a_citations": citations_a,
                "paper_b_citations": citations_b,
                "paper_a_images": section_images_a,
                "paper_b_images": section_images_b,
            }

        comparison_fields = self._parse_response_json(response_text, section)
        comparison_fields.update(
            {
                "section": section,
                "paper_a_citations": citations_a,
                "paper_b_citations": citations_b,
                "paper_a_images": section_images_a,
                "paper_b_images": section_images_b,
            }
        )
        return comparison_fields

    def _assign_images_to_sections(
        self,
        sections: Dict[str, List[Dict[str, Any]]],
        all_images: List[Dict[str, Any]],
    ) -> Dict[str, List[Dict[str, Any]]]:
        assignments: Dict[str, List[Dict[str, Any]]] = {name: [] for name in sections}
        if not sections or not all_images:
            return assignments

        section_tokens: Dict[str, set[str]] = {}
        section_pages: Dict[str, List[int]] = {}
        page_to_sections: Dict[int, List[str]] = defaultdict(list)
        for name, chunks in sections.items():
            section_tokens[name] = self._tokenize_text(
                " ".join((chunk.get("text") or "") for chunk in chunks)
            )
            pages: set[int] = set()
            for chunk in chunks:
                page = chunk["metadata"].get("page")
                if isinstance(page, int):
                    pages.add(page)
            sorted_pages = sorted(pages)
            section_pages[name] = sorted_pages
            for page in sorted_pages:
                page_to_sections[page].append(name)

        section_names = list(section_tokens.keys())

        for image in all_images:
            if not image.get("image_b64"):
                continue
            target_section = self._determine_section_for_image(
                image, section_tokens, section_pages, section_names, page_to_sections
            )
            if not target_section:
                continue
            assignments[target_section].append(
                {
                    "chunk_id": image.get("chunk_id"),
                    "page": image.get("page"),
                    "caption": self._truncate_caption(image.get("caption")),
                    "picture_number": image.get("picture_number"),
                    "image_b64": image.get("image_b64"),
                }
            )

        return assignments

    def _determine_section_for_image(
        self,
        image: Dict[str, Any],
        section_tokens: Dict[str, set[str]],
        section_pages: Dict[str, List[int]],
        section_names: List[str],
        page_to_sections: Dict[int, List[str]],
    ) -> Optional[str]:
        caption = (image.get("caption") or "").lower()
        page = image.get("page")

        if caption:
            for canonical, keywords in SECTION_KEYWORDS.items():
                if any(keyword in caption for keyword in keywords):
                    matched = self._match_section_name(canonical, section_names)
                    if matched:
                        return matched

        if isinstance(page, int):
            exact_sections = page_to_sections.get(page)
            if exact_sections:
                return exact_sections[0]
            nearest = self._nearest_section_by_page(page, section_pages, section_names)
            if nearest:
                return nearest

        caption_tokens = self._tokenize_text(caption)
        best_section = None
        best_overlap = 0
        for name, tokens in section_tokens.items():
            overlap = len(tokens & caption_tokens)
            if overlap > best_overlap:
                best_overlap = overlap
                best_section = name
        if best_section:
            return best_section
        return section_names[0] if section_names else None

    @staticmethod
    def _match_section_name(
        canonical: str, section_names: List[str]
    ) -> Optional[str]:
        target = canonical.lower()
        for name in section_names:
            if target in name.lower():
                return name
        return None

    @staticmethod
    def _nearest_section_by_page(
        page: int,
        section_pages: Dict[str, List[int]],
        section_names: List[str],
    ) -> Optional[str]:
        best_name = None
        best_distance = float("inf")
        for name in section_names:
            pages = section_pages.get(name, [])
            if not pages:
                continue
            distances = [abs(page - p) for p in pages]
            if not distances:
                continue
            distance = min(distances)
            if distance < best_distance:
                best_distance = distance
                best_name = name
        return best_name

    @staticmethod
    def _truncate_caption(caption: Optional[str], max_length: int = 120) -> Optional[str]:
        if not caption:
            return None
        trimmed = caption.strip()
        if len(trimmed) <= max_length:
            return trimmed
        return trimmed[: max_length - 1].rstrip() + "…"

    @staticmethod
    def _tokenize_text(text: str) -> set[str]:
        if not text:
            return set()
        tokens = re.findall(r"[a-z0-9]{3,}", text.lower())
        return set(tokens)

    def _aggregate_section_text(self, chunks: List[Dict[str, Any]]) -> str:
        if not chunks:
            return ""
        texts = []
        total_chars = 0
        for chunk in chunks:
            text = (chunk.get("text") or "").strip()
            if not text:
                continue
            texts.append(text)
            total_chars += len(text)
            if total_chars >= MAX_SECTION_CHARACTERS:
                break
        return "\n\n".join(texts)

    def _build_prompt(
        self,
        section: str,
        doc_a: Dict[str, Any],
        doc_b: Dict[str, Any],
        text_a: str,
        text_b: str,
    ) -> str:
        return f"""
Compare the {section} sections of two research papers. Summarize each paper's section in 3-4 sentences and highlight similarities and differences.

Return JSON with this structure (no markdown, no commentary):
{{
  "paper_a_summary": "...",
  "paper_b_summary": "...",
  "similarities": "...",
  "differences": "...",
  "notes": "..."
}}

Paper A: {doc_a.get("title")} (ID: {doc_a.get("doc_id")})
Section content:
<<<
{text_a or "Not available."}
>>>

Paper B: {doc_b.get("title")} (ID: {doc_b.get("doc_id")})
Section content:
<<<
{text_b or "Not available."}
>>>
"""

    def _build_overall_summary(
        self,
        doc_a: Dict[str, Any],
        doc_b: Dict[str, Any],
        chunks_a: List[Dict[str, Any]],
        chunks_b: List[Dict[str, Any]],
    ) -> Optional[str]:
        text_a = self._aggregate_section_text(chunks_a)
        text_b = self._aggregate_section_text(chunks_b)
        if not text_a or not text_b:
            return None

        prompt = f"""
Provide an overall comparative summary of two research papers.
Summarize the main goals, core approaches, and headline results, and highlight the most important similarities and differences.

Paper A ({doc_a.get('title') or doc_a.get('doc_id')}):
{text_a}

Paper B ({doc_b.get('title') or doc_b.get('doc_id')}):
{text_b}

Respond with 2-3 concise paragraphs.
"""
        try:
            response_text = self.gemini.generate_content(
                prompt,
                temperature=0.25,
                max_output_tokens=500,
            )
            return response_text.strip()
        except Exception as exc:
            logger.error(
                "Failed to generate overall summary for %s vs %s: %s",
                doc_a.get("doc_id"),
                doc_b.get("doc_id"),
                exc,
            )
            return None

    def _parse_response_json(self, response_text: str, section: str) -> Dict[str, Any]:
        cleaned = self._extract_json_payload(response_text)
        if not cleaned:
            return {
                "paper_a_summary": "Summary unavailable.",
                "paper_b_summary": "Summary unavailable.",
                "similarities": "",
                "differences": "",
                "notes": f"Model response could not be parsed for section {section}.",
            }
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            return {
                "paper_a_summary": "Summary unavailable.",
                "paper_b_summary": "Summary unavailable.",
                "similarities": "",
                "differences": "",
                "notes": f"Model response could not be parsed for section {section}.",
            }

        return {
            "paper_a_summary": data.get("paper_a_summary", "Summary unavailable."),
            "paper_b_summary": data.get("paper_b_summary", "Summary unavailable."),
            "similarities": data.get("similarities", ""),
            "differences": data.get("differences", ""),
            "notes": data.get("notes", ""),
        }

    def _extract_json_payload(self, text: str) -> Optional[str]:
        if not text:
            return None
        stripped = text.strip()
        if stripped.startswith("```"):
            stripped = stripped.strip("`")
            stripped = stripped.replace("json", "", 1).strip()
        start = stripped.find("{")
        end = stripped.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None
        return stripped[start : end + 1]

    def _build_citations(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        citations = []
        for chunk in chunks[:MAX_CITATIONS_PER_SECTION]:
            meta = chunk["metadata"]
            citations.append(
                {
                    "chunk_id": meta.get("chunk_id"),
                    "page": meta.get("page"),
                    "chunk_index": meta.get("chunk_index"),
                    "heading": meta.get("headings"),
                    "excerpt": (chunk.get("text") or "")[:250],
                }
            )
        return citations
