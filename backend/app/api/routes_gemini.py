from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.core.config import settings

router = APIRouter(prefix="/gemini", tags=["gemini"])

UA = "CSE5914-Backend/0.1 (https://github.com/jeevanadella/CSE5914)"


@router.post("/chat")
async def chat(
    prompt: str = Query(..., min_length=1, description="User prompt"),
    system: Optional[str] = Query(None, description="Optional system instruction"),
    model: Optional[str] = Query(None, description="Gemini model name"),
    temperature: float = Query(0.2, ge=0.0, le=2.0),
    max_tokens: Optional[int] = Query(None, ge=1),
):
    """
    Proxy to Google Gemini GenerateContent API (non-streaming).
    Accepts simple query parameters instead of a JSON body.
    """
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    api_base = settings.gemini_base_url.rstrip("/")
    model_name = model or settings.gemini_default_model

    contents = [{"role": "user", "parts": [{"text": prompt}]}]

    payload: dict = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
        },
    }
    if max_tokens is not None:
        payload["generationConfig"]["maxOutputTokens"] = max_tokens
    if system:
        payload["system_instruction"] = {
            "role": "system",
            "parts": [{"text": system}],
        }

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, connect=10.0),
        headers={
            "User-Agent": UA,
            "Content-Type": "application/json",
        },
        follow_redirects=True,
    ) as client:
        url = f"{api_base}/models/{model_name}:generateContent"
        r = await client.post(
            url, params={"key": settings.gemini_api_key}, json=payload
        )
        if r.status_code != 200:
            try:
                detail = r.json()
            except Exception:
                detail = r.text
            raise HTTPException(status_code=r.status_code, detail=detail)

        data = r.json()
        # Extract first candidate text
        content_text = ""
        candidates = data.get("candidates") or []
        if candidates:
            parts = (candidates[0].get("content") or {}).get("parts") or []
            content_text = "".join(p.get("text", "") for p in parts)

        return JSONResponse(
            {
                "model": model_name,
                "content": content_text,
                "candidates": data.get("candidates"),
                "usage": data.get("usageMetadata"),
            }
        )
