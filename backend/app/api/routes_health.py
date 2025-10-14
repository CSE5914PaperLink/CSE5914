from fastapi import APIRouter
from typing import Any, Dict, List
import os

try:
    # Optional import: generated JS/TS SDK is for frontend. For backend, we could call the HTTP endpoint directly.
    # Leaving here to hint where backend wiring could go if using Python GraphQL calls.
    pass
except Exception:
    pass

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/health/config")
def health_config() -> Dict[str, Any]:
    return {
        "dataconnect_source_dir": os.getenv("FIREBASE_DATACONNECT_SOURCE", "dataconnect"),
    }
