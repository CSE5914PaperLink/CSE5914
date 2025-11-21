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
You are a helpful document intelligence assistant with access to scientific papers
AND optionally GitHub repository metadata.

=====================================================
GITHUB-SPECIFIC RULES (activated when github_mode=TRUE)
=====================================================
If github_mode is TRUE:
- Detect and use metadata fields:
    • github_readme  
    • repo_url  
    • filename  
- If github_readme exists:
    → Prioritize summarizing the README file.
    → Create structured summary:
          1. Overview
          2. Key Features
          3. Code Structure
          4. Notes / Limitations
- ALWAYS return the repo_url in your final answer.
- If user asks about "files", "code", "repo", "implementation":
    → Use metadata from repo chunks.
- DO NOT hallucinate any nonexistent file/function.

If github_mode is TRUE but README is missing:
- Say clearly “README not found”.
- Fall back to summarizing file chunks (if available).

=====================================================
PDF / SCIENTIFIC PAPER RULES
=====================================================
If github_mode is FALSE:
- Completely ignore GitHub metadata.
- Only answer using PDF + knowledge.
- Do not mention GitHub at all.

=====================================================
GENERAL RAG RULES
=====================================================
1. Always call search_documents() to retrieve relevant chunks.
2. If text is insufficient, call search again with higher top_k.
3. Combine multiple chunks into a clean, concise answer.
4. Cite source filenames when referencing repo content.
5. For PDF text, cite titles or doc_id.

Be accurate and non-hallucinatory.
"""


# Search Tool (RAG)

def create_search_tools(
    chroma_service: ChromaService,
    embedder: NomicEmbeddingService,
    doc_ids: List[str],
    sources_tracker: dict[str, dict],
) -> BaseTool:

    @tool
    def search_documents(
        query: Annotated[str, "The search query for document intelligence"],
        top_k_text: Annotated[int, "Max text results"] = 8,
        top_k_image: Annotated[int, "Max image results"] = 4,
    ) -> str:
        """Unified text + image search for RAG."""

        out = []

        # TEXT SEARCH
        try:
            text_where = {"doc_id": {"$in": doc_ids}}
            qvec = embedder.embed_query(query)

            res = chroma_service.collection.query(
                query_embeddings=[qvec],
                n_results=top_k_text,
                include=["documents", "metadatas", "distances"],
                where=cast(Any, text_where),
            )

            docs = (res.get("documents") or [[]])[0]
            metas = (res.get("metadatas") or [[]])[0]
            dists = (res.get("distances") or [[]])[0]

            if not docs:
                out.append("## TEXT RESULTS\nNo text found.")
            else:
                entries = []
                for i, doc in enumerate(docs):
                    md = metas[i] or {}
                    doc_id = md.get("doc_id")
                    title = md.get("title", doc_id)

                    filename = md.get("filename")  # <--- repo files!
                    chunk_idx = md.get("chunk_index", i)

                    unique_id = f"text:{doc_id}:chunk{chunk_idx}"

                    entries.append(
                        f"[Text {i+1}] {title or filename}\n"
                        f"{doc}\n"
                    )

                    sources_tracker[unique_id] = {
                        "type": "text",
                        "doc_id": doc_id,
                        "title": title,
                        "filename": filename,
                        "distance": dists[i],
                        "content": doc,
                        "chunk_index": chunk_idx,
                    }

                out.append("## TEXT RESULTS\n" + "\n---\n".join(entries))

        except Exception as e:
            out.append(f"## TEXT SEARCH ERROR\n{e}")

        # IMAGE SEARCH
        try:
            image_where = {
                "$and": [
                    {"doc_id": {"$in": doc_ids}},
                    {"type": "image"},
                ]
            }

            qvec = embedder.embed_query(query)

            res = chroma_service.collection.query(
                query_embeddings=[qvec],
                n_results=top_k_image,
                include=["documents", "metadatas", "distances"],
                where=cast(Any, image_where),
            )

            docs = (res.get("documents") or [[]])[0]
            metas = (res.get("metadatas") or [[]])[0]
            dists = (res.get("distances") or [[]])[0]

            if not docs:
                out.append("## IMAGE RESULTS\nNo image results.")
            else:
                entries = []
                for i, doc in enumerate(docs):
                    md = metas[i] or {}

                    doc_id = md.get("doc_id")
                    title = md.get("title")
                    caption = md.get("caption")
                    img_b64 = md.get("image_b64")

                    unique_id = f"image:{doc_id}:{i}"

                    entries.append(
                        f"[Image {i+1}] Title={title}, Caption={caption}\n"
                        f"Image: data:image/png;base64,{img_b64}\n"
                    )

                    sources_tracker[unique_id] = {
                        "type": "image",
                        "doc_id": doc_id,
                        "title": title,
                        "distance": dists[i],
                        "image_data": img_b64,
                        "content": caption,
                    }

                out.append("## IMAGE RESULTS\n" + "\n---\n".join(entries))

        except Exception as e:
            out.append(f"## IMAGE SEARCH ERROR\n{e}")

        return "\n\n".join(out)

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
