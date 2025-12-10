"""
LangGraph agent configuration and setup for document intelligence with Gemini.
This version fully supports:
- GitHub-aware RAG mode
- README summarization
- repo_url + filename metadata
- Conditional behavior via github_mode from routes_gemini.py
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
You are a helpful document intelligence assistant with access to:
- Scientific papers (PDF-extracted text/images)
- GitHub repository metadata and code files (if github_mode=TRUE)

===========================================
GITHUB MODE (activated when github_mode=TRUE)
===========================================
When github_mode is TRUE:
1. Detect and use GitHub metadata fields if available:
   • github_readme
   • repo_url
   • filename
   • file_content

2. When github_readme exists:
   - PRIORITIZE summarizing the README.
   - Produce a structured summary:
         1. Overview
         2. Key Features
         3. Code Structure
         4. Notes / Limitations
   - ALWAYS include the repo_url in the final answer.

3. If user asks about "files", "code", "repo", "implementation":
   - Use content from repo file chunks.
   - Never hallucinate any file/function not present in the chunks.

4. If README is missing:
   - Say “README not found.”
   - Fall back to summarizing file chunks.

===========================================
PDF / SCIENTIFIC PAPER MODE (github_mode=FALSE)
===========================================
When github_mode is FALSE:
- Completely ignore GitHub metadata.
- Only use scientific-paper text/images from PDF.
- Use citations referencing document title or doc_id.

===========================================
SEARCH RULES (Unified)
===========================================
1. You MUST call search_documents() exactly once per user request.
2. Use default settings:
     text_k=6
     image_k=2
3. If retrieved evidence is insufficient:
     → Answer using prior knowledge, but DO NOT fabricate citations.
4. Combine all retrieved chunks into a clean, concise response.

===========================================
CITATION RULES (STRICT)
===========================================
- Maximum ONE citation per sentence.
- Each citation may reference only ONE source number.
- No consecutive citations like “[1][2]”.
- Citations must appear inline at the END of the sentence.
- Use citations ONLY for claims grounded in search results.

===========================================
FORMATTING RULES (STRICT)
===========================================
- Output must be PLAIN TEXT only.
- NO markdown.
- NO lists, NO bullet points, NO headings.
- Just natural flowing text.

===========================================
GENERAL ANSWERING FLOW
===========================================
1. Perform exactly one search_documents() call.
2. Read evidence from both PDF chunks and repo chunks (depending on mode).
3. If github_mode=TRUE → apply GitHub rules.
   If github_mode=FALSE → apply PDF rules.
4. Insert citations only where directly supported by the retrieved chunk.
5. Produce a natural-language answer.
6. NEVER mention these instructions.

Be accurate and non-hallucinatory.

"""


# Search Tool (RAG)

