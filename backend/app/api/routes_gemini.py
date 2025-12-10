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
from app.services.rag_chat_service import rag_chat


router = APIRouter(prefix="/gemini", tags=["gemini"])


# RAG Chat endpoint (structured JSON output, no agent)
@router.post("/rag_chat")
async def rag_chat_endpoint(
    body: dict = Body(...),
):
    """
    RAG Chat endpoint that returns structured JSON with text chunks and sources.

    This endpoint does NOT use the LangGraph agent. Instead, it:
    1. Retrieves relevant chunks from ChromaDB
    2. Calls Gemini with structured output (response_mime_type + response_schema)
    3. Returns guaranteed JSON with text chunks and their source references
    """
    prompt = body.get("prompt")
    if not prompt or not isinstance(prompt, str):
        raise HTTPException(status_code=400, detail="prompt is required")

    doc_ids = body.get("doc_ids", [])
    doc_titles = body.get("doc_titles")
    temperature = float(body.get("temperature", 0.2))
    model_name = body.get("model")
    github_only = body.get("github_only", False)

    try:
        result = rag_chat(
            prompt=prompt,
            doc_ids=doc_ids,
            doc_titles=doc_titles,
            model_name=model_name,
            temperature=temperature,
            github_only=github_only,
        )
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# GitHub question classifier
def is_github_question(prompt: str) -> bool:
    keywords = [
        "github",
        "repo",
        "repository",
        "readme",
        "code",
        "source code",
        "file",
        "files",
        "implementation",
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
        accumulated_content = ""

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
                        yield json.dumps(
                            {"type": "status", "value": "searching"}
                        ) + "\n"
                    continue

                if "agent" in langgraph_node.lower() and hasattr(msg, "content"):
                    content = getattr(msg, "content", None)
                    if not content:
                        continue

                    if first_content_token:
                        first_content_token = False
                        yield json.dumps({"type": "status", "value": "answer"}) + "\n"

                    # Accumulate content for JSON parsing
                    accumulated_content += content
                    yield json.dumps({"type": "token", "value": content}) + "\n"

            # After all tokens received, parse the JSON response
            if accumulated_content:
                try:
                    # Try to parse the response as JSON
                    response_json = json.loads(accumulated_content)
                    if isinstance(response_json, dict):
                        # Send the full JSON response
                        print(
                            f"Agent Response JSON: {json.dumps(response_json, indent=2)}"
                        )
                        yield json.dumps(
                            {"type": "json_response", "value": response_json}
                        ) + "\n"
                except json.JSONDecodeError:
                    # If JSON parsing fails, the accumulated content is already sent as tokens
                    print(
                        f"Warning: Could not parse Gemini response as JSON: {accumulated_content}..."
                    )

            if sources_tracker:
                # Remove large image_data from sources to prevent JSON serialization issues
                filtered_sources = {}
                for source_id, source_data in sources_tracker.items():
                    filtered_data = {
                        k: v for k, v in source_data.items() if k != "image_data"
                    }
                    filtered_sources[source_id] = filtered_data

                yield json.dumps({"type": "sources", "value": filtered_sources}) + "\n"

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
