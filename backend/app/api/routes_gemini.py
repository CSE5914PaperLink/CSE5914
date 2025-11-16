from typing import Optional

from google import genai
from google.genai import types
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional, Any, cast

from app.core.config import settings
from fastapi import Body
from app.services.chroma_service import ChromaService
from app.services.embedding_service import NomicEmbeddingService
from app.services.gemini_service import GeminiService

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
        svc = GeminiService()
        content_text = svc.generate_content(
            prompt=prompt,
            system_instruction=system,
            model=model_name,
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

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
    RAG-enabled chat over chunked Nomic embeddings.

    Body schema:
    {
      prompt: str,
      system?: str,
      temperature?: number,
      model?: string,
      top_k?: number,                 # default 5
      doc_ids?: string[]              # optional filter to restrict retrieval to specific doc_ids
    }

    Behavior:
    - Embeds the prompt with Nomic, performs similarity search against Chroma chunk vectors
      (ingested via Nomic chunking), and prepends the top_k chunks as context for Gemini.
    - If doc_ids are provided, retrieval is filtered to those documents via metadata doc_id.
    """
    prompt = body.get("prompt")
    if not prompt or not isinstance(prompt, str):
        raise HTTPException(status_code=400, detail="prompt is required")

    system = body.get("system")
    temperature = float(body.get("temperature") or 0.2)
    model_name = body.get("model") or settings.gemini_default_model
    top_k = int(body.get("top_k") or 5)

    # Build a similarity-retrieved context from chunked Chroma entries
    doc_ids = body.get("doc_ids") or []
    context_block = ""
    retrieved_chunks: list[dict[str, Any]] = []
    try:
        # 1) Embed query using local Nomic embeddings
        embedder = NomicEmbeddingService()
        query_vec = embedder.embed_query(prompt)

        # 2) Build optional metadata filter for Chroma
        where_filter: dict[str, Any] | None = None
        if isinstance(doc_ids, list) and len(doc_ids) > 0:
            # Chroma supports simple filters; try $in for multiple doc ids
            if len(doc_ids) == 1:
                where_filter = {"doc_id": str(doc_ids[0])}
            else:
                where_filter = {"doc_id": {"$in": [str(d) for d in doc_ids]}}

        # 3) Query Chroma for top_k most similar chunks
        emb_dim = len(query_vec) if isinstance(query_vec, list) else None
        chroma = ChromaService(embedding_dim=emb_dim)
        query_kwargs = {
            "query_embeddings": [query_vec],
            "n_results": top_k,
            "include": cast(Any, ["documents", "metadatas", "ids", "distances"]),
        }
        if where_filter:
            query_kwargs["where"] = where_filter

        res = chroma.collection.query(**query_kwargs)

        # 4) Unpack first (and only) query's results
        docs = (res.get("documents") or [[]])[0]
        ids = (res.get("ids") or [[]])[0]
        metas = (res.get("metadatas") or [[]])[0]
        dists = (res.get("distances") or [[]])[0]

        for i in range(min(len(docs), len(ids))):
            md = metas[i] if i < len(metas) and metas[i] is not None else {}
            retrieved_chunks.append(
                {
                    "id": ids[i],
                    "doc_id": (md or {}).get("doc_id"),
                    "chunk_index": (md or {}).get("chunk_index"),
                    "distance": dists[i] if i < len(dists) else None,
                    "preview": (md or {}).get("preview"),
                    "content": docs[i],
                }
            )

        if retrieved_chunks:
            parts = []
            for ch in retrieved_chunks:
                parts.append(
                    (
                        f"[CHUNK id={ch.get('id')} doc_id={ch.get('doc_id')} idx={ch.get('chunk_index')}]\n"
                        f"{ch.get('content')}\n---\n"
                    )
                )
            context_block = "".join(parts)
    except Exception:
        # If RAG retrieval fails, continue without contextual docs
        context_block = ""
        retrieved_chunks = []

    # Prepend context to the system instruction or create a dedicated system message
    system_instruction = system or "You are a helpful AI assistant for researchers."
    if context_block:
        system_instruction = (
            "Use the following retrieved chunks as authoritative context. "
            "Cite relevant chunks by id when helpful. If the answer is not contained in them, you may say you don't know.\n\n"
            + context_block
            + "\n"
            + system_instruction
        )

    try:
        svc = GeminiService()
        content_text = svc.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            model=model_name,
            temperature=temperature,
        )
        return JSONResponse(
            {
                "model": model_name,
                "content": content_text,
                "top_k": top_k,
                "chunks": retrieved_chunks,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
