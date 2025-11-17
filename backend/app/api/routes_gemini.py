from typing import Optional
import json

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
    raw_doc_ids = body.get("doc_ids")
    # Normalize doc_ids input to a clean list of strings
    if isinstance(raw_doc_ids, str):
        doc_ids = [raw_doc_ids.strip()] if raw_doc_ids.strip() else []
    elif isinstance(raw_doc_ids, list):
        doc_ids = [str(d).strip() for d in raw_doc_ids if str(d).strip()]
    else:
        doc_ids = []
    context_block = ""
    retrieved_chunks: list[dict[str, Any]] = []
    image_parts = []

    print(f"DEBUG: Received doc_ids filter: {doc_ids}")

    try:
        # 1) Embed query using local Nomic embeddings
        embedder = NomicEmbeddingService()
        query_vec = embedder.embed_query(prompt)

        # 2) Build optional metadata filter for Chroma
        where_filter: dict[str, Any] | None = None
        if doc_ids:
            where_filter = {"doc_id": {"$in": doc_ids}}

        # 3) Query Chroma for top_k most similar chunks
        # Use hybrid retrieval: get text chunks + separately get image chunks
        emb_dim = len(query_vec) if isinstance(query_vec, list) else None
        chroma = ChromaService(embedding_dim=emb_dim)

        # First, retrieve text chunks using text embedding
        text_query_kwargs = {
            "query_embeddings": [query_vec],
            "n_results": top_k,
            "include": cast(Any, ["documents", "metadatas", "distances"]),
        }
        # Build where clause with $and for multiple conditions
        if where_filter:
            text_where = {"$and": [where_filter, {"chunk_type": "text"}]}
        else:
            text_where = {"chunk_type": "text"}
        text_query_kwargs["where"] = text_where

        print(f"DEBUG: Querying for text chunks with where={text_where}")
        text_res = chroma.collection.query(**text_query_kwargs)
        print(f"DEBUG: Retrieved {len((text_res.get('ids') or [[]])[0])} text chunks")

        # Second, retrieve image chunks using the same text embedding
        # (Images were embedded separately, so scores may be lower, but we still want some)
        image_query_kwargs = {
            "query_embeddings": [query_vec],
            "n_results": max(2, top_k // 2),  # Get at least 2 images, or half of top_k
            "include": cast(Any, ["documents", "metadatas", "distances"]),
        }
        # Build where clause with $and for multiple conditions
        if where_filter:
            image_where = {"$and": [where_filter, {"chunk_type": "image"}]}
        else:
            image_where = {"chunk_type": "image"}
        image_query_kwargs["where"] = image_where

        print(f"DEBUG: Querying for image chunks with where={image_where}")
        try:
            image_res = chroma.collection.query(**image_query_kwargs)
            print(
                f"DEBUG: Retrieved {len((image_res.get('ids') or [[]])[0])} image chunks"
            )
        except Exception as e:
            print(f"DEBUG: Image retrieval failed: {e}")
            image_res = {
                "documents": [[]],
                "ids": [[]],
                "metadatas": [[]],
                "distances": [[]],
            }

        # Combine results
        docs = (text_res.get("documents") or [[]])[0] + (
            image_res.get("documents") or [[]]
        )[0]
        ids = (text_res.get("ids") or [[]])[0] + (image_res.get("ids") or [[]])[0]
        metas = (text_res.get("metadatas") or [[]])[0] + (
            image_res.get("metadatas") or [[]]
        )[0]
        dists = (text_res.get("distances") or [[]])[0] + (
            image_res.get("distances") or [[]]
        )[0]

        print(f"DEBUG: Retrieved {len(docs)} chunks from Chroma")

        # Debug: print all metadata to see what chunk_type values are present
        for i, md in enumerate(metas[:3] if len(metas) > 3 else metas):
            print(f"DEBUG: Metadata {i}: {md}")
            if md:
                print(f"DEBUG:   chunk_type = {md.get('chunk_type')}")

        # Separate text and image chunks
        text_chunks = []
        image_chunks = []

        for i in range(min(len(docs), len(ids))):
            md = metas[i] if i < len(metas) and metas[i] is not None else {}
            chunk_type = (md or {}).get("chunk_type", "text")

            chunk_data = {
                "id": ids[i],
                "doc_id": (md or {}).get("doc_id"),
                "distance": dists[i] if i < len(dists) else None,
                "content": docs[i],
            }

            if chunk_type == "image":
                # This is an embedded image chunk
                chunk_data["type"] = "image"
                chunk_data["filename"] = (md or {}).get("filename")
                chunk_data["page"] = (md or {}).get("page")
                chunk_data["media_type"] = (md or {}).get("media_type")
                chunk_data["image_index"] = (md or {}).get("image_index")

                # Extract bounding box if available
                bbox_json = (md or {}).get("bbox")
                if bbox_json:
                    try:
                        # bbox might be stored as JSON string by sanitize
                        if isinstance(bbox_json, str):
                            chunk_data["bbox"] = json.loads(bbox_json)
                        else:
                            # Or as individual float fields
                            chunk_data["bbox"] = {
                                "l": (md or {}).get("bbox_left", 0.0),
                                "r": (md or {}).get("bbox_right", 0.0),
                                "t": (md or {}).get("bbox_top", 0.0),
                                "b": (md or {}).get("bbox_bottom", 0.0),
                            }
                    except Exception as e:
                        print(f"DEBUG: Failed to parse bbox: {e}")
                        chunk_data["bbox"] = None

                # Get image data (base64) for display
                image_data = (md or {}).get("image_data")
                if image_data:
                    # Don't include full base64 in response, provide URL instead
                    chunk_data["url"] = (
                        f"/library/images/{chunk_data['doc_id']}/{chunk_data['filename']}"
                    )

                image_chunks.append(chunk_data)
            else:
                # This is a text chunk
                chunk_data["type"] = "text"
                chunk_data["chunk_index"] = (md or {}).get("chunk_index")
                chunk_data["preview"] = (md or {}).get("preview")
                text_chunks.append(chunk_data)

        retrieved_chunks = text_chunks + image_chunks
        print(
            f"DEBUG: Split into {len(text_chunks)} text chunks and {len(image_chunks)} image chunks"
        )

        # Extract image data from metadata for multimodal context
        image_parts = []
        if retrieved_chunks:
            parts = []
            for ch in retrieved_chunks:
                if ch.get("type") == "image":
                    # Get the base64 image data from metadata
                    md = None
                    for i in range(len(ids)):
                        if ids[i] == ch.get("id"):
                            md = metas[i] if i < len(metas) else None
                            break

                    if md and md.get("image_data"):
                        # Store image data for multimodal prompt
                        image_parts.append(
                            {
                                "id": ch.get("id"),
                                "data": md["image_data"],
                                "page": ch.get("page"),
                                "filename": ch.get("filename"),
                                "bbox": ch.get("bbox"),
                            }
                        )

                    # Format image chunk reference
                    bbox_str = ""
                    if ch.get("bbox"):
                        bbox = ch["bbox"]
                        bbox_str = f" bbox=[l:{bbox.get('l'):.1f}, r:{bbox.get('r'):.1f}, t:{bbox.get('t'):.1f}, b:{bbox.get('b'):.1f}]"
                    parts.append(
                        f"[IMAGE id={ch.get('id')} doc_id={ch.get('doc_id')} page={ch.get('page')} {ch.get('filename')}{bbox_str}]\n"
                        f"Description: {ch.get('content')}\n---\n"
                    )
                else:
                    # Format text chunk
                    parts.append(
                        f"[CHUNK id={ch.get('id')} doc_id={ch.get('doc_id')} idx={ch.get('chunk_index')}]\n"
                        f"{ch.get('content')}\n---\n"
                    )
            context_block = "".join(parts)
    except Exception as e:
        # If RAG retrieval fails, continue without contextual docs
        print(f"DEBUG: RAG retrieval error: {e}")
        import traceback

        traceback.print_exc()
        context_block = ""
        retrieved_chunks = []

    print(f"DEBUG: Context block:\n{context_block}")
    # Prepend context to the system instruction or create a dedicated system message
    system_instruction = system or "You are a helpful AI assistant for researchers."
    if context_block:
        system_instruction = (
            "Use the following retrieved chunks as authoritative context. "
            "Text chunks contain document content. Image chunks represent figures, charts, and diagrams extracted from the papers. "
            "When referencing images, use the figure number. The images have been semantically embedded and retrieved based on relevance to the query.\n\n"
            "IMPORTANT: When you reference information from a specific chunk or image in your response, cite it using square brackets with the source number, like [1], [2], etc. "
            "Number the sources in the order they appear in the context below (starting from 1). "
            "Place citations immediately after the relevant statement or fact.\n\n"
            + context_block
            + "\n\n"
            "When the user asks to 'summarize this' or 'what is this about', they are referring to the paper excerpts above. "
            "Provide detailed answers based on the retrieved content. "
            "If you need to cite specific information, reference the chunk IDs.\n\n"
            + system_instruction
        )

    try:
        svc = GeminiService()
        content_text = svc.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            model=model_name,
            temperature=temperature,
            images=image_parts if image_parts else None,
        )

        # Separate chunks by type for response
        text_chunks_out = [ch for ch in retrieved_chunks if ch.get("type") == "text"]
        image_chunks_out = [ch for ch in retrieved_chunks if ch.get("type") == "image"]

        return JSONResponse(
            {
                "model": model_name,
                "content": content_text,
                "top_k": top_k,
                "chunks": text_chunks_out,
                "images": image_chunks_out,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
