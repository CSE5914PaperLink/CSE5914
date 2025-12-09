import logging
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse, Response
from xml.etree import ElementTree as ET

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/arxiv", tags=["arxiv"])


ARXIV_API = "https://export.arxiv.org/api/query"
UA = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"


def _build_arxiv_query(
    q: Optional[str],
    title: Optional[str],
    author: Optional[str],
    abs: Optional[str],
    cat: Optional[str],
) -> str:
    # arXiv uses an Atom-based query syntax like: ti:"deep learning" AND au:"Goodfellow"
    parts = []
    if q:
        parts.append(q)
    if title:
        parts.append(f'ti:"{title}"')
    if author:
        parts.append(f'au:"{author}"')
    if abs:
        parts.append(f'abs:"{abs}"')
    if cat:
        parts.append(f"cat:{cat}")
    return " AND ".join(parts) if parts else "all:electron"


def _et_text(el: Optional[ET.Element]) -> str:
    return (el.text or "").strip() if el is not None else ""


def _parse_arxiv_feed(xml_text: str) -> list[dict]:
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "arxiv": "http://arxiv.org/schemas/atom",
    }
    root = ET.fromstring(xml_text)
    results: list[dict] = []
    for entry in root.findall("atom:entry", ns):
        id_full = _et_text(entry.find("atom:id", ns))
        doc_id = id_full.rsplit("/", 1)[-1]
        title = _et_text(entry.find("atom:title", ns))
        summary = _et_text(entry.find("atom:summary", ns))
        published = _et_text(entry.find("atom:published", ns))

        authors = [
            _et_text(a.find("atom:name", ns)) for a in entry.findall("atom:author", ns)
        ]
        pdf_url = None
        for link in entry.findall("atom:link", ns):
            href = link.get("href")
            typ = link.get("type")
            if typ == "application/pdf" or (href and "/pdf/" in href):
                pdf_url = href
                break
        if pdf_url and pdf_url.endswith(".pdf") is False and "/pdf/" in pdf_url:
            pdf_url = f"{pdf_url}.pdf"

        results.append(
            {
                "doc_id": doc_id,
                "title": title,
                "summary": summary,
                "published": published,
                "authors": authors,
                "pdf_url": pdf_url,
            }
        )
    return results


@router.options("/search")
async def options_search_arxiv():
    """Handle CORS preflight requests for /arxiv/search"""
    return Response(status_code=200)


@router.get("/search")
async def search_arxiv(
    q: Optional[str] = Query(None, description="free text"),
    title: Optional[str] = Query(None),
    author: Optional[str] = Query(None),
    abs: Optional[str] = Query(None, description="abstract contains"),
    cat: Optional[str] = Query(None, description="category, e.g., cs.CL"),
    start: int = Query(0, ge=0),
    max_results: int = Query(10, ge=1, le=200, description="Maximum number of results to return (default: 10)"),
    sortBy: Optional[str] = Query(
        None, pattern="^(relevance|lastUpdatedDate|submittedDate)$"
    ),
    sortOrder: Optional[str] = Query(None, pattern="^(ascending|descending)$"),
):
    # Construct params per arXiv API
    query = _build_arxiv_query(q, title, author, abs, cat)
    params: dict[str, str | int] = {
        "search_query": query,
        "start": start,
        "max_results": max_results,
    }
    if sortBy:
        params["sortBy"] = sortBy
    if sortOrder:
        params["sortOrder"] = sortOrder

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(30.0, connect=10.0),
        headers={"User-Agent": UA, "Accept": "application/atom+xml"},
        follow_redirects=True,
    ) as client:
        try:
            r = await client.get(ARXIV_API, params=params)
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Request to arXiv API timed out. Please try again later."
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to connect to arXiv API: {str(e)}"
            )
        
        # Handle specific status codes
        if r.status_code == 200:
            items = _parse_arxiv_feed(r.text)
            return JSONResponse({"results": items, "count": len(items)})
        elif r.status_code == 429:
            # Rate limiting
            retry_after = r.headers.get("Retry-After", "unknown")
            logger.warning(
                f"arXiv API rate limit exceeded. Status: {r.status_code}, "
                f"Retry-After: {retry_after}, Query: {query[:100]}"
            )
            raise HTTPException(
                status_code=429,
                detail=f"arXiv API rate limit exceeded. Please wait before making more requests. Retry after: {retry_after} seconds"
            )
        elif r.status_code == 400:
            # Bad request - might be invalid query
            raise HTTPException(
                status_code=400,
                detail=f"Invalid request to arXiv API: {r.text[:200] if r.text else 'Bad request'}"
            )
        elif r.status_code == 403:
            # Forbidden
            raise HTTPException(
                status_code=403,
                detail="Access forbidden by arXiv API. This may be due to rate limiting or blocking."
            )
        elif r.status_code == 503:
            # Service unavailable
            raise HTTPException(
                status_code=503,
                detail="arXiv API is temporarily unavailable. Please try again later."
            )
        else:
            # Other status codes
            raise HTTPException(
                status_code=r.status_code,
                detail=f"arXiv API returned error: {r.status_code} - {r.text[:200] if r.text else 'Unknown error'}"
            )


@router.get("/download/{doc_id}")
async def download_arxiv_pdf(doc_id: str, version: Optional[str] = None):
    if version:
        if version.startswith("v"):
            pdf_id = f"{doc_id}{version}"
        else:
            pdf_id = f"{doc_id}v{version}"
    else:
        pdf_id = doc_id

    pdf_url = f"https://arxiv.org/pdf/{pdf_id}.pdf"

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, connect=10.0),
        headers={"User-Agent": UA},
        follow_redirects=True,
    ) as client:
        try:
            r = await client.get(pdf_url)
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Fetch error: {str(e)}")
        if r.status_code != 200:
            raise HTTPException(
                status_code=r.status_code, detail="Failed to fetch arXiv PDF"
            )

        return StreamingResponse(
            iter([r.content]),
            media_type=r.headers.get("content-type", "application/pdf"),
            headers={
                "Content-Disposition": f'attachment; filename="{doc_id}.pdf"',
                "Cache-Control": "public, max-age=86400",
            },
        )
