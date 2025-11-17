from __future__ import annotations

from typing import Iterable, List, Mapping, Optional, Sequence, cast, Union, Dict, Any
import json

import chromadb
from chromadb.api import ClientAPI
from chromadb.api.models.Collection import Collection

from app.core.config import settings


class ChromaService:
    """Thin wrapper around chromadb to manage a persistent collection."""

    def __init__(
        self,
        persist_path: Optional[str] = None,
        collection_name: Optional[str] = None,
        embedding_dim: Optional[int] = None,
    ) -> None:
        self._persist_path = persist_path or settings.chroma_persist_path
        base_name = collection_name or settings.chroma_collection_name
        # Disambiguate collections by embedding dimensionality to avoid mismatches
        self._collection_name = (
            f"{base_name}_d{embedding_dim}" if embedding_dim else base_name
        )
        self._client: ClientAPI = chromadb.PersistentClient(path=self._persist_path)

        # Resolve collection consistently between writers/readers.
        # If embedding_dim is None, try to attach to an existing suffixed collection
        # that matches the base name; otherwise fall back to base collection.
        existing = None
        if embedding_dim is None:
            try:
                cols = self._client.list_collections()
                base = base_name
                # Prefer a suffixed collection (any) that starts with base
                matches = [c for c in cols if getattr(c, 'name', '').startswith(base + '_d')]
                if matches:
                    # Pick the first match (collections are few; order not guaranteed)
                    existing = matches[0]
            except Exception:
                existing = None

        if existing is not None:
            self._collection = existing
        else:
            # Use get_or_create; for a new, suffixed name, the dimension will be set on first upsert.
            # This avoids colliding with older collections created with a different dimension.
            self._collection: Collection = self._client.get_or_create_collection(
                name=self._collection_name
            )

    @property
    def collection(self) -> Collection:
        return self._collection

    def upsert(
        self,
        ids: Iterable[str],
        embeddings: Iterable[List[float]],
        documents: Optional[Iterable[str]] = None,
        metadatas: Optional[Iterable[Mapping[str, object]]] = None,
    ) -> None:
        """Upsert vectors with optional documents and metadatas."""

        # Ensure metadata values are JSON-serializable primitives compatible with Chroma
        # Note: The installed Chroma version validates metadata values to be
        # str, int, float, bool, SparseVector, or None (lists/dicts are NOT accepted).
        # For lists/dicts we JSON-encode them into strings for storage.
        def sanitize(
            md: Mapping[str, object],
        ) -> Dict[str, Union[str, int, float, bool, None]]:
            out: Dict[str, Union[str, int, float, bool, None]] = {}
            for k, v in md.items():
                if isinstance(v, (str, int, float, bool)) or v is None:
                    out[k] = v
                elif isinstance(v, (list, dict)):
                    # Store complex structures as JSON strings
                    try:
                        out[k] = json.dumps(v, ensure_ascii=False)
                    except Exception:
                        out[k] = str(v)
                else:
                    out[k] = str(v)
            return out

        md: Optional[Sequence[Dict[str, Union[str, int, float, bool, None]]]] = (
            [sanitize(m) for m in metadatas] if metadatas is not None else None
        )
        self._collection.upsert(
            ids=list(ids),
            embeddings=list(embeddings),
            documents=list(documents) if documents is not None else None,
            metadatas=cast(Any, md),
        )

    def delete(self, ids: Iterable[str]) -> None:
        """Delete vectors by id."""
        self._collection.delete(ids=list(ids))

    def create_collection(
        self,
        name: str,
        embedding_function: Optional[callable] = None,
        embedding_dim: Optional[int] = None,
    ) -> Collection:
        """Create a new collection with the given name and optional embedding function."""
        return self._client.create_collection(
            name=name,
            embedding_function=embedding_function,  # embedding function output dimension should match embedding_dim
            embedding_dim=embedding_dim,
        )
