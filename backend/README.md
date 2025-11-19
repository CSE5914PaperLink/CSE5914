# PaperLink Backend

FastAPI-based backend powering document ingestion, embeddings, retrieval augmented generation (RAG), and scholarly data discovery (ArXiv / OpenAlex). It integrates:

- Vector store (Chroma) for semantic search
- Embedding & LLM services (Gemini + local embedding models)
- Document parsing (Docling) and PDF/image extraction
- Library management endpoints (add/list/delete/check)
- External scholarly APIs (ArXiv, OpenAlex)
- Firebase Data Connect + GraphQL (schema & seed data)

The backend is designed for local development ease (Poetry + uvicorn) and cloud deployment (Firebase / serverless functions folder present).

---

## Requirements

- Python 3.13 (pinned via `.python-version`) – 3.11+ may work, but develop against 3.13 to match lock file.
- Poetry (dependency / environment manager)

Verify versions:

```powershell
python --version
poetry --version
```

Install Poetry (Windows PowerShell):

```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

After install, ensure the Poetry bin directory is on PATH (usually `%APPDATA%\Python\Scripts` or `%USERPROFILE%\.local\bin`).

---

## Tech Stack

- FastAPI / Uvicorn – async web framework & ASGI server
- Pydantic Settings – configuration via environment & `.env`
- Poetry – dependency & virtualenv management
- Chroma – persistent vector DB (`backend/chroma` & `backend/chroma_data`)
- Docling – document parsing / PDF processing
- Google Gemini – LLM integration (`services/gemini_service.py`)
- Firebase Data Connect – GraphQL schema & connectors (`dataconnect/`)
- Pytest / Ruff / Black – testing & quality

---

## Setup

```powershell
# From repository root
cd backend

# Install dependencies into virtualenv
poetry install

# (Optional) add poetry shell plugin
poetry self add poetry-plugin-shell

# Activate virtualenv (interactive shell)
poetry shell
```

Create a `.env` file at `backend/.env` (see Configuration below).

If you prefer one-off commands without activating the shell, prefix with `poetry run`.

---

## Configuration

Settings are loaded via `app/core/config.py` using pydantic-settings. Environment variables override `.env` values.

Current settings (expand as new ones are added):

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DEBUG`  | bool | False   | Enables FastAPI debug & verbose logging |

Example `.env`:

```env
# GEMINI_API_KEY=... (required for Gemini service)
```

Keep secrets out of version control; use environment variables in deployment contexts.

---

## Running (Development)

Inside an active Poetry shell:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Without activating shell:

```powershell
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API endpoints auto-document:

- Root: <http://127.0.0.1:8000/>
- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>

---

## Data & Persistence

- Vector DB files reside in `backend/chroma/` and `backend/chroma_data/`. These folders persist embeddings across restarts.
- If you need a clean slate, stop the server and remove those directories (or back them up first).
- Ensure sufficient disk space for large document sets.

---

## Testing & Quality

```powershell
# Run tests
poetry run pytest -q

# Lint (Ruff)
poetry run ruff check .

# Auto-fix lint issues
poetry run ruff check . --fix

# Format (Black)
poetry run black .
```

Add new tests under `backend/tests/`. Prefer descriptive test names and focused assertions.

---

## Directory Structure (Detailed)

```text
backend/
├─ app/
│  ├─ main.py                  # FastAPI app factory / instance
│  ├─ api/                     # Route modules
│  │  ├─ routes_health.py      # Health / readiness
│  │  ├─ routes_docling.py     # Document parsing endpoints
│  │  ├─ routes_gemini.py      # Gemini LLM endpoints (RAG/generation)
│  │  ├─ routes_arxiv.py       # ArXiv scholarly queries
│  │  ├─ routes_openalex.py    # OpenAlex scholarly queries
│  │  ├─ routes_library.py     # Library management (add/list/delete)
│  ├─ core/
│  │  └─ config.py             # Pydantic settings
│  ├─ services/                # Service layer abstractions
│  │  ├─ docling_service.py    # PDF/text extraction logic
│  │  ├─ embedding_service.py  # Embedding generation & storage
│  │  ├─ gemini_service.py     # Gemini integration & RAG orchestration
│  │  └─ chroma_service.py     # Vector store interactions
├─ chroma/                     # Chroma DB persistent data
├─ chroma_data/                # Alternate / legacy Chroma storage
├─ dataconnect/                # Firebase Data Connect GraphQL artifacts
│  ├─ dataconnect.yaml
│  ├─ seed_data.gql            # Example seed mutations
│  ├─ schema/                  # GraphQL schema definition
│  │  └─ schema.gql
│  └─ example/                 # Sample connector & queries
├─ functions/                  # Firebase functions (Python) entrypoints
│  └─ main.py
├─ tests/                      # Pytest suite
│  ├─ test_smoke.py
│  ├─ test_docling_api.py
│  ├─ test_docling_direct.py
│  ├─ test_extract_images.py
│  ├─ test_gemini_rag.py
│  ├─ test_arxiv.py
│  └─ test_openalex.py
├─ pyproject.toml              # Project metadata & dependencies
├─ poetry.lock                 # Locked dependency versions
├─ .python-version             # Python interpreter pin (3.13.x)
├─ .env                        # Local environment variables (NOT committed)
└─ README.md
```

---

## Common Issues / Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Import errors after `git pull` | Missing deps | `poetry install` |
| Chroma errors / schema mismatch | Stale vector DB | Delete `chroma/` & `chroma_data/` then restart |
| 401 / auth errors on Gemini | Missing API key | Set `GEMINI_API_KEY` in `.env` |
| Debug not enabled | `DEBUG` false | Set `DEBUG=true` in `.env` |

Enable verbose logging temporarily with `DEBUG=true` only in local dev.

---

## Deployment Notes (High-Level)

- For production consider running `uvicorn` behind a process manager (e.g., gunicorn with `uvicorn.workers.UvicornWorker`).
- Ensure secrets are injected via environment (not `.env`).
- Backup / migrate Chroma data if moving hosts.
- Cloud functions integration lives in `functions/` (aligns with Firebase configuration in root `firebase.json`).

---

## Quick Start Recap

```powershell
git clone <repo>
cd backend
poetry install
echo "DEBUG=true" > .env
poetry run uvicorn app.main:app --reload
```
