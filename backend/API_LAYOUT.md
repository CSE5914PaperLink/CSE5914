# Backend API Layout & Structure

This document provides a comprehensive overview of the API structure in the backend.

## 📁 Architecture Overview

The backend uses **FastAPI** with a modular router-based architecture. All routes are organized in the `app/api/` directory, with each file representing a functional domain.

```
backend/
└── app/
    ├── main.py              # FastAPI app & router registration
    └── api/                 # API route modules
        ├── routes_health.py    # Health checks
        ├── routes_api.py       # Standardized API endpoints (new)
        ├── routes_arxiv.py     # arXiv paper discovery
        ├── routes_openalex.py  # OpenAlex paper discovery
        ├── routes_library.py   # Library management
        ├── routes_docling.py   # PDF extraction
        ├── routes_gemini.py    # LLM chat & RAG
        └── routes_compare.py   # Paper comparison
```

---

## 🗂️ Router Organization

### 1. **Health & Monitoring** (`routes_health.py`)
**Prefix:** None  
**Purpose:** Basic health checks and monitoring

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Returns `{"status": "ok"}` |

---

### 2. **Standardized API** (`routes_api.py`) ⭐ **New**
**Prefix:** `/api`  
**Purpose:** Clean, standardized endpoints for frontend integration (Lovable-compatible)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ingest` | POST | Ingest PDF into vector database |
| `/api/search/semantic` | POST | Semantic search across papers |
| `/api/ingest/status/{paper_id}` | GET | Check ingestion status |
| `/api/context` | POST | Get context chunks for RAG |
| `/api/embeddings/{paper_id}` | DELETE | Delete paper embeddings |
| `/api/ingest/debug/all` | GET | Debug: List all ingestion statuses |
| `/api/ingest/debug/chromadb-check/{paper_id}` | GET | Debug: Check if paper exists in ChromaDB |

**Key Features:**
- ✅ Background task processing for PDF ingestion
- ✅ In-memory status tracking (pending → processing → completed/failed)
- ✅ Progress tracking (0-100%)
- ✅ Error handling with detailed logging

---

### 3. **arXiv Discovery** (`routes_arxiv.py`)
**Prefix:** `/arxiv`  
**Purpose:** Search and download papers from arXiv

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/arxiv/search` | GET | Search arXiv papers (free-text, title, author, category) |
| `/arxiv/download/{doc_id}` | GET | Download PDF by arXiv ID (streams file) |

**Query Parameters (search):**
- `q` - Free text search
- `title` - Title search
- `author` - Author search
- `abs` - Abstract search
- `cat` - Category (e.g., `cs.CL`)
- `start`, `max_results` - Pagination
- `sortBy`, `sortOrder` - Sorting

---

### 4. **OpenAlex Discovery** (`routes_openalex.py`)
**Prefix:** `/openalex`  
**Purpose:** Search papers using OpenAlex API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/openalex/search` | GET | Search OpenAlex works |
| `/openalex/works/{openalex_id}` | GET | Get detailed work information |

**Query Parameters (search):**
- `q` / `search` - Free text search
- `filter` - Raw OpenAlex filter string
- `from_publication_date`, `to_publication_date` - Date range
- `min_citations`, `max_citations` - Citation filters
- `is_oa`, `has_fulltext` - Boolean filters
- `sort` - Sort string (e.g., `cited_by_count:desc`)
- `per_page`, `page` - Pagination

---

### 5. **Library Management** (`routes_library.py`)
**Prefix:** `/library`  
**Purpose:** Manage user's paper library (add, list, delete)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/library/add/{doc_id}` | POST | Add arXiv paper to library (with optional GitHub repos) |
| `/library/list` | GET | List all papers in library |
| `/library/chunks/{doc_id}` | GET | Get text chunks for a document |
| `/library/delete/{doc_id}` | DELETE | Delete paper from library |
| `/library/check_batch` | POST | Check ingestion status for multiple papers |
| `/library/debug/list_all` | GET | Debug: List all documents in ChromaDB |

**Features:**
- Supports GitHub repository ingestion alongside PDFs
- Automatically extracts text chunks and images
- Stores embeddings in ChromaDB

---

### 6. **PDF Extraction** (`routes_docling.py`)
**Prefix:** `/docling`  
**Purpose:** Extract text and images from PDFs using Docling

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/docling/extract` | POST | Extract from uploaded PDF file |
| `/docling/extract_url` | POST | Extract from PDF URL |

**Returns:**
- Text chunks
- Images (base64 encoded)
- Metadata (title, authors, abstract, sections, page count)

---

### 7. **Gemini LLM Chat** (`routes_gemini.py`)
**Prefix:** `/gemini`  
**Purpose:** Chat with papers using Google Gemini with RAG

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gemini/chat` | POST | Simple chat (no RAG) |
| `/gemini/chat_agent` | POST | RAG-based chat with document context |

