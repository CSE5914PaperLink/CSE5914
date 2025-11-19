# PaperLink

**AU25 CSE5914 Team 1**  
Search, ingest, manage, and compare CS research papers with AI assistance.

## Overview

CS Paper Compare is a full‑stack web application for exploring computer science research literature. It integrates external scholarly sources (ArXiv, OpenAlex), parses and embeds uploaded PDFs, and enables Retrieval Augmented Generation (RAG) style chat and analysis. Users can build personal libraries, run semantic searches, and interact with AI to extract insights and compare papers.

## High-Level Features

- **Paper Discovery**: Query ArXiv & OpenAlex directly from the UI.
- **Library Management**: Add, list, delete, and check ingestion status of papers.
- **Document Parsing**: Extract text/images from PDFs (Docling) and generate embeddings (Chroma vector store).
- **AI Chat / RAG**: Gemini-powered conversational interface (contextual answers using embeddings).
- **Code Linking**: Associate papers with GitHub repositories for reproducibility exploration.
- **Semantic Search**: Vector similarity leveraging Chroma for relevant context retrieval.
- **GraphQL Integration**: Firebase Data Connect schema & generated client for structured data.
- **Responsive UI**: Next.js + Tailwind CSS for mobile-friendly pages.

## Architecture

```text
            +---------------------+
            |     Frontend        |
            |  Next.js 16 (TS)    |
            |  Pages & API Routes |
            +----------+----------+
                       | REST / GraphQL / Fetch
                       v
        +------------------------------+
        |          Backend             |
        | FastAPI (Python 3.13)        |
        | Routes: ArXiv, OpenAlex,     |
        | Docling, Gemini, Library     |
        +-------+-----------+----------+
                |           |
         Embeddings      Scholarly APIs
                |           |
         +------+----+   +--+-----------+
         |  Chroma DB |   | ArXiv /     |
         |  Vector    |   | OpenAlex    |
         +------------+   +-------------+
                |
          Gemini LLM (RAG)

        Firebase Data Connect (GraphQL schema & generated client)
```

### Tech Stack

| Area | Technologies |
|------|--------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion, React Markdown |
| Backend | FastAPI, Uvicorn, Pydantic Settings, Poetry |
| AI / NLP | Gemini API, Embedding models (via `embedding_service.py`) |
| Vector Store | Chroma |
| Document Parsing | Docling for PDF/data extraction |
| Data / GraphQL | Firebase Data Connect, Generated client package |
| Auth / Platform | Firebase SDK |
| Testing | Pytest (backend), ESLint (frontend) |
| Quality | Ruff, Black (backend) |

## Repository Structure

```text
root/
├─ backend/                  # FastAPI application & services
│  ├─ app/                   # API routes, services, config
│  ├─ chroma/                # Chroma vector DB persistence
│  ├─ dataconnect/           # GraphQL schema & seed data
│  ├─ functions/             # Firebase functions (Python)
│  ├─ tests/                 # Pytest suite
│  ├─ pyproject.toml         # Python project metadata
│  └─ README.md              # Backend-specific docs
├─ frontend/                 # Next.js application
│  ├─ app/                   # App Router pages & route handlers
│  ├─ components/            # Reusable UI components
│  ├─ dataconnect/           # GraphQL schema + example
│  ├─ src/dataconnect-generated/  # Generated Data Connect client
│  ├─ lib/                   # Firebase & helper utilities
│  └─ README.md              # Frontend-specific docs
├─ firebase.json             # Root Firebase config
├─ README.md                 # Project overview
└─ other configs ...
```

## Prerequisites

| Component | Requirement |
|-----------|-------------|
| Backend | Python 3.13+, Poetry installed |
| Frontend | Node.js 20+ (recommended) & npm / yarn / pnpm |
| LLM | Gemini API key (set in environment) |
| Vector DB | Storage for Chroma embeddings |

## Setup (Windows PowerShell examples)

Clone repository:

```powershell
git clone https://github.com/jeevanadella/CSE5914.git
cd CSE5914
```

### Backend Setup

```powershell
cd backend
python --version
poetry install
poetry self add poetry-plugin-shell   # optional shell plugin
poetry shell                          # activate virtualenv
```

Create `backend/.env`:

```env
DEBUG=true
GEMINI_API_KEY=your_key_here
```

### Frontend Setup

```powershell
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
```

## Running (Development)

In two terminals (or use a process manager):

Backend:

```powershell
cd backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend
npm run dev
```

Access:

- Frontend UI: <http://localhost:3000>
- Backend API root: <http://127.0.0.1:8000/>
- Swagger: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>

## Testing & Quality

Backend:

```powershell
cd backend
poetry run pytest -q
poetry run ruff check . --fix
poetry run black .
```

Frontend:

```powershell
cd frontend
npm run lint
```

## Troubleshooting

| Symptom | Cause | Resolution |
|---------|-------|-----------|
| 401 Gemini calls | Missing `GEMINI_API_KEY` | Add to `backend/.env` and restart |
| Chroma errors | Corrupted vector store | Delete `backend/chroma/*` (after backup) |
| Frontend 404 page | Missing `page.tsx` in route directory | Add `page.tsx` file |
| CORS issues | Backend not configured / wrong base URL | Verify `BACKEND_API_BASE` and FastAPI CORS settings |
| Firebase auth fails | Invalid Firebase config | Recheck `NEXT_PUBLIC_FIREBASE_*` values |
