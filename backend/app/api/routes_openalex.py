from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.services.docling_service import DoclingService

router = APIRouter(prefix="/openalex", tags=["openalex"])


BASE_URL = "https://api.openalex.org"
UA = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"
ARXIV_SOURCE_ID = "S4306400194"  # arXiv (Cornell University)


async def _get_client() -> httpx.AsyncClient:
    # Single place to configure client timeouts and headers
    return httpx.AsyncClient(
        timeout=httpx.Timeout(30.0, connect=10.0),
        headers={"User-Agent": UA},
        follow_redirects=True,
    )


@router.get("/search")
async def search_openalex(
    q: Optional[str] = Query(None, description="Free-text search"),
    search: Optional[str] = Query(None, description="Alias for free-text search"),
    filter: Optional[str] = Query(None, description="Raw OpenAlex filter string"),
    from_publication_date: Optional[str] = Query(
        None, description="YYYY-MM-DD; builds filter from_publication_date:..."
    ),
    to_publication_date: Optional[str] = Query(
        None, description="YYYY-MM-DD; builds filter to_publication_date:..."
    ),
    min_citations: Optional[int] = Query(None, description=">= cited_by_count"),
    max_citations: Optional[int] = Query(None, description="<= cited_by_count"),
    is_oa: Optional[bool] = Query(None, description="is_oa:true/false"),
    has_fulltext: Optional[bool] = Query(None, description="has_fulltext:true/false"),
    sort: Optional[str] = Query(
        None, description="OpenAlex sort string, e.g., cited_by_count:desc"
    ),
    per_page: int = Query(10, ge=1, le=200),
    page: int = Query(1, ge=1),
):
    """Flexible OpenAlex works search.

    Supports:
    - Free text via `q` or `search` (sent as `search` to OpenAlex)
    - Raw `filter` passthrough, or convenience params that compile into filters
    - Date range (from_publication_date/to_publication_date)
    - Citation bounds (min_citations/max_citations)
    - is_oa, has_fulltext
    - Pagination and sort
    """
    params: dict[str, int | str] = {
        "per_page": per_page,
        "page": page,
    }

    # choose text search
    text = search if search is not None else q
    if text:
        params["search"] = text

    # construct filters if not provided
    filt_parts = []
    if filter:
        filt_parts.append(filter)
    if from_publication_date:
        filt_parts.append(f"from_publication_date:{from_publication_date}")
    if to_publication_date:
        filt_parts.append(f"to_publication_date:{to_publication_date}")
    if min_citations is not None:
        filt_parts.append(f"cited_by_count:>{min_citations-1}")
    if max_citations is not None:
        filt_parts.append(f"cited_by_count:<{max_citations+1}")
    if is_oa is not None:
        filt_parts.append(f"is_oa:{str(is_oa).lower()}")
    if has_fulltext is not None:
        filt_parts.append(f"has_fulltext:{str(has_fulltext).lower()}")

    # Always restrict to works that have an arXiv location
    filt_parts.append(f"locations.source.id:{ARXIV_SOURCE_ID}")

    if filt_parts:
        params["filter"] = ",".join(p for p in filt_parts if p)

    if sort:
        params["sort"] = sort

    async with await _get_client() as client:
        r = await client.get(f"{BASE_URL}/works", params=params)
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return JSONResponse(r.json())


@router.get("/works/{openalex_id}")
async def get_work(openalex_id: str):
    """Get a single work by its OpenAlex ID (e.g., W2741809807 or https://openalex.org/W...)."""
    # Normalize potential URL form to plain ID
    if openalex_id.startswith("http"):
        openalex_id = openalex_id.rstrip("/").split("/")[-1]
    async with await _get_client() as client:
        r = await client.get(f"{BASE_URL}/works/{openalex_id}")
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return JSONResponse(r.json())