**Features:**
- ✅ Automatic GitHub-aware mode (detects GitHub-related questions)
- ✅ Semantic search integration
- ✅ Streaming responses (SSE)
- ✅ Thread/conversation support
- ✅ Source citations

**Request Body (`chat_agent`):**
```json
{
  "prompt": "What is the main contribution?",
  "thread_id": "session-123",
  "doc_ids": ["paper-1", "paper-2"],
  "model": "gemini-2.0-flash",
  "temperature": 0.0
}
```

---

### 8. **Paper Comparison** (`routes_compare.py`)
**Prefix:** `/compare`  
**Purpose:** Compare two papers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/compare` | POST | Compare two documents |

**Request Body:**
```json
{
  "doc_a": "paper-id-1",
  "doc_b": "paper-id-2"
}
```

**Returns:** Similarity scores, differences, summaries

---

## 🔌 Main Application Setup

All routers are registered in `app/main.py`:

```python
app.include_router(health_router)
app.include_router(openalex_router)
app.include_router(arxiv_router)
app.include_router(gemini_router)
app.include_router(library_router)
app.include_router(docling_router)
app.include_router(compare_router)
app.include_router(api_router)  # New standardized API
```

### Additional Endpoints

- `GET /` - Root endpoint: `{"message": "Hello, world!"}`
- `GET /debug` - Debug endpoint: `{"debug": true/false}`

---

## 🔄 Data Flow

### Paper Ingestion Flow

```
1. Frontend → POST /api/ingest
   ↓
2. Backend → Background task starts
   ↓
3. Fetch PDF from URL
   ↓
4. Extract text/images (Docling)
   ↓
5. Generate embeddings (Nomic)
   ↓
6. Store in ChromaDB
   ↓
7. Update status (pending → processing → completed)
```

### RAG Chat Flow

```
1. Frontend → POST /gemini/chat_agent
   ↓
2. Backend → Detect if GitHub-related question
   ↓
3. Semantic search (ChromaDB + Nomic embeddings)
   ↓
4. Retrieve relevant chunks
   ↓
5. Build context with citations
   ↓
6. Send to Gemini with context
   ↓
7. Stream response back to frontend
```

---

## 🎯 API Design Patterns

### 1. **Router Prefixes**
Each router has a unique prefix to organize endpoints:
- `/api/*` - Standardized endpoints
- `/arxiv/*` - arXiv-specific
- `/openalex/*` - OpenAlex-specific
- `/library/*` - Library management
- `/docling/*` - PDF extraction
- `/gemini/*` - LLM chat
- `/compare/*` - Comparison

### 2. **Error Handling**
- Uses FastAPI's `HTTPException` for errors
- Consistent error responses with status codes
- Detailed logging for debugging

### 3. **Background Tasks**
- PDF ingestion runs asynchronously
- Status tracking for long-running operations
- Progress updates (0-100%)

### 4. **Service Layer**
All business logic is in `app/services/`:
- `docling_service.py` - PDF extraction
- `embedding_service.py` - Embeddings (Nomic)
- `chroma_service.py` - Vector database
- `gemini_service.py` - LLM integration
- `github_service.py` - GitHub integration
- `comparison_service.py` - Paper comparison
- `agent_service.py` - RAG agent setup

---

## 📊 Endpoint Summary Table

| Router | Endpoints | Primary Use Case |
|--------|-----------|------------------|
| Health | 1 | Monitoring |
| **API** | 7 | **Frontend integration** ⭐ |
| arXiv | 2 | Paper discovery |
| OpenAlex | 2 | Paper discovery |
| Library | 6 | Library management |
| Docling | 2 | PDF extraction |
| Gemini | 2 | LLM chat & RAG |
| Compare | 1 | Paper comparison |
| **Total** | **23** | |

---

## 🚀 Key Features

1. **Modular Design**: Each functional domain has its own router
2. **Service Layer**: Business logic separated from routes
3. **Type Safety**: Pydantic models for request/response validation
4. **Background Tasks**: Async processing for long operations
5. **Status Tracking**: Real-time progress for ingestion
6. **Debug Endpoints**: Development and troubleshooting tools
7. **CORS Support**: Configured for cross-origin requests

---

## 📝 Notes

- The **`/api/*`** endpoints are the newest addition, designed for frontend integration
- Legacy endpoints in `/library/*`, `/gemini/*`, etc. are still available
- Both sets of endpoints can coexist and use the same underlying services
- ChromaDB is used as the vector database for all embeddings
- Status tracking is currently in-memory (consider Redis/database for production)

---

## 🔗 Related Documentation

- `API_ENDPOINTS_SPECIFICATION.md` - Detailed spec for `/api/*` endpoints
- `API_STRUCTURE_COMPARISON.md` - Comparison of old vs new API structure
- `VERIFY_EXTRACTION.md` - How to verify paper extraction
- `ENV_SETUP.md` - Environment variable configuration

