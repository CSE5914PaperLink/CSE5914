from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse

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


@router.get("/search")
async def search_arxiv(
    q: Optional[str] = Query(None, description="free text"),
    title: Optional[str] = Query(None),
    author: Optional[str] = Query(None),
    abs: Optional[str] = Query(None, description="abstract contains"),
    cat: Optional[str] = Query(None, description="category, e.g., cs.CL"),
    start: int = Query(0, ge=0),
    max_results: int = Query(10, ge=1, le=200),
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
        r = await client.get(ARXIV_API, params=params)
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        # arXiv returns Atom XML; return raw text so the client can parse or display
        return JSONResponse({"atom": r.text})


@router.get("/download/{arxiv_id}")
async def download_arxiv_pdf(arxiv_id: str, version: Optional[str] = None):
    # arXiv PDFs follow https://arxiv.org/pdf/<id>.pdf. Version can be appended like 2101.00001v2
    if version:
        if version.startswith("v"):
            pdf_id = f"{arxiv_id}{version}"
        else:
            pdf_id = f"{arxiv_id}v{version}"
    else:
        pdf_id = arxiv_id

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
                "Content-Disposition": f'attachment; filename="{arxiv_id}.pdf"',
                "Cache-Control": "public, max-age=86400",
            },
        )
