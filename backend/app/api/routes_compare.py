from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.chroma_service import ChromaService
from app.services.comparison_service import ComparisonService


router = APIRouter(prefix="/compare", tags=["compare"])


class CompareRequest(BaseModel):
    doc_a: str = Field(..., description="First document ID")
    doc_b: str = Field(..., description="Second document ID")


class MatrixRequest(BaseModel):
    doc_ids: list[str] = Field(..., description="List of document IDs to compare")
    aspects: list[str] | None = Field(None, description="Optional list of aspects to extract")


@router.post("")
def compare_documents(payload: CompareRequest) -> Dict[str, Any]:
    chroma = ChromaService()
    service = ComparisonService(chroma_service=chroma)
    try:
        return service.compare_documents(payload.doc_a, payload.doc_b)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/matrix")
def generate_matrix(payload: MatrixRequest) -> Dict[str, Any]:
    chroma = ChromaService()
    service = ComparisonService(chroma_service=chroma)
    try:
        return service.generate_matrix(payload.doc_ids, payload.aspects)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
