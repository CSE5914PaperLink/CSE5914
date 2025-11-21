from typing import Optional, Any
import json

from fastapi import APIRouter, HTTPException, Query, Body
from google import genai
from google.genai import types
from google.api_core.exceptions import ResourceExhausted
from fastapi.responses import JSONResponse, StreamingResponse

from app.core.config import settings
from app.services.chroma_service import ChromaService
from app.services.embedding_service import NomicEmbeddingService
from app.services.gemini_service import GeminiService
from app.services.agent_service import create_document_agent


router = APIRouter(prefix="/gemini", tags=["gemini"])


# GitHub question classifier
def is_github_question(prompt: str) -> bool:
    keywords = [
        "github", "repo", "repository",
        "readme", "code", "source code",
        "file", "files", "implementation",
    ]
    p = prompt.lower()
    return any(k in p for k in keywords)


# Basic Gemini proxy endpoint
@router.post("/chat")
async def chat(
    prompt: str = Query(...),
    system: Optional[str] = Query(None),
    model: Optional[str] = Query(None),
    temperature: float = Query(0.0),
    max_tokens: Optional[int] = Query(None),
):
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


# Chat agent endpoint (RAG)
@router.post("/chat_agent")
async def chat_agent(
    body: dict = Body(...),
):

    prompt = body.get("prompt")
    if not prompt or not isinstance(prompt, str):
        raise HTTPException(status_code=400, detail="prompt is required")

    thread_id = body.get("thread_id", "default")
    temperature = float(body.get("temperature", 0.0))
    model_name = body.get("model") or settings.gemini_default_model

    chroma = ChromaService()
    embedder = NomicEmbeddingService()

    # Decide whether to activate GitHub mode
    github_mode = is_github_question(prompt)

    # Track retrieved chunks for UI
    sources_tracker: dict[str, dict] = {}

    # Create the RAG agent
    agent = create_document_agent(
        chroma_service=chroma,
        embedder=embedder,
        doc_ids=body.get("doc_ids", []),
        sources_tracker=sources_tracker,
        model_name=model_name,
        temperature=temperature,
    )

    # Attach extra runtime configuration
    config: Any = {
        "configurable": {
            "thread_id": thread_id,
            "github_mode": github_mode,  
        }
    }

    doc_titles = body.get("doc_titles")
    prompt_context = build_prompt_with_titles(prompt, doc_titles)

    async def event_generator():

        yield json.dumps({"type": "status", "value": "thinking"}) + "\n"

        tool_call_detected = False
        first_content_token = True

        try:
            async for msg, metadata in agent.astream(
                {"messages": [("user", prompt_context)]},
                config=config,
                stream_mode="messages",
            ):
                langgraph_node = (
                    metadata.get("langgraph_node", "")
                    if isinstance(metadata, dict)
                    else ""
                )

                if "tool" in langgraph_node.lower():
                    if not tool_call_detected:
                        tool_call_detected = True
                        yield json.dumps({"type": "status", "value": "searching"}) + "\n"
                    continue

                if "agent" in langgraph_node.lower() and hasattr(msg, "content"):
                    content = getattr(msg, "content", None)
                    if not content:
                        continue

                    if first_content_token:
                        first_content_token = False
                        yield json.dumps({"type": "status", "value": "answer"}) + "\n"

                    yield json.dumps({"type": "token", "value": content}) + "\n"

            if sources_tracker:
                yield json.dumps({"type": "sources", "value": sources_tracker}) + "\n"

            yield json.dumps({"type": "done"}) + "\n"

        except ResourceExhausted:
            message = "The Gemini API rate limit was hit. Please wait a few seconds and try again."
            yield json.dumps({"type": "error", "value": message}) + "\n"
        except Exception as e:
            yield json.dumps({"type": "error", "value": str(e)}) + "\n"

    # Return as a streaming HTTP response (you can also use text/event-stream for SSE)
    return StreamingResponse(
        event_generator(),
        media_type="application/json",
    )


def build_prompt_with_titles(prompt: str, doc_titles: Any) -> str:
    if not isinstance(doc_titles, list) or not doc_titles:
        return prompt

    lines: list[str] = []
    for idx, entry in enumerate(doc_titles, start=1):
        if not isinstance(entry, dict):
            continue
        doc_id = entry.get("doc_id") or "unknown document"
        title = entry.get("title") or doc_id
        lines.append(f"{idx}. {title} (ID: {doc_id})")

    if not lines:
        return prompt

    joined = "\n".join(lines)
    return f"{prompt}\n\nContext documents in scope:\n{joined}"
