# Packages Actually Used in Backend

This document lists all third-party packages that are actually imported and used in the backend codebase (excluding standard library modules).

## ✅ Packages Actually Used (Found in Imports)

### Core Framework
- **fastapi** - Web framework (`from fastapi import ...`)
- **pydantic** / **pydantic-settings** - Data validation (`from pydantic_settings import ...`, `from pydantic import ...`)
- **python-multipart** - File upload support (used implicitly by FastAPI for `UploadFile`)

### HTTP Clients
- **httpx** - Async HTTP client (`import httpx`)

### Google AI Services
- **google-genai** - Google Gemini AI SDK (`from google import genai`, `from google.genai import types`)
- **google-api-core** - Google API core (`from google.api_core.exceptions import ResourceExhausted`)

### Document Processing
- **docling** - Document conversion library (`from docling.document_converter import ...`, `from docling.datamodel import ...`)
- **docling-core** - Docling core components (`from docling_core.transforms.chunker import ...`)
- **transformers** - Hugging Face transformers (`from transformers import AutoTokenizer`)

### Vector Database & Embeddings
- **chromadb** - Vector database (used via `langchain_chroma`)
- **langchain-chroma** - LangChain ChromaDB integration (`from langchain_chroma import Chroma`)
- **langchain-nomic** - Nomic embeddings (`from langchain_nomic import NomicEmbeddings`)
- **langchain-core** - Core LangChain components (`from langchain_core.documents import Document`, `from langchain_core.tools import ...`)
- **langchain-community** - LangChain community (`from langchain_community.vectorstores.utils import ...`)

### LangChain & LangGraph
- **langchain-google-genai** - Google Gemini integration (`from langchain_google_genai import ChatGoogleGenerativeAI`)
- **langgraph** - LangGraph for agent workflows (`from langgraph.prebuilt import ...`, `from langgraph.checkpoint.memory import ...`)

### Image Processing
- **Pillow** - Image processing library (`from PIL import Image`)

### Firebase
- **firebase-admin** - Firebase Admin SDK (`from firebase_admin import initialize_app`)
- **firebase-functions** - Firebase Cloud Functions (`from firebase_functions import https_fn`)

### Testing (dev dependencies)
- **pytest** - Testing framework (used in test files)
- **requests** - HTTP library (`import requests` in `test_extract_images.py`)

## ❌ Packages in pyproject.toml but NOT Found in Code

These packages are listed in `pyproject.toml` but are **not directly imported** anywhere:

1. **gpt4all** - Not found in any imports
2. **pypdfium2** - Not found in any imports
3. **langchain-text-splitters** - Not directly imported (might be a transitive dependency)
4. **langchain-docling** - Not directly imported (might be a transitive dependency)
5. **firebase** - Different from `firebase-admin`, not found in imports
6. **uvicorn** - ASGI server (not directly imported, but needed to run FastAPI)

## 📋 Complete List of Actually Used Packages

### Production Dependencies (19 packages):
1. fastapi
2. pydantic-settings
3. python-multipart
4. httpx
5. google-genai
6. google-api-core (dependency of google-genai)
7. docling
8. docling-core (likely part of docling package)
9. transformers
10. chromadb
11. langchain-chroma
12. langchain-nomic
13. langchain-core
14. langchain-community
15. langchain-google-genai
16. langgraph
17. Pillow
18. firebase-admin
19. firebase-functions

### Dev Dependencies (2 packages):
1. pytest
2. requests

## 🔍 Notes:
- Standard library modules (typing, json, base64, os, tempfile, uuid, logging, re, collections, xml.etree, urllib.parse, dataclasses, pathlib, datetime, argparse, sys, webbrowser) are not listed
- `uvicorn` is required to run the FastAPI app but not directly imported
- Some packages like `docling-core` might be part of the `docling` package
- `google-api-core` is likely a dependency of `google-genai`