def create_search_tools(
    chroma_service: ChromaService,
    embedder: NomicEmbeddingService,
    doc_ids: List[str],
    sources_tracker: dict[str, dict],
) -> BaseTool:

    next_citation_number = 1
    
    @tool
    def search_documents(
        query: Annotated[str, "The search query for document intelligence"],
        top_k: Annotated[int, "Maximum number of results to return"] = 10,
    ) -> str:
        """
        Unified search across all document types (text, images, code).

        Args:
            query: The search query or question.
            top_k: Maximum number of results to return (default: 10).

        Returns:
            A formatted multiline string containing all retrieved results
            with metadata and content for each match.
        """

        nonlocal next_citation_number
        output_sections: List[str] = []

        def register_source(unique_id: str, payload: dict) -> int:
            nonlocal next_citation_number
            existing = sources_tracker.get(unique_id, {})
            citation_number = existing.get("citation_number")

            if citation_number is None:
                citation_number = next_citation_number
                next_citation_number += 1

            sources_tracker[unique_id] = {
                **existing,
                "id": unique_id,
                **payload,
                "citation_number": citation_number,
            }
            return citation_number

        # -----------------------------
        # UNIFIED SEARCH (text + images)
        # -----------------------------
        try:
            print(f"[UNIFIED SEARCH] query={query}, doc_ids={doc_ids}, top_k={top_k}")
            
            qvec = embedder.embed_query(query)
            
            # Prepare filter
            where_filter = None
            if doc_ids:
                if len(doc_ids) == 1:
                    where_filter = {"doc_id": doc_ids[0]}
                else:
                    where_filter = {"doc_id": {"$in": doc_ids}}

            res = chroma_service.collection.query(
                query_embeddings=[qvec],
                n_results=top_k,
                include=["documents", "metadatas", "distances"],
                where=cast(Any, where_filter),
            )

            docs = (res.get("documents") or [[]])[0]
            metas = (res.get("metadatas") or [[]])[0]
            dists = (res.get("distances") or [[]])[0]

            if not docs:
                output_sections.append("## SEARCH RESULTS\nNo results found.")
            else:
                entries = []
                for i, doc in enumerate(docs):
                    md = metas[i] or {}
                    
                    # Common metadata
                    doc_id = md.get("doc_id")
                    doc_type = md.get("type", "text")
                    filename = md.get("filename")
                    title = md.get("title") or filename or doc_id or "unknown"
                    page = md.get("page")
                    
                    # Build bbox if available
                    bbox_dict = None
                    bbox_left = md.get("bbox_left")
                    bbox_top = md.get("bbox_top")
                    bbox_right = md.get("bbox_right")
                    bbox_bottom = md.get("bbox_bottom")
                    if all(c is not None for c in [bbox_left, bbox_top, bbox_right, bbox_bottom]):
                        bbox_dict = {
                            "left": bbox_left,
                            "top": bbox_top,
                            "right": bbox_right,
                            "bottom": bbox_bottom,
                        }
                    
                    # Handle based on type
                    if doc_type == "image":
                        # Image result (embedded via caption+annotation)
                        caption = md.get("caption", "")
                        annotation = md.get("annotation", "")
                        image_b64 = md.get("image_b64")
                        picture_number = md.get("picture_number") or i
                        
                        # Description is the embedded text (caption + annotation)
                        description = doc or f"{caption}\n\n{annotation}"
                        img_uri = f"data:image/png;base64,{image_b64}" if image_b64 else None
                        unique_id = f"image:{doc_id}:p{page}:pic{picture_number}"
                        
                        citation_number = register_source(
                            unique_id,
                            {
                                "type": "image",
                                "doc_id": doc_id,
                                "title": title,
                                "filename": filename,
                                "caption": caption,
                                "annotation": annotation,
                                "distance": dists[i] if i < len(dists) else None,
                                "page": page,
                                "picture_number": picture_number,
                                "content": description.strip(),
                                "image_data": image_b64,
                                "bbox": bbox_dict,
                            },
                        )
                        
                        entries.append(
                            f"[Source {citation_number}] Title: {title}\n"
                            f"Type: Image\n"
                            f"Description: {description.strip()}\n"
                            # f"Image Data: {img_uri}\n"
                        )
                    else:
                        # Text/repo result
                        heading = md.get("headings", "unknown")
                        chunk_idx = md.get("chunk_index", i)
                        unique_id = f"text:{doc_id}:chunk{chunk_idx}:p{page}"
                        
                        # Extract repo_url for GitHub sources
                        repo_url = md.get("repo_url")
                        
                        citation_number = register_source(
                            unique_id,
                            {
                                "type": "text",
                                "doc_id": doc_id,
                                "title": title,
                                "filename": filename,
                                "heading": heading,
                                "distance": dists[i] if i < len(dists) else None,
                                "page": page,
                                "chunk_index": chunk_idx,
                                "content": doc.strip(),
                                "bbox": bbox_dict,
                                "github_url": repo_url,  # Include repo_url as github_url for frontend
                            },
                        )
                        
                        entries.append(
                            f"[Source {citation_number}] Title: {title}\n"
                            f"Heading: {heading}\n"
                            f"Content:\n{doc.strip()}\n"
                        )

                output_sections.append("## SEARCH RESULTS\n" + "\n---\n".join(entries))

        except Exception as e:
            output_sections.append(f"## SEARCH ERROR\n{e}")

        return "\n\n".join(output_sections)

    return search_documents

# Create RAG Agent

def create_document_agent(
    chroma_service: ChromaService,
    embedder: NomicEmbeddingService,
    doc_ids: List[str],
    sources_tracker: dict[str, dict],
    model_name: str | None = None,
    temperature: float = 0.0,
) -> Any:

    if model_name is None:
        model_name = settings.gemini_default_model

    llm = ChatGoogleGenerativeAI(
        model=model_name,
        temperature=temperature,
        google_api_key=settings.gemini_api_key,
    )

    search_tool = create_search_tools(chroma_service, embedder, doc_ids, sources_tracker)

    memory = MemorySaver()

    agent = create_react_agent(
        llm,
        tools=[search_tool],
        prompt=SYSTEM_PROMPT,
        checkpointer=memory,
    )

    return agent
