from __future__ import annotations

from typing import Optional, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import httpx
from xml.etree import ElementTree as ET

from app.services.gemini_service import ingest_pdf_bytes_into_chroma
from app.services.chroma_service import ChromaService

router = APIRouter(prefix="/library", tags=["library"])

ARXIV_API = "https://export.arxiv.org/api/query"
UA = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"


def _fetch_arxiv_metadata(arxiv_id: str) -> dict:
    """Fetch minimal metadata (title, authors, summary, published) for a given arXiv id."""
    try:
        r = httpx.get(
            ARXIV_API,
            params={"id_list": arxiv_id},
            headers={"User-Agent": UA},
            timeout=30.0,
        )
    except httpx.HTTPError:
        return {}
    if r.status_code != 200:
        return {}
    try:
        root = ET.fromstring(r.text)
    except ET.ParseError:
        return {}
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    entry = root.find("atom:entry", ns)
    if entry is None:
        return {}

    def _t(tag: str) -> str:
        el = entry.find(f"atom:{tag}", ns)
        return (el.text or "").strip() if el is not None else ""

    title = _t("title")
    summary = _t("summary")
    published = _t("published")
    authors: List[str] = []
    for a in entry.findall("atom:author", ns):
        name_el = a.find("atom:name", ns)
        if name_el is not None and name_el.text:
            authors.append(name_el.text.strip())
    return {
        "title": title,
        "summary": summary,
        "published": published,
        "authors": authors,
    }


@router.post("/add/{arxiv_id}")
async def add_arxiv(arxiv_id: str):
    """Download an arXiv PDF and ingest into vector DB."""
    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, connect=10.0),
        headers={"User-Agent": UA},
        follow_redirects=True,
    ) as client:
        r = await client.get(pdf_url)
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail="Failed to fetch PDF")
        pdf_bytes = r.content
    # Fetch and attach minimal metadata
    meta = _fetch_arxiv_metadata(arxiv_id)
    extra_md = {"arxiv_id": arxiv_id, "pdf_url": pdf_url, **meta}
    # Ingest (doc_id prefixes to avoid collisions)
    ingest_pdf_bytes_into_chroma(
        pdf_bytes, doc_id=f"arxiv:{arxiv_id}", extra_metadata=extra_md
    )
    return JSONResponse({"status": "ok", "arxiv_id": arxiv_id, "metadata": extra_md})


@router.get("/list")
def list_library(limit: int = 50, offset: int = 0):
    chroma = ChromaService()
    data = chroma.collection.get(
        where={"kind": "doc"},
        include=["metadatas", "documents"],
        limit=limit,
        offset=offset,
    )
    if not data.get("ids"):
        data = chroma.collection.get(
            include=["metadatas", "documents"], limit=limit, offset=offset
        )
    results = []
    for i, _id in enumerate(data.get("ids", [])):
        md = (data.get("metadatas") or [{}])[i] or {}
        kind = md.get("kind")
        if kind and kind != "doc":
            continue
        doc = (data.get("documents") or [None])[i]
        results.append(
            {
                "id": _id,
                "metadata": md,
                "document": doc,
            }
        )
    return JSONResponse({"results": results, "count": len(results)})


@router.delete("/delete/{doc_id}")
def delete_item(doc_id: str):
    """Delete a paper/vector by its id in the Chroma collection."""
    chroma = ChromaService()
    try:
        chroma.delete([doc_id])
        try:
            chroma.collection.delete(where={"root_id": doc_id})
        except Exception:
            pass
        return JSONResponse({"status": "deleted", "id": doc_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
