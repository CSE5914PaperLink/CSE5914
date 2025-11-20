from typing import List, Sequence, Iterable, Dict, Any, cast, Optional
from io import BytesIO
import base64
from uuid import uuid4
from PIL import Image

from langchain_core.documents import Document
from langchain_chroma import Chroma

from app.core.config import settings


class ChromaService:
    def __init__(self, embedding_fn=None):
        """
        Creates (or loads) a persistent Chroma vector store.

        Args:
            embedding_fn: An embedding function such as NomicEmbeddings() or similar.
            settings: An object with chroma_persist_path and chroma_collection_name.
        """
        self.settings = settings

        self.persist_path = settings.chroma_persist_path
        self.collection_name = settings.chroma_collection_name
        print(
            f"[ChromaService] Using persist path: {self.persist_path}, collection: {self.collection_name}"
        )
        # Initialize or load persistent Chroma database
        self.vectorstore = Chroma(
            collection_name=self.collection_name,
            persist_directory=self.persist_path,
            embedding_function=embedding_fn,
        )

    @property
    def collection(self):
        """Return the underlying Chroma Collection object."""
        return self.vectorstore._collection  # Chroma stores it internally

    def similarity_search(self, query: str, embedding_fn, k: int = 5):
        """
        Run a similarity search on text queries.
        """
        return self.vectorstore.similarity_search(query, k=k)

    def similarity_search_by_vector(self, vector: List[float], k: int = 5):
        """
        Run a similarity search by embedding vector.
        """
        return self.vectorstore.similarity_search_by_vector(vector, k)

    def delete(self, ids: Iterable[str]):
        """
        Delete entries from the Chroma collection using their IDs.
        """
        self.vectorstore._collection.delete(ids=list(ids))
