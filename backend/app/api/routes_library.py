from __future__ import annotations

import logging
from typing import Optional, List
from dataclasses import asdict
import json
import base64

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, Response
import httpx
from xml.etree import ElementTree as ET
from pydantic import BaseModel, Field

from app.services.embedding_service import ingest_pdf_bytes_into_chroma, PdfMetadata
from app.services.embedding_service import ingest_repo_files_into_chroma
from app.services.github_service import GitHubService, normalize_github_url
from app.services.chroma_service import ChromaService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/library", tags=["library"])

ARXIV_API = "https://export.arxiv.org/api/query"
UA = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"


class AddArxivRequest(BaseModel):
    github_repos: List[str] = Field(
        default_factory=list,
        description="Optional list of GitHub repository URLs to ingest alongside the PDF.",
    )


@router.get("/debug/list_all")
def debug_list_all():
    chroma = ChromaService()
    try:
        data = chroma.collection.get(include=["metadatas"], limit=100)

        doc_info = {}
        for i, chunk_id in enumerate(data.get("ids", [])):
            md = (data.get("metadatas") or [{}])[i] or {}
            doc_id = md.get("doc_id", "unknown")

            if doc_id not in doc_info:
                images_json = md.get("images", "[]")
                try:
                    images = (
                        json.loads(images_json) if isinstance(images_json, str) else []
                    )
                    doc_info[doc_id] = {
                        "doc_id": doc_id,
                        "chunk_count": 1,
                        "image_count": len(images),
                        "sample_chunk_id": chunk_id,
                        "title": md.get("title"),
                    }
                except Exception:
                    doc_info[doc_id] = {
                        "doc_id": doc_id,
                        "chunk_count": 1,
                        "image_count": 0,
                        "sample_chunk_id": chunk_id,
                        "title": md.get("title"),
                    }
            else:
                doc_info[doc_id]["chunk_count"] += 1

        return JSONResponse(
            {"documents": list(doc_info.values()), "total_docs": len(doc_info)}
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


def _fetch_arxiv_metadata(doc_id: str) -> dict:
    try:
        r = httpx.get(
            ARXIV_API,
            params={"id_list": doc_id},
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


@router.post("/check_batch")
def check_batch_papers(doc_ids: List[str]):
    chroma = ChromaService()
    results = {}

    doc_id_list = [f"{aid}" for aid in doc_ids]

    try:
        data = chroma.collection.get(
            include=["metadatas"],
            limit=10000,
        )

        existing_doc_ids = set()
        for i, chunk_id in enumerate(data.get("ids", [])):
            md = (data.get("metadatas") or [{}])[i] or {}
            if md.get("doc_id"):
                existing_doc_ids.add(md["doc_id"])

        for doc_id in doc_ids:
            doc_id_str = f"{doc_id}"
            results[doc_id] = doc_id_str in existing_doc_ids

    except Exception as e:
        for doc_id in doc_ids:
            doc_id_str = f"{doc_id}"
            try:
                data = chroma.collection.get(
                    where={"doc_id": doc_id_str}, limit=1, include=[]
                )
                results[doc_id] = len(data.get("ids", [])) > 0
            except Exception:
                results[doc_id] = False

    return JSONResponse({"results": results})


@router.post("/add/{doc_id}")
async def add_arxiv(doc_id: str, request: Optional[AddArxivRequest] = None):
    if request is None:
        request = AddArxivRequest()
    github_service = GitHubService()
    pdf_url = f"https://arxiv.org/pdf/{doc_id}.pdf"
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, connect=10.0),
        headers={"User-Agent": UA},
        follow_redirects=True,
    ) as client:
        r = await client.get(pdf_url)
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail="Failed to fetch PDF")
        pdf_bytes = r.content

    meta = _fetch_arxiv_metadata(doc_id)
    github_url = None
    if request.github_repos:
        github_url = normalize_github_url(request.github_repos[0])

    pdf_meta = PdfMetadata(
        doc_id=doc_id,
        pdf_url=pdf_url,
        title=meta.get("title", ""),
        summary=meta.get("summary", ""),
        published=meta.get("published", ""),
        authors=meta.get("authors", []),
        github_url=github_url, 
    )

    stats = ingest_pdf_bytes_into_chroma(pdf_bytes, extra_metadata=pdf_meta)
    # If GitHub repo exists, fetch files & ingest to Chroma
    repo_url = pdf_meta.github_url
    if repo_url:
        repo_files = await github_service.fetch_repo_files(repo_url)
        if repo_files:
            ingest_repo_files_into_chroma(
                repo_url=repo_url,
                arxiv_id=doc_id,
                repo_files=repo_files,
                base_metadata={
                    "doc_id": doc_id,
                    "source": "github",
                },
            )
    response_data = {
        "status": "ok",
        "doc_id": doc_id,
        "metadata": asdict(pdf_meta),
        "ingestion": stats,
        "repos": [],
    }

    if request.github_repos:
        github_service = GitHubService()
        base_metadata = asdict(pdf_meta)

        for repo_url in request.github_repos:
            try:
                normalized_url = normalize_github_url(repo_url)
                logger.info(f"Fetching files from {normalized_url}")
                repo_files = await github_service.fetch_repo_files(normalized_url)

                if not repo_files:
                    logger.warning(f"No files fetched from {normalized_url}")
                    response_data["repos"].append(
                        {
                            "url": normalized_url,
                            "status": "warning",
                            "files_ingested": 0,
                            "reason": "No files fetched",
                        }
                    )
                    continue

                files_ingested = ingest_repo_files_into_chroma(
                    repo_url=normalized_url,
                    arxiv_id=doc_id,
                    repo_files=repo_files,
                    base_metadata=base_metadata,
                )

                response_data["repos"].append(
                    {
                        "url": normalized_url,
                        "status": "ok",
                        "files_ingested": files_ingested,
                    }
                )
                logger.info(
                    f"Ingested {files_ingested} files from {normalized_url} for {doc_id}"
                )
            except Exception as e:
                logger.error(f"Failed to ingest repo {repo_url}: {e}")
                response_data["repos"].append(
                    {
                        "url": repo_url,
                        "status": "error",
                        "error": str(e),
                    }
                )

    return JSONResponse(response_data)


@router.get("/list")
def list_library(limit: int = 500, offset: int = 0):
    chroma = ChromaService()
    data = chroma.collection.get(include=["metadatas"], limit=limit, offset=offset)
    results = []
    for i, _id in enumerate(data.get("ids", [])):
        md = (data.get("metadatas") or [{}])[i] or {}
        results.append(
            {
                "id": _id,
                "metadata": md,
            }
        )
    return JSONResponse({"results": results, "count": len(results)})


@router.get("/chunks/{doc_id}")
def list_chunks(doc_id: str, limit: int = 200, offset: int = 0):
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
    chroma = ChromaService()

    try:
        to_delete = []

        data = chroma.collection.get(include=["metadatas", "documents"])
        for i, _id in enumerate(data.get("ids", [])):
            md = (data.get("metadatas") or [{}])[i] or {}
            if (
                md.get("doc_id") == doc_id
                or str(_id).startswith(f"{doc_id}::chunk::")
                or str(_id) == doc_id
            ):
                to_delete.append(_id)

        if not to_delete:
            chroma.delete([doc_id])
            return JSONResponse({"status": "deleted", "id": doc_id})

        chroma.delete(to_delete)
        return JSONResponse({"status": "deleted", "deleted_count": len(to_delete)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
