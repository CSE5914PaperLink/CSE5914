from typing import Optional

from google import genai
from google.genai import types
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.core.config import settings
from fastapi import Body
from app.services.chroma_service import ChromaService

router = APIRouter(prefix="/gemini", tags=["gemini"])


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

    model_name = model or settings.gemini_default_model

    try:
        # Get the genai client with API key
        client = genai.Client(api_key=settings.gemini_api_key)

        # Build the prompt, prepending system instruction if provided
        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
            system_instruction=system,
        )

        # Generate content using the new genai client
        response = client.models.generate_content(
            model=model_name,
            config=config,
            contents=[prompt],
        )

        # Extract text from response
        content_text = response.text

        return JSONResponse(
            {
                "model": model_name,
                "content": content_text,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat_rag")
async def chat_rag(
    body: dict = Body(
        ..., description="JSON body with prompt, system, temperature, optional doc_ids"
    ),
):
    """
    RAG-enabled chat: accepts JSON body { prompt, system, temperature, doc_ids: [id, ...] }
    If doc_ids are provided, fetch documents from Chroma and prepend them as context.
    """
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    prompt = body.get("prompt")
    if not prompt or not isinstance(prompt, str):
        raise HTTPException(status_code=400, detail="prompt is required")

    system = body.get("system")
    temperature = float(body.get("temperature") or 0.2)
    model_name = body.get("model") or settings.gemini_default_model

    # If doc_ids provided, fetch their documents and build a context block
    doc_ids = body.get("doc_ids") or []
    context_block = ""
    if isinstance(doc_ids, list) and len(doc_ids) > 0:
        try:
            chroma = ChromaService()
            # Use collection.get to fetch metadatas/documents for the given ids
            data = chroma.collection.get(
                ids=list(doc_ids), include=["metadatas", "documents"]
            )
            docs = []
            for i, _id in enumerate(data.get("ids", [])):
                doc_text = (data.get("documents") or [None])[i] or ""
                md = (data.get("metadatas") or [{}])[i] or {}
                title = md.get("title") or md.get("arxiv_id") or _id
                docs.append(
                    f"Title: {title}\nSource id: {_id}\nContent:\n{doc_text}\n---\n"
                )
            if docs:
                context_block = "\n".join(docs)
        except Exception:
            # If RAG retrieval fails, continue without contextual docs
            context_block = ""

    # Prepend context to the system instruction or create a dedicated system message
    system_instruction = system or "You are a helpful AI assistant for researchers."
    if context_block:
        system_instruction = (
            "Use the following documents as context when answering. "
            "If the answer is not contained in them, you may still use general knowledge.\n\n"
            + context_block
            + "\n"
            + system_instruction
        )

    try:
        client = genai.Client(api_key=settings.gemini_api_key)
        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction,
        )
        response = client.models.generate_content(
            model=model_name,
            config=config,
            contents=[prompt],
        )
        content_text = response.text
        return JSONResponse({"model": model_name, "content": content_text})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
