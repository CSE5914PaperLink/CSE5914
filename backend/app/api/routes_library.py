from __future__ import annotations

import logging
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, HttpUrl
import httpx
from xml.etree import ElementTree as ET

from app.services.gemini_service import ingest_pdf_bytes_into_chroma, ingest_repo_files_into_chroma
from app.services.github_service import GitHubService, normalize_github_url
from app.services.chroma_service import ChromaService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/library", tags=["library"])

ARXIV_API = "https://export.arxiv.org/api/query"
UA = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"


class AddArxivRequest(BaseModel):
    """Request body for adding an arXiv paper with optional GitHub repos."""
    github_repos: List[str] = Field(
        default_factory=list,
        description="Optional list of GitHub repository URLs to ingest alongside the PDF."
    )


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
async def add_arxiv(arxiv_id: str, request: Optional[AddArxivRequest] = None):
    """Download an arXiv PDF and optionally ingest related GitHub repositories.
    
    Args:
        arxiv_id: arXiv paper ID (e.g., "2301.12345").
        request: Optional body with list of GitHub repo URLs to also ingest.
    
    Returns:
        JSON response with status, counts, and any errors encountered.
    """
    if request is None:
        request = AddArxivRequest()
    
    response_data = {
        "status": "ok",
        "arxiv_id": arxiv_id,
        "metadata": None,
        "pdf_ingested": False,
        "repos": [],
    }

    # Step 1: Fetch and ingest the arXiv PDF
    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(60.0, connect=10.0),
            headers={"User-Agent": UA},
            follow_redirects=True,
        ) as client:
            r = await client.get(pdf_url)
            if r.status_code != 200:
                raise HTTPException(status_code=r.status_code, detail="Failed to fetch PDF")
            pdf_bytes = r.content

        # Fetch and attach minimal metadata from arXiv
        meta = _fetch_arxiv_metadata(arxiv_id)
        extra_md = {"arxiv_id": arxiv_id, "pdf_url": pdf_url, **meta}
        response_data["metadata"] = extra_md

        # Ingest PDF
        ingest_pdf_bytes_into_chroma(
            pdf_bytes, doc_id=f"arxiv:{arxiv_id}", extra_metadata=extra_md
        )
        response_data["pdf_ingested"] = True
        logger.info(f"Successfully ingested PDF for arxiv_id {arxiv_id}")

    except Exception as e:
        logger.error(f"Failed to ingest PDF for arxiv_id {arxiv_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to ingest PDF: {str(e)}")

    # Step 2: Ingest GitHub repositories (if provided)
    if request.github_repos:
        github_service = GitHubService()
        for repo_url in request.github_repos:
            try:
                # Normalize the URL
                normalized_url = normalize_github_url(repo_url)

                # Fetch repo files
                logger.info(f"Fetching files from {normalized_url}")
                repo_files = await github_service.fetch_repo_files(normalized_url)

                if not repo_files:
                    logger.warning(f"No files fetched from {normalized_url}")
                    response_data["repos"].append({
                        "url": normalized_url,
                        "status": "warning",
                        "files_ingested": 0,
                        "reason": "No files fetched",
                    })
                    continue

                # Ingest repo files
                files_ingested = ingest_repo_files_into_chroma(
                    repo_url=normalized_url,
                    arxiv_id=arxiv_id,
                    repo_files=repo_files,
                    base_metadata=extra_md,
                )

                response_data["repos"].append({
                    "url": normalized_url,
                    "status": "ok",
                    "files_ingested": files_ingested,
                })
                logger.info(f"Ingested {files_ingested} files from {normalized_url}")

            except Exception as e:
                logger.error(f"Failed to ingest repo {repo_url}: {e}")
                response_data["repos"].append({
                    "url": repo_url,
                    "status": "error",
                    "error": str(e),
                })

    return JSONResponse(response_data)


@router.get("/list")
def list_library(limit: int = 50, offset: int = 0):
    chroma = ChromaService()
    # Chroma doesn't have simple list; use where filter hack by querying all with empty where
    # We'll store ids by doing a range over collection count (not exposed). Instead, rely on get with 'include'.
    # Workaround: use .get with no ids returns all (may be heavy). Limit manually.
    data = chroma.collection.get(
        include=["metadatas", "documents"], limit=limit, offset=offset
    )
    results = []
    for i, _id in enumerate(data.get("ids", [])):
        md = (data.get("metadatas") or [{}])[i] or {}
        doc = (data.get("documents") or [None])[i]
        results.append(
            {
                "id": _id,
                "metadata": md,
                "document": doc,
            }
        )
    return JSONResponse({"results": results, "count": len(results)})


@router.get("/chunks/{doc_id}")
def list_chunks(doc_id: str, limit: int = 200, offset: int = 0):
    """List chunk vectors for a given root document id."""
    chroma = ChromaService()
    try:
        data = chroma.collection.get(
            where={"kind": "chunk", "root_id": doc_id},
            include=["metadatas", "documents"],
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    results = []
    for i, _id in enumerate(data.get("ids", [])):
        md = (data.get("metadatas") or [{}])[i] or {}
        if md.get("kind") != "chunk":
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
        return JSONResponse({"status": "deleted", "id": doc_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
