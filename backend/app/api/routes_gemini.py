from typing import Optional, Any
import json

from fastapi import APIRouter, HTTPException, Query, Body
from fastapi.responses import JSONResponse, StreamingResponse

from app.core.config import settings
from app.services.chroma_service import ChromaService
from app.services.embedding_service import NomicEmbeddingService
from app.services.gemini_service import GeminiService
from app.services.agent_service import create_document_agent


router = APIRouter(prefix="/gemini", tags=["gemini"])


# -----------------------------
# GitHub question classifier
# -----------------------------
def is_github_question(prompt: str) -> bool:
    """Determine if user question relates to GitHub / repo / code."""
    keywords = [
        "github", "repo", "repository",
        "readme", "code", "source code",
        "file", "files", "implementation",
    ]
    p = prompt.lower()
    return any(k in p for k in keywords)


# -----------------------------
# Basic Gemini proxy endpoint
# -----------------------------
@router.post("/chat")
async def chat(
    prompt: str = Query(..., min_length=1, description="User prompt"),
    system: Optional[str] = Query(None, description="Optional system instruction"),
    model: Optional[str] = Query(None, description="Gemini model name"),
    temperature: float = Query(0.0, ge=0.0, le=2.0),
    max_tokens: Optional[int] = Query(None, ge=1),
):
    """Simple synchronous Gemini wrapper."""
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


# -----------------------------
# Chat agent endpoint (RAG)
# -----------------------------
@router.post("/chat_agent")
async def chat_agent(
    body: dict = Body(
        ...,
        description="JSON body with prompt, doc_ids, thread_id, temperature, model, top_k",
    ),
):
    """
    Request body example:
    {
        "prompt": str,
        "doc_ids": [string],
        "thread_id"?: str,
        "temperature"?: float,
        "model"?: str,
        "top_k"?: int,
    }

    Returns streaming result:
        {"type": "status", "value": "..."}
        {"type": "token", "value": "..."}
        {"type": "done"}
    """
    prompt = body.get("prompt")
    if not prompt or not isinstance(prompt, str):
        raise HTTPException(status_code=400, detail="prompt is required")

    thread_id = body.get("thread_id", "default")
    temperature = float(body.get("temperature", 0.0))
    model_name = body.get("model") or settings.gemini_default_model

    chroma = ChromaService()
    embedder = NomicEmbeddingService()

    # ------------------------------------
    # Decide whether this is a GitHub request
    # ------------------------------------
    github_mode = is_github_question(prompt)

    # Track retrieved chunks
    sources_tracker: dict[str, dict] = {}

    # Create RAG agent
    agent = create_document_agent(
        chroma_service=chroma,
        embedder=embedder,
        doc_ids=body.get("doc_ids", []),
        sources_tracker=sources_tracker,
        model_name=model_name,
        temperature=temperature,
    )

    # Add github_mode into runtime config
    config: Any = {
        "configurable": {
            "thread_id": thread_id,
            "github_mode": github_mode,
        }
    }

    async def event_generator():
        """Stream JSONL-like events."""
        yield json.dumps({"type": "status", "value": "thinking"}) + "\n"

        tool_call_detected = False
        first_content_token = True

        try:
            async for msg, metadata in agent.astream(
                {"messages": [("user", prompt)]},
                config=config,
                stream_mode="messages",
            ):
                langgraph_node = (
                    metadata.get("langgraph_node", "")
                    if isinstance(metadata, dict)
                    else ""
                )

                # If tool used
                if "tool" in langgraph_node.lower():
                    if not tool_call_detected:
                        tool_call_detected = True
                        yield json.dumps(
                            {"type": "status", "value": "searching"}
                        ) + "\n"
                    continue

                # Agent output
                if "agent" in langgraph_node.lower() and hasattr(msg, "content"):
                    content = getattr(msg, "content", None)
                    if not content:
                        continue

                    # first token => switch to answer mode
                    if first_content_token:
                        first_content_token = False
                        yield json.dumps(
                            {"type": "status", "value": "answer"}
                        ) + "\n"

                    yield json.dumps(
                        {"type": "token", "value": content}
                    ) + "\n"

            # after completion, return sources
            if sources_tracker:
                yield json.dumps(
                    {"type": "sources", "value": sources_tracker}
                ) + "\n"

            yield json.dumps({"type": "done"}) + "\n"

        except Exception as e:
            yield json.dumps({"type": "error", "value": str(e)}) + "\n"

    return StreamingResponse(
        event_generator(),
        media_type="application/json",
    )
