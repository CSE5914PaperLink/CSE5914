"""
LangGraph agent configuration and setup for document intelligence with Gemini.
"""

from typing import List, Annotated, Any, Tuple, cast
from langchain_core.tools import tool, BaseTool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

from app.core.config import settings
from app.services.chroma_service import ChromaService
from app.services.embedding_service import NomicEmbeddingService


SYSTEM_PROMPT = """
You are a helpful document intelligence assistant with access to scientific papers.

GUIDELINES:
- Use search_documents to retrieve relevant text and image content.
- Only call search_documents ONCE per user message.
- Never ask the user to clarify or be more specific or what to query. Always answer directly using available evidence.
- Use search_documents with text_k=6 and image_k=2 by default. Only increase these values if absolutely necessary.
- Ground your answers in the search results, and fill gaps with your own knowledge when needed.

CITATION RULES (STRICT):
- Never place more than one citation in a row. One "[1]" per sentence maximum.
- Each citation may only contain ONE source number.
- Ensure citations are always in line with no newline after the citation.
- If multiple sources support a sentence, choose the best one.

FORMATTING RULES:
- Do NOT use markdown, lists, bullet points, or headings.
- Write in plain text only.

ANSWERING PROCEDURE:
1. Perform exactly one search_documents call.
2. Synthesize a natural-language answer combining retrieved evidence and prior knowledge.
3. Insert citations only where required by evidence, following the strict citation rules above.
4. Keep citations sparse, relevant, and clean.
"""


