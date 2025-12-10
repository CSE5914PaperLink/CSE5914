"""
RAG Chat Service - Structured JSON output without agent.

This service performs RAG (Retrieval Augmented Generation) chat using:
1. ChromaDB for vector search
2. Gemini's structured output (response_mime_type + response_json_schema)
3. Pydantic models for guaranteed JSON format
"""

from typing import List, Optional, Dict, Any, cast
from pydantic import BaseModel, Field

from google import genai
from google.genai import types

from app.core.config import settings
from app.services.chroma_service import ChromaService
from app.services.embedding_service import NomicEmbeddingService


# Pydantic models for structured output


class ChatChunk(BaseModel):
    """A chunk of text in the response with associated source references."""

    text: str = Field(description="A piece of the response text.")
    source_ids: List[str] = Field(
        default_factory=list,
        description="List of source IDs that support this text chunk. Use the source IDs provided in the context.",
    )


class StructuredChatResponse(BaseModel):
    """The complete structured chat response."""

    chunks: List[ChatChunk] = Field(
        description="List of text chunks that make up the response. Each chunk should reference its sources."
    )


# Source metadata type
class SourceMetadata(BaseModel):
    """Metadata for a retrieved source."""

    id: str
    type: str  # "text" or "image"
    doc_id: Optional[str] = None
    title: Optional[str] = None
    heading: Optional[str] = None
    caption: Optional[str] = None
    content: Optional[str] = None
    page: Optional[int] = None
    chunk_index: Optional[int] = None
    filename: Optional[str] = None
    distance: Optional[float] = None
    image_data: Optional[str] = None
    bbox: Optional[Dict[str, float]] = None


SYSTEM_PROMPT = """You are a helpful AI assistant for researchers working with scientific papers.

CRITICAL FORMATTING RULES:
1. The "text" field must contain ONLY clean prose - NO source references, NO citations, NO brackets of any kind.
2. Put source IDs ONLY in the "source_ids" array field, NEVER in the "text" field.
3. DO NOT write things like "[source: ...]" or "[1]" or any citation markers in the text.
4. REMOVE any citation numbers from the original papers (like [25], [47], etc.) - do NOT copy them into your response.
5. Paraphrase the content in your own words rather than copying text verbatim with its original citations.

CONTENT RULES:
1. Answer the user's question based ONLY on the provided context sources.
2. Structure your response as multiple text chunks, each with its supporting source IDs.
3. Use the exact source IDs provided (e.g., "text:doc123:chunk5:p3") in the source_ids array.
4. If a statement is supported by multiple sources, include all relevant source IDs in the array.
5. If you cannot answer from the context, say so in a single chunk with an empty source_ids array.
6. Write naturally flowing text, breaking it into logical chunks of 1-3 sentences.
7. Each chunk should group sentences that share the same source(s).
8. INCLUDE all image sources when they help visualize concepts, even if they don't directly contain information.
   For example, if discussing a model architecture, include diagram images. Reference them like: "The architecture is shown in the diagram." with the image source ID.

EXAMPLE OUTPUT FORMAT:
{
  "chunks": [
    {"text": "Neural networks excel at image recognition.", "source_ids": ["text:doc1:chunk2:p5"]},
    {"text": "Transformers have revolutionized NLP.", "source_ids": ["text:doc2:chunk1:p3", "text:doc3:chunk4:p7"]}
  ]
}

WRONG (do not do this):
- "Neural networks excel at image recognition [source: text:doc1:chunk2:p5]."
- "Neural networks excel at image recognition [1]."
- "AdamW[25] is used as the optimizer." (contains paper's original citation [25])
- "Following [47], the method uses..." (contains paper's original citation [47])

RIGHT:
- text: "Neural networks excel at image recognition."
- text: "AdamW is used as the optimizer."
- text: "The method uses 900 object queries."
- source_ids: ["text:doc1:chunk2:p5"]
"""


def build_context_prompt(
    query: str,
    sources: Dict[str, SourceMetadata],
    doc_titles: Optional[List[Dict[str, str]]] = None,
) -> str:
    """Build the prompt with context from retrieved sources."""

    # Build context section
    context_parts = []
    for source_id, source in sources.items():
        if source.type == "text":
            context_parts.append(
                f"[Source ID: {source_id}]\n"
                f"Title: {source.title or 'Unknown'}\n"
                f"Heading: {source.heading or 'N/A'}\n"
                f"Page: {source.page or 'N/A'}\n"
                f"Content: {source.content or ''}\n"
            )
        elif source.type == "image":
            context_parts.append(
                f"[Source ID: {source_id}]\n"
                f"Title: {source.title or 'Unknown'}\n"
                f"Type: Image\n"
                f"Caption: {source.caption or 'N/A'}\n"
                f"Page: {source.page or 'N/A'}\n"
            )

    context_text = (
        "\n---\n".join(context_parts) if context_parts else "No context available."
    )

    # Build document titles section
    titles_text = ""
    if doc_titles:
        titles_lines = [
            f"- {d.get('title', d.get('doc_id', 'Unknown'))}" for d in doc_titles
        ]
        titles_text = f"\nDocuments in scope:\n" + "\n".join(titles_lines) + "\n"

    return f"""Context Sources:
{context_text}
{titles_text}
User Question: {query}

Please provide a structured response with text chunks and their source references."""


