# GitHub Integration for arXiv Ingestion Pipeline

## Overview

This document describes the extension of the existing arXiv PDF ingestion pipeline to also ingest related GitHub repository files. When you add an arXiv paper with associated GitHub repositories, the system will:

1. Download and ingest the arXiv PDF (existing behavior)
2. Fetch relevant files from the GitHub repo(s)
3. Generate embeddings for all content
4. Store everything in Chroma DB, linked by `arxiv_id`

## Architecture

### New Components

#### 1. `github_service.py` – GitHub File Fetching

**Location**: `backend/app/services/github_service.py`

**Key Classes & Functions**:

- **`RepoFile`** (dataclass)
  - `path`: File path relative to repo root
  - `content`: Raw file content
  - `language`: Inferred programming language (e.g., "python", "markdown")
  - `kind`: File classification (e.g., "readme", "docs", "code", "notebook")

- **`normalize_github_url(url: str) -> str`**
  - Converts various GitHub URL formats to canonical `https://github.com/owner/repo`
  - Handles:
    - SSH URLs: `git@github.com:owner/repo.git` → `https://github.com/owner/repo`
    - URLs with `.git` suffix
    - Trailing slashes
    - HTTP → HTTPS conversion

- **`GitHubService`**
  - Async service to fetch files from GitHub repos
  - Uses GitHub API (with optional token) + raw.githubusercontent.com for content
  - **Main Method**: `fetch_repo_files(repo_url: str) -> list[RepoFile]`
    - Fetches high-signal files:
      - `README.md`
      - `docs/*.md` (up to limit)
      - `src/**/*.py` (up to 3 files)
      - `examples/**/*.py` (up to 2 files)
      - `*.ipynb` (up to 2 files)
    - Skips large files (> 50KB)
    - Returns empty list on failure (non-fatal)

**Configuration**:
```python
# In app/core/config.py
github_api_token: str = ""  # Optional; for auth if needed
github_raw_url: str = "https://raw.githubusercontent.com"
```

#### 2. `gemini_service.py` – Enhanced Ingestion

**Location**: `backend/app/services/gemini_service.py`

**New Function**: `ingest_repo_files_into_chroma()`

```python
def ingest_repo_files_into_chroma(
    repo_url: str,
    arxiv_id: str,
    repo_files: list[RepoFile],
    base_metadata: Optional[dict] = None,
) -> int:
    """
    Ingest GitHub repo files into Chroma.
    
    Returns: Number of files successfully ingested.
    """
```

**What It Does**:
1. Filters files by size (max 50KB to respect embedding token limits)
2. Generates embeddings for all file contents using `GeminiEmbeddingService`
3. Creates unique IDs for each file: `{arxiv_id}|github|{repo_url}|{file_path}`
4. Builds metadata with:
   - `arxiv_id`: Links back to the paper
   - `source`: "github"
   - `repo_url`: Full repository URL
   - `file_path`: Path within repo
   - `language`, `kind`: Inferred file type
   - `content_type`: e.g., "github_readme", "github_code"
   - `length`: File size in characters
5. Upserts all records to Chroma in one batch

**Error Handling**:
- Embedding failures → logs error, returns 0
- Individual file fetch failures → skipped gracefully
- Chroma upsert failures → logged, returns count of successfully added files

#### 3. `routes_library.py` – Updated API Endpoint

**Location**: `backend/app/api/routes_library.py`

**Request Model**: `AddArxivRequest`
```python
class AddArxivRequest(BaseModel):
    github_repos: List[str] = Field(
        default_factory=list,
        description="Optional list of GitHub repository URLs"
    )
```

**Updated Endpoint**: `POST /library/add/{arxiv_id}`

**Changes**:
- Accepts optional JSON body with `github_repos` list
- If no body provided, defaults to `github_repos=[]` (PDF-only ingestion)
- Orchestrates:
  1. PDF ingestion (existing)
  2. For each provided repo URL:
     - Normalize URL
     - Fetch files via `GitHubService`
     - Ingest via `ingest_repo_files_into_chroma()`
     - Catch and log errors (non-fatal)

**Response**:
```json
{
  "status": "ok",
  "arxiv_id": "2301.12345",
  "metadata": {
    "title": "Paper Title",
    "authors": ["Author 1", "Author 2"],
    "summary": "...",
    "pdf_url": "https://arxiv.org/pdf/2301.12345.pdf",
    "arxiv_id": "2301.12345"
  },
  "pdf_ingested": true,
  "repos": [
    {
      "url": "https://github.com/owner/repo",
      "status": "ok",
      "files_ingested": 5
    },
    {
      "url": "https://github.com/owner/repo2",
      "status": "error",
      "error": "Failed to fetch repo"
    }
  ]
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  POST /library/add/2301.12345                              │
│  {                                                           │
│    "github_repos": [                                        │
│      "https://github.com/owner/repo1",                     │
│      "git@github.com:owner/repo2.git"                      │
│    ]                                                         │
│  }                                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴──────────┐
          │                      │
          ▼                      ▼
    ┌──────────────┐      ┌──────────────────┐
    │ Fetch arXiv  │      │ Fetch GitHub     │
    │ PDF          │      │ Repos            │
    └──────┬───────┘      └────────┬─────────┘
           │                       │
           ▼                       ▼
    ┌──────────────┐      ┌──────────────────┐
    │ Docling:     │      │ GitHubService:   │
    │ PDF→Markdown │      │ Fetch repo files │
    └──────┬───────┘      └────────┬─────────┘
           │                       │
           ▼                       ▼
    ┌──────────────┐      ┌──────────────────┐
    │ Gemini:      │      │ Gemini:          │
    │ Embed text   │      │ Embed all files  │
    └──────┬───────┘      └────────┬─────────┘
           │                       │
           └───────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │ Chroma DB Upsert         │
        │ - arxiv:{arxiv_id}       │
        │ - {arxiv_id}|github|...  │
        └──────────────────────────┘
```