def create_search_tools(
    chroma_service: ChromaService,
    embedder: NomicEmbeddingService,
    doc_ids: List[str],
    sources_tracker: dict[str, dict],
) -> BaseTool:
    """
    Create document search tool that retrieves text and images.

    Args:
        sources_tracker: Optional list to track retrieved sources for UI display

    Returns:
        search_documents tool
    """

    next_citation_number = 1

    @tool
    def search_documents(
        query: Annotated[str, "The search query or question for document intelligence"],
        top_k_text: Annotated[int, "Text results to retrieve (default: 6)"] = 6,
        top_k_image: Annotated[int, "Image results to retrieve (default: 2)"] = 2,
    ) -> str:
        """
        Run both text and image retrieval over the uploaded scientific documents.

        Args:
            query: The search query or question.
            top_k_text: Maximum number of text results to return.
            top_k_image: Maximum number of image results to return.

        Returns:
            A formatted multiline string containing:
            - Text search results (or a message if none found)
            - Image search results (or a message if none found)
            - All retrieved metadata and content for each match
        """

        nonlocal next_citation_number

        output_sections = []

        def register_source(unique_id: str, payload: dict) -> int:
            nonlocal next_citation_number
            existing = sources_tracker.get(unique_id, {})
            citation_number = existing.get("citation_number")
            if citation_number is None:
                citation_number = next_citation_number
                next_citation_number += 1
            updated = {
                **existing,
                "id": unique_id,
                **payload,
                "citation_number": citation_number,
            }
            sources_tracker[unique_id] = updated
            return citation_number

        try:
            print(f"[TEXT SEARCH] query={query}, doc_ids={doc_ids}, top_k={top_k_text}")

            text_where = {"doc_id": {"$in": doc_ids}}
            query_vec = embedder.embed_query(query)

            res_text = chroma_service.collection.query(
                query_embeddings=[query_vec],
                n_results=top_k_text,
                include=["documents", "metadatas", "distances"],
                where=cast(Any, text_where),
            )

            docs = (res_text.get("documents") or [[]])[0]
            metas = (res_text.get("metadatas") or [[]])[0]
            dists = (res_text.get("distances") or [[]])[0]

            if not docs:
                output_sections.append("## TEXT RESULTS\nNo relevant text found.")
            else:
                parts = []
                for i, doc in enumerate(docs):
                    md = metas[i] or {}
                    title = md.get("title", md.get("doc_id", "Unknown"))
                    # Create a stable unique ID based on metadata
                    doc_id = md.get("doc_id", "unknown")
                    chunk_idx = md.get("chunk_index", i)
                    page = md.get("page")
                    unique_id = f"text:{doc_id}:chunk{chunk_idx}:p{page}"
                    heading = md.get("headings", "unknown")
                    bbox_left = md.get("bbox_left")
                    bbox_top = md.get("bbox_top")
                    bbox_right = md.get("bbox_right")
                    bbox_bottom = md.get("bbox_bottom")
                    print(f"ID: {unique_id} \n heading: {heading}\n content: {doc}\n ")
                    bbox_dict = None
                    if all(
                        coord is not None
                        for coord in [bbox_left, bbox_top, bbox_right, bbox_bottom]
                    ):
                        bbox_dict = {
                            "left": bbox_left,
                            "top": bbox_top,
                            "right": bbox_right,
                            "bottom": bbox_bottom,
                        }

                    citation_number = register_source(
                        unique_id,
                        {
                            "type": "text",
                            "doc_id": doc_id,
                            "title": title,
                            "heading": heading,
                            "distance": dists[i] if i < len(dists) else None,
                            "page": page,
                            "chunk_index": chunk_idx,
                            "content": doc.strip(),
                            "bbox": bbox_dict,
                        },
                    )

                    parts.append(
                        f"[Source {citation_number}] Title: {title}\n"
                        f"Heading: {heading}\n"
                        f"Content:\n{doc.strip()}\n"
                    )

                output_sections.append("## TEXT RESULTS\n" + "\n---\n".join(parts))

        except Exception as e:
            import traceback

            output_sections.append(
                f"## TEXT RESULTS\nError searching text: {e}\n\n{traceback.format_exc()}"
            )

        # ---------------------------------------------------------
        # IMAGE SEARCH (original logic)
        # ---------------------------------------------------------
        try:
            print(
                f"[IMAGE SEARCH] query={query}, doc_ids={doc_ids}, top_k={top_k_image}"
            )

            image_where = {
                "$and": [
                    {"doc_id": {"$in": doc_ids}},
                    {"type": "image"},
                ]
            }

            query_vec = embedder.embed_query(query)

            res_img = chroma_service.collection.query(
                query_embeddings=[query_vec],
                n_results=top_k_image,
                include=["documents", "metadatas", "distances"],
                where=cast(Any, image_where),
            )

            docs = (res_img.get("documents") or [[]])[0]
            metas = (res_img.get("metadatas") or [[]])[0]
            dists = (res_img.get("distances") or [[]])[0]

            if not docs:
                output_sections.append("## IMAGE RESULTS\nNo relevant images found.")
            else:
                parts = []
                for i, doc in enumerate(docs):
                    md = metas[i] or {}
                    title = md.get("title", md.get("doc_id", "Unknown"))
                    caption = md.get("caption")
                    image_b64 = md.get("image_b64")
                    filename = md.get("filename")
                    page = md.get("page")
                    picture_number = md.get("picture_number")
                    img = f"data:image/png;base64,{image_b64}"
                    bbox_left = md.get("bbox_left")
                    bbox_top = md.get("bbox_top")
                    bbox_right = md.get("bbox_right")
                    bbox_bottom = md.get("bbox_bottom")

                    # Create a stable unique ID based on metadata
                    doc_id = md.get("doc_id", "unknown")
                    page_num = page or 0
                    pic_num = picture_number or i
                    unique_id = f"image:{doc_id}:p{page_num}:pic{pic_num}"

                    bbox_dict = None
                    if all(
                        coord is not None
                        for coord in [bbox_left, bbox_top, bbox_right, bbox_bottom]
                    ):
                        bbox_dict = {
                            "left": bbox_left,
                            "top": bbox_top,
                            "right": bbox_right,
                            "bottom": bbox_bottom,
                        }

                    citation_number = register_source(
                        unique_id,
                        {
                            "type": "image",
                            "doc_id": doc_id,
                            "title": title,
                            "caption": caption,
                            "filename": filename,
                            "distance": dists[i] if i < len(dists) else None,
                            "page": page_num,
                            "content": caption,
                            "bbox": bbox_dict,
                        },
                    )

                    parts.append(
                        f"[Source {citation_number}] Title: {title}\nCaption: {caption}\nContent: {img}\n"
                    )

                output_sections.append("## IMAGE RESULTS\n" + "\n---\n".join(parts))

        except Exception as e:
            import traceback

            output_sections.append(
                f"## IMAGE RESULTS\nError searching images: {e}\n\n{traceback.format_exc()}"
            )

        return "\n\n".join(output_sections)

    return search_documents


def create_document_agent(
    chroma_service: ChromaService,
    embedder: NomicEmbeddingService,
    doc_ids: List[str],
    sources_tracker: dict[str, dict],
    model_name: str | None = None,
    temperature: float = 0.0,
) -> Any:
    """
    Create a document intelligence agent with RAG capabilities.

    Args:
        sources_tracker: Optional list to track retrieved sources for UI display
    """
    if model_name is None:
        model_name = settings.gemini_default_model

    llm = ChatGoogleGenerativeAI(
        model=model_name,
        temperature=temperature,
        google_api_key=settings.gemini_api_key,
    )

    # Create the search tool with sources tracking
    search_tool = create_search_tools(
        chroma_service, embedder, doc_ids, sources_tracker
    )

    memory = MemorySaver()

    agent = create_react_agent(
        llm,
        tools=[search_tool],
        prompt=SYSTEM_PROMPT,
        checkpointer=memory,
    )

    return agent
