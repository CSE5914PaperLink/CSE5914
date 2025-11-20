from typing import Optional
import json

from google import genai
from google.genai import types
from google.api_core.exceptions import ResourceExhausted
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional, Any, cast

from app.core.config import settings
from fastapi import Body
from app.services.chroma_service import ChromaService
from app.services.embedding_service import NomicEmbeddingService
from app.services.gemini_service import GeminiService
from app.services.agent_service import create_document_agent

router = APIRouter(prefix="/gemini", tags=["gemini"])


@router.post("/chat")
async def chat(
    prompt: str = Query(..., min_length=1, description="User prompt"),
    system: Optional[str] = Query(None, description="Optional system instruction"),
    model: Optional[str] = Query(None, description="Gemini model name"),
    temperature: float = Query(0.0, ge=0.0, le=2.0),
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


@router.post("/chat_agent")
async def chat_agent(
    body: dict = Body(
        ...,
        description="JSON body with prompt, thread_id, temperature, model, top_k",
    ),
):
    """
    Body:
      {
        "prompt": str,
        "doc_ids": string[],
        "thread_id"?: str,
        "temperature"?: float,
        "model"?: str,
        "top_k"?: int,
      }

    Response is a streaming JSONL-like stream of small JSON objects:
      {"type": "status", "value": "thinking" | "searching" | "answer"}
      {"type": "token", "value": "<partial text>"}
      {"type": "done"}
    """
    prompt = body.get("prompt")
    if not prompt or not isinstance(prompt, str):
        raise HTTPException(status_code=400, detail="prompt is required")

    thread_id = body.get("thread_id", "default")
    temperature = float(body.get("temperature", 0.0))
    model_name = body.get("model") or settings.gemini_default_model

    # NOTE: you can also move these out of the route and reuse the same agent
    chroma = ChromaService()
    embedder = NomicEmbeddingService()

    # Track sources retrieved by the agent
    sources_tracker: dict[str, dict] = {}

    agent = create_document_agent(
        chroma_service=chroma,
        embedder=embedder,
        model_name=model_name,
        temperature=temperature,
        doc_ids=body.get("doc_ids", []),
        sources_tracker=sources_tracker,
    )

    config: Any = {"configurable": {"thread_id": thread_id}}

    async def event_generator():
        """
        - Sends status changes (thinking/searching/answer)
        - Skips tool messages
        - Streams only the LLM final answer tokens
        """
        # Initial status
        yield json.dumps({"type": "status", "value": "thinking"}) + "\n"

        tool_call_detected = False
        first_content_token = True

        try:
            # Stream LangGraph messages
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

                # 1) Skip tool output, but signal when tools run
                if "tool" in langgraph_node.lower():
                    if not tool_call_detected:
                        tool_call_detected = True
                        yield json.dumps(
                            {"type": "status", "value": "searching"}
                        ) + "\n"
                    continue

                # 2) Only stream content from the agent node
                if "agent" in langgraph_node.lower() and hasattr(msg, "content"):
                    content = getattr(msg, "content", None)
                    if not content:
                        continue

                    # First token from agent → switch status to "answer"
                    if first_content_token:
                        first_content_token = False
                        yield json.dumps({"type": "status", "value": "answer"}) + "\n"

                    # Stream this chunk
                    yield json.dumps({"type": "token", "value": content}) + "\n"

            # Send sources after streaming is complete
            if sources_tracker:
                yield json.dumps({"type": "sources", "value": sources_tracker}) + "\n"

            # Done
            yield json.dumps({"type": "done"}) + "\n"

        except ResourceExhausted:
            message = (
                "The Gemini API rate limit was hit. Please wait a few seconds and try again."
            )
            yield json.dumps({"type": "error", "value": message}) + "\n"
        except Exception as e:
            # In case of error, yield an error event and stop
            yield json.dumps({"type": "error", "value": str(e)}) + "\n"

    # Return as a streaming HTTP response (you can also use text/event-stream for SSE)
    return StreamingResponse(
        event_generator(),
        media_type="application/json",
    )