## Chroma DB Schema

### arXiv PDF Record

```
id: "arxiv:2301.12345"
document: <full markdown from PDF>
metadata: {
  "arxiv_id": "2301.12345",
  "source": "docling",
  "format": "pdf",
  "length": 45000,
  "title": "...",
  "authors": "[...]",
  "summary": "...",
  "pdf_url": "https://arxiv.org/pdf/..."
}
embeddings: [768-dim vector from Gemini]
```

### GitHub File Record

```
id: "2301.12345|github|https://github.com/owner/repo|src/main.py"
document: <raw file content>
metadata: {
  "arxiv_id": "2301.12345",
  "source": "github",
  "repo_url": "https://github.com/owner/repo",
  "file_path": "src/main.py",
  "language": "python",
  "kind": "code",
  "content_type": "github_code",
  "length": 1500,
  "title": "..."  # inherited from base_metadata
}
embeddings: [768-dim vector from Gemini]
```

## Usage Examples

### 1. Ingest Only arXiv PDF (Backward Compatible)

```bash
curl -X POST "http://localhost:8000/library/add/2301.12345"
```

**Response**:
```json
{
  "status": "ok",
  "arxiv_id": "2301.12345",
  "metadata": {...},
  "pdf_ingested": true,
  "repos": []
}
```

### 2. Ingest arXiv PDF + GitHub Repos

```bash
curl -X POST "http://localhost:8000/library/add/2301.12345" \
  -H "Content-Type: application/json" \
  -d '{
    "github_repos": [
      "https://github.com/owner/repo1",
      "git@github.com:owner/repo2.git"
    ]
  }'
```

**Response**:
```json
{
  "status": "ok",
  "arxiv_id": "2301.12345",
  "metadata": {...},
  "pdf_ingested": true,
  "repos": [
    {
      "url": "https://github.com/owner/repo1",
      "status": "ok",
      "files_ingested": 6
    },
    {
      "url": "https://github.com/owner/repo2",
      "status": "ok",
      "files_ingested": 4
    }
  ]
}
```

## Error Handling & Resilience

### Graceful Degradation

- **GitHub fetch fails** → PDF ingestion still succeeds; repo skipped with warning logged
- **Individual repo file fetch fails** → Other files still ingested; error logged
- **Embedding fails** → Record skipped; error logged; other records still ingested
- **Invalid GitHub URL** → Normalized and retried; if still invalid, skipped

### Logging

All operations are logged at appropriate levels:
- `INFO`: Successful ingestion, repo fetch, file count
- `WARNING`: Repo fetch with no files, all files oversized
- `ERROR`: PDF fetch failure, embedding failure, Chroma upsert failure
- `DEBUG`: Individual file skips, API failures

## Configuration

Add to `.env` file (optional):

```env
# GitHub configuration (optional)
GITHUB_API_TOKEN=your_github_token_here
GITHUB_RAW_URL=https://raw.githubusercontent.com
```

**Why optional token?**
- Unauthenticated GitHub API requests allow ~60 req/hour
- With token: ~5000 req/hour
- For most use cases (ingesting a few repos at a time), unauthenticated is sufficient
- Add token if you're batch-ingesting many papers/repos

## Testing

Run the test suite:

```bash
cd backend
poetry run pytest tests/test_github_integration.py -v
```

**Tests cover**:
- URL normalization (various formats)
- File type inference
- RepoFile creation
- Mock API responses for repo fetching
- Repo ingestion with mocked Gemini
- Metadata schema validation

## Performance Considerations

### Request Timeouts
- PDF fetch: 60s (connect: 10s)
- GitHub API: 30s (individual files: 10s)
- Reasonable for typical papers and repos

### File Size Limits
- Maximum 50KB per file (configurable in code)
- Prevents excessive token usage for embeddings
- Jupyter notebooks are converted to text but still subject to size limit

### Batching
- All files from a single repo are batched into one Gemini embedding call
- Up to ~100 files at once (Gemini API batch limit)

### Async
- Entire flow is async; non-blocking
- Can safely scale to multiple concurrent ingestion requests

## Backward Compatibility

**✅ Fully backward compatible**:
- Existing `POST /library/add/{arxiv_id}` calls (no body) still work
- Old code doesn't need to change
- GitHub repos are purely additive

## Future Enhancements

1. **Selective file inclusion**: Allow filtering which file types to ingest
2. **Depth control**: Limit directory recursion depth for large repos
3. **Caching**: Cache fetched repo files to avoid re-fetching
4. **Batch operations**: Allow ingesting multiple papers in one request
5. **Metadata discovery**: Auto-detect repo URLs from arXiv paper abstracts
6. **Chunking**: Split large files into smaller chunks before embedding
7. **Deduplication**: Detect and skip duplicate content across papers/repos