def retrieve_sources(
    chroma_service: ChromaService,
    embedder: NomicEmbeddingService,
    query: str,
    doc_ids: List[str],
    top_k: int = 10,
) -> Dict[str, SourceMetadata]:
    """Retrieve relevant sources from ChromaDB."""

    # Embed the query
    query_embedding = embedder.embed_query(query)

    # Build filter
    where_filter = None
    if doc_ids:
        if len(doc_ids) == 1:
            where_filter = {"doc_id": doc_ids[0]}
        else:
            where_filter = {"doc_id": {"$in": doc_ids}}

    # Query ChromaDB
    results = chroma_service.collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
        where=cast(Any, where_filter),
    )

    docs = (results.get("documents") or [[]])[0]
    metas = (results.get("metadatas") or [[]])[0]
    dists = (results.get("distances") or [[]])[0]

    sources: Dict[str, SourceMetadata] = {}

    for i, doc in enumerate(docs):
        md = metas[i] or {}

        # Extract and cast metadata values to correct types
        doc_id = str(md.get("doc_id")) if md.get("doc_id") is not None else None
        doc_type = str(md.get("type", "text"))
        filename = str(md.get("filename")) if md.get("filename") is not None else None
        title_raw = md.get("title")
        title = (
            str(title_raw)
            if title_raw is not None
            else (filename or doc_id or "unknown")
        )

        # Cast numeric values
        page_raw = md.get("page")
        page = int(page_raw) if isinstance(page_raw, (int, float)) else None
        chunk_idx_raw = md.get("chunk_index", i)
        chunk_idx = int(chunk_idx_raw) if isinstance(chunk_idx_raw, (int, float)) else i

        # Build bbox if available
        bbox_dict = None
        bbox_left = md.get("bbox_left")
        bbox_top = md.get("bbox_top")
        bbox_right = md.get("bbox_right")
        bbox_bottom = md.get("bbox_bottom")
        if all(
            isinstance(c, (int, float))
            for c in [bbox_left, bbox_top, bbox_right, bbox_bottom]
        ):
            bbox_dict = {
                "left": float(bbox_left),  # type: ignore
                "top": float(bbox_top),  # type: ignore
                "right": float(bbox_right),  # type: ignore
                "bottom": float(bbox_bottom),  # type: ignore
            }

        if doc_type == "image":
            caption_raw = md.get("caption", "")
            caption = str(caption_raw) if caption_raw else ""
            annotation_raw = md.get("annotation", "")
            annotation = str(annotation_raw) if annotation_raw else ""
            image_b64_raw = md.get("image_b64")
            image_b64 = str(image_b64_raw) if image_b64_raw is not None else None
            picture_number = md.get("picture_number") or i
            unique_id = f"image:{doc_id}:p{page}:pic{picture_number}"

            sources[unique_id] = SourceMetadata(
                id=unique_id,
                type="image",
                doc_id=doc_id,
                title=title,
                filename=filename,
                caption=caption,
                content=f"{caption}\n{annotation}".strip() if annotation else caption,
                page=page,
                distance=dists[i] if i < len(dists) else None,
                image_data=image_b64,
                bbox=bbox_dict,
            )
        else:
            heading_raw = md.get("headings", "unknown")
            heading = str(heading_raw) if heading_raw is not None else "unknown"
            unique_id = f"text:{doc_id}:chunk{chunk_idx}:p{page}"

            sources[unique_id] = SourceMetadata(
                id=unique_id,
                type="text",
                doc_id=doc_id,
                title=title,
                filename=filename,
                heading=heading,
                content=doc.strip() if doc else "",
                page=page,
                chunk_index=chunk_idx,
                distance=dists[i] if i < len(dists) else None,
                bbox=bbox_dict,
            )

    return sources


def generate_structured_response(
    query: str,
    sources: Dict[str, SourceMetadata],
    doc_titles: Optional[List[Dict[str, str]]] = None,
    model_name: Optional[str] = None,
    temperature: float = 0.2,
) -> StructuredChatResponse:
    """Generate a structured chat response using Gemini."""

    if not settings.gemini_api_key:
        raise RuntimeError("Gemini API key not configured")

    client = genai.Client(api_key=settings.gemini_api_key)
    model = model_name or settings.gemini_default_model

    # Build the prompt
    prompt = build_context_prompt(query, sources, doc_titles)

    # Configure for structured JSON output
    config = types.GenerateContentConfig(
        temperature=temperature,
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=StructuredChatResponse,
    )

    # Generate response
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )

    # Parse the structured response
    response_text = response.text or "{}"
    return StructuredChatResponse.model_validate_json(response_text)


def rag_chat(
    prompt: str,
    doc_ids: List[str],
    doc_titles: Optional[List[Dict[str, str]]] = None,
    model_name: Optional[str] = None,
    temperature: float = 0.2,
    top_k: int = 10,
) -> Dict[str, Any]:
    """
    Perform RAG chat and return structured response.

    Returns:
        Dict with 'chunks' (list of text chunks with source_ids) and 'sources' (source metadata dict)
    """

    # Initialize services
    chroma_service = ChromaService()
    embedder = NomicEmbeddingService()

    # Retrieve sources
    sources = retrieve_sources(
        chroma_service=chroma_service,
        embedder=embedder,
        query=prompt,
        doc_ids=doc_ids,
        top_k=top_k,
    )

    # Generate structured response
    response = generate_structured_response(
        query=prompt,
        sources=sources,
        doc_titles=doc_titles,
        model_name=model_name,
        temperature=temperature,
    )

    # Convert sources to dict format (without image_data for smaller response)
    sources_dict = {}
    for source_id, source in sources.items():
        source_dict = source.model_dump()
        # Remove large image data from main response (can be fetched separately if needed)
        if source_dict.get("image_data"):
            source_dict["has_image"] = True
            del source_dict["image_data"]
        sources_dict[source_id] = source_dict

    return {
        "chunks": [chunk.model_dump() for chunk in response.chunks],
        "sources": sources_dict,
    }
