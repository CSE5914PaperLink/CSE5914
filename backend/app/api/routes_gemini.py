import json
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.core.config import settings
from fastapi import Body
from app.services.chroma_service import ChromaService
from app.services.gemini_service import GeminiEmbeddingService

router = APIRouter(prefix="/gemini", tags=["gemini"])
MAX_CONTEXT_CHUNK_CHARS = 1500
MAX_CITATION_SNIPPET_CHARS = 320
DEFAULT_CHUNK_RESULTS = 6


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

    doc_ids_input = body.get("doc_ids") or []
    doc_ids = [d for d in doc_ids_input if isinstance(d, str)]

    def _parse_list_field(value: Any) -> List[Any]:
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                return []
        return []

    def _parse_int_list(value: Any) -> List[int]:
        ints: List[int] = []
        for item in _parse_list_field(value):
            if isinstance(item, int):
                ints.append(item)
            elif isinstance(item, float):
                ints.append(int(item))
            elif isinstance(item, str):
                try:
                    ints.append(int(item))
                except ValueError:
                    continue
        return ints

    def _parse_str_list(value: Any) -> List[str]:
        strings: List[str] = []
        for item in _parse_list_field(value):
            if isinstance(item, str):
                stripped = item.strip()
                if stripped:
                    strings.append(stripped)
        return strings

    context_block = ""
    citations: List[Dict[str, Any]] = []

    if doc_ids:
        chroma = ChromaService()
        chunk_matches: List[Dict[str, Any]] = []
        max_chunks = int(body.get("max_chunks") or DEFAULT_CHUNK_RESULTS)
        max_chunks = max(1, min(max_chunks, 12))

        query_embedding: Optional[List[float]] = None
        try:
            embedder = GeminiEmbeddingService()
            embeddings = embedder.embed_texts(
                [prompt], task_type="retrieval_query"
            )
            if embeddings:
                query_embedding = embeddings[0]
        except Exception:
            query_embedding = None

        if query_embedding is not None:
            try:
                where_filter = {
                    "$and": [
                        {"kind": {"$eq": "chunk"}},
                        {"root_id": {"$in": doc_ids}},
                    ]
                }
                query_result = chroma.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=min(max_chunks * 2, max_chunks + len(doc_ids) * 3),
                    where=where_filter,
                    include=["metadatas", "documents", "distances"],
                )
                ids_list = (query_result.get("ids") or [[]])[0] or []
                docs_list = (query_result.get("documents") or [[]])[0] or []
                metas_list = (query_result.get("metadatas") or [[]])[0] or []
                dist_list = (query_result.get("distances") or [[]])[0] or []
                count = min(len(ids_list), len(docs_list), len(metas_list))
                for i in range(count):
                    chunk_id = ids_list[i]
                    chunk_text = (docs_list[i] or "").strip()
                    if not chunk_text:
                        continue
                    metadata = metas_list[i] or {}
                    distance = dist_list[i] if i < len(dist_list) else None
                    chunk_matches.append(
                        {
                            "chunk_id": chunk_id,
                            "text": chunk_text,
                            "metadata": metadata,
                            "distance": distance,
                        }
                    )
            except Exception:
                chunk_matches = []

        if not chunk_matches:
            try:
                data = chroma.collection.get(
                    ids=list(doc_ids), include=["metadatas", "documents"]
                )
                for i, _id in enumerate(data.get("ids", [])):
                    chunk_text = ((data.get("documents") or [None])[i] or "").strip()
                    if not chunk_text:
                        continue
                    metadata = (data.get("metadatas") or [{}])[i] or {}
                    chunk_matches.append(
                        {
                            "chunk_id": _id,
                            "text": chunk_text,
                            "metadata": metadata,
                            "distance": None,
                        }
                    )
            except Exception:
                chunk_matches = []

        if chunk_matches:
            context_sections: List[str] = []
            for match in chunk_matches[:max_chunks]:
                metadata = match.get("metadata") or {}
                root_id = (
                    metadata.get("root_id")
                    or metadata.get("doc_id")
                    or match.get("chunk_id")
                )
                title = metadata.get("title") or metadata.get("arxiv_id") or root_id
                headings = _parse_str_list(metadata.get("headings"))
                pages = _parse_int_list(metadata.get("page_numbers"))
                snippet = (match.get("text") or "").strip()
                trimmed_for_context = (
                    snippet
                    if len(snippet) <= MAX_CONTEXT_CHUNK_CHARS
                    else snippet[:MAX_CONTEXT_CHUNK_CHARS] + "..."
                )
                section_lines = [
                    f"Document: {title}",
                    f"Source id: {root_id}",
                ]
                if pages:
                    page_text = ", ".join(str(p) for p in pages[:4])
                    section_lines.append(f"Pages: {page_text}")
                if headings:
                    section_lines.append(f"Section: {' > '.join(headings)}")
                section_lines.append("Content:")
                section_lines.append(trimmed_for_context)
                context_sections.append("\n".join(section_lines))

                citations.append(
                    {
                        "id": match.get("chunk_id"),
                        "doc_id": root_id,
                        "title": title,
                        "pages": pages,
                        "heading": headings[-1] if headings else None,
                        "snippet": (
                            snippet
                            if len(snippet) <= MAX_CITATION_SNIPPET_CHARS
                            else snippet[:MAX_CITATION_SNIPPET_CHARS] + "..."
                        ),
                        "pdf_url": metadata.get("pdf_url"),
                        "chunk_index": metadata.get("chunk_index"),
                        "score": match.get("distance"),
                    }
                )

            if context_sections:
                context_block = "\n---\n".join(context_sections)

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
        return JSONResponse(
            {"model": model_name, "content": content_text, "citations": citations}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
