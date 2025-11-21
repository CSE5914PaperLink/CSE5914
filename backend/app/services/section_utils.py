from __future__ import annotations

import re
from typing import Optional


SECTION_KEYWORDS = {
    "Abstract": ["abstract", "summary"],
    "Introduction": ["introduction", "intro", "overview", "motivation"],
    "Background / Related Work": [
        "background",
        "related work",
        "literature review",
        "prior work",
    ],
    "Methodology": [
        "methodology",
        "methods",
        "approach",
        "problem formulation",
    ],
    "Architecture": ["architecture", "model", "framework", "design"],
    "Experiments": ["experiments", "experimental setup", "experiment design"],
    "Results / Evaluation": [
        "results",
        "evaluation",
        "performance",
        "analysis",
    ],
    "Discussion": ["discussion", "analysis", "insights"],
    "Conclusion": ["conclusion", "concluding remarks", "summary and conclusions"],
    "Limitations": ["limitation", "limitations"],
    "Future Work": ["future work", "future directions", "outlook"],
}

SECTION_ORDER = list(SECTION_KEYWORDS.keys()) + ["Additional Content"]
FALLBACK_SECTION = "Additional Content"


def normalize_heading(
    raw_heading: Optional[str], chunk_index: int = 0, total_chunks: int = 0
) -> Optional[str]:
    """Map raw headings to a canonical section name."""
    if not raw_heading:
        return infer_from_position(chunk_index, total_chunks)

    parts = [part.strip() for part in raw_heading.split(">") if part.strip()]
    if not parts:
        return infer_from_position(chunk_index, total_chunks)

    cleaned_parts = []
    for part in parts:
        stripped = re.sub(r"^\d+(\.\d+)*\s*", "", part).strip()
        if stripped:
            cleaned_parts.append(stripped.lower())

    for candidate in cleaned_parts:
        for canonical, keywords in SECTION_KEYWORDS.items():
            for keyword in keywords:
                if keyword in candidate:
                    return canonical

    joined = " ".join(cleaned_parts)
    for canonical, keywords in SECTION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in joined:
                return canonical

    return infer_from_position(chunk_index, total_chunks)


def infer_from_position(chunk_index: int, total_chunks: int) -> str:
    if total_chunks <= 0:
        return FALLBACK_SECTION
    ratio = chunk_index / max(1, total_chunks)
    if ratio <= 0.15:
        return "Introduction"
    if ratio <= 0.35:
        return "Methodology"
    if ratio <= 0.55:
        return "Architecture"
    if ratio <= 0.7:
        return "Experiments"
    if ratio <= 0.85:
        return "Results / Evaluation"
    if ratio <= 0.95:
        return "Discussion"
    return FALLBACK_SECTION


def section_sort_key(name: str):
    try:
        return (0, SECTION_ORDER.index(name))
    except ValueError:
        return (1, name.lower())
