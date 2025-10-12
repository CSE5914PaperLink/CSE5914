## CSE5914 Backend (FastAPI)

Lightweight FastAPI backend for the CSE5914 project. Includes a simple root endpoint and is wired for environment-based configuration.

---

## Requirements

- Python 3.11 (matches `.python-version` and `pyproject.toml`)
- Poetry (dependency and environment manager)

```bash
# Verify Python version is 3.13+
python3 --version

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
```

## Setup

```bash
# install deps into a virtualenv
poetry install

# Install poetry shell
poetry self add poetry-plugin-shell

# activate the venv
poetry shell
```

## Run (development)

```bash
# With an active poetry shell
uvicorn app.main:app --reload
```

Visit:

- Local API: http://127.0.0.1:8000/
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Configuration

Settings are managed with `pydantic-settings` and loaded from environment variables and `.env` at the project root.

Current settings (see `app/core/config.py`):

- `debug` (bool) – default: `False`

Example `.env`:

```bash
DEBUG=true
```

## Testing and code quality

```bash
# Run tests (pytest)
poetry run pytest -q

# Lint (ruff)
poetry run ruff check . --fix

# Format (black)
poetry run black .
```

## Project structure

```
backend/
├─ app/
│  ├─ main.py                   # FastAPI app instance and root route
│  ├─ api/                      # Project APIs
│  │  └─ routes_health.py
│  └─ core/
│     └─ config.py.              # Settings via pydantic-settings
├─ tests/                       # Test suite
│  └─ test_smoke.py             # Preliminary check
├─ pyproject.toml               # Project metadata and dependencies
├─ .env                         # Environment variables (API keys, credentials, etc)
├─ poetry.lock                  # Locked dependency versions
├─ .python-version              # Python version pin (3.13.0)
└─ README.md
```
