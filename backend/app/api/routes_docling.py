from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field, HttpUrl

from app.services.docling_service import DoclingService

router = APIRouter(prefix="/docling", tags=["docling"])


class ImageAssetModel(BaseModel):
    filename: str
    data_base64: str
    media_type: str | None = None
    page: int | None = None


class DoclingMetadataModel(BaseModel):
    # Legacy fields (currently unused in service but kept for compatibility)
    title: str | None = None
    authors: list[str] = Field(default_factory=list)
    abstract: str | None = None
    sections: list[dict] = Field(default_factory=list)
    page_count: int | None = None

    # Actual outputs from DoclingService
    markdown: str | None = None
    images: list[ImageAssetModel] = Field(default_factory=list)


_service = DoclingService()


@router.post("/extract", response_model=DoclingMetadataModel)
async def extract_from_pdf(file: UploadFile = File(...)):
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    data = await file.read()
    try:
        meta = _service.extract_from_bytes(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docling error: {e}")
    return DoclingMetadataModel(**meta.__dict__)


class UrlIn(BaseModel):
    url: HttpUrl


@router.post("/extract_url", response_model=DoclingMetadataModel)
async def extract_from_url(body: UrlIn):
    try:
        meta = _service.extract_from_url(str(body.url))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docling error: {e}")
    return DoclingMetadataModel(**meta.__dict__)
