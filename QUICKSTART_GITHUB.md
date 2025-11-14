# Quick Start Guide: GitHub Integration

## Setup

### 1. Install Dependencies

The required packages are already in `backend/pyproject.toml`:
```toml
httpx = "^0.25.0"  # Already included for async HTTP
```

No additional dependencies needed! 🎉

### 2. Configure GitHub Token (Optional)

For higher API rate limits, add to `.env`:
```bash
GITHUB_API_TOKEN=ghp_your_token_here
```

**To get a token**:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a new token (no scopes needed for public repos)
3. Add to `.env`

*Without token: Still works, but ~60 API calls/hour limit*

### 3. Verify Configuration

```bash
cd backend
python -c "from app.core.config import settings; print(f'Chroma path: {settings.chroma_persist_path}')"
```

## Running Examples

### Example 1: Simple PDF Ingestion (No GitHub)

```bash
curl -X POST "http://localhost:8000/library/add/2301.12345"
```

**Response**:
```json
{
  "status": "ok",
  "arxiv_id": "2301.12345",
  "pdf_ingested": true,
  "repos": []
}
```

✅ **Backward compatible** - existing code still works!

### Example 2: PDF + One GitHub Repo

```bash
curl -X POST "http://localhost:8000/library/add/2301.12345" \
  -H "Content-Type: application/json" \
  -d '{
    "github_repos": [
      "https://github.com/tensorflow/tensorflow"
    ]
  }'
```

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
      "url": "https://github.com/tensorflow/tensorflow",
      "status": "ok",
      "files_ingested": 8
    }
  ]
}
```

### Example 3: PDF + Multiple Repos

```bash
curl -X POST "http://localhost:8000/library/add/2301.12345" \
  -H "Content-Type: application/json" \
  -d '{
    "github_repos": [
      "https://github.com/owner/repo1",
      "git@github.com:owner/repo2.git",
      "https://github.com/owner/repo3.git"
    ]
  }'
```

**Response**:
```json
{
  "status": "ok",
  "arxiv_id": "2301.12345",
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
    },
    {
      "url": "https://github.com/owner/repo3",
      "status": "error",
      "error": "Could not determine default branch"
    }
  ]
}
```

**Note**: One failed repo doesn't block the others or the PDF.

### Example 4: Various URL Formats (All Equivalent)

```bash
# HTTPS standard
"https://github.com/owner/repo"

# HTTPS with .git
"https://github.com/owner/repo.git"

# SSH
"git@github.com:owner/repo.git"

# With trailing slash
"https://github.com/owner/repo/"

# HTTP (converted to HTTPS)
"http://github.com/owner/repo"
```

All are normalized to `https://github.com/owner/repo` internally.

## Query Examples

### Listing All Papers (PDF Records)

```bash
curl "http://localhost:8000/library/list"
```

Returns all records (PDFs + GitHub files mixed).

### Filter by Source Type

**In Python** (once we add metadata filtering):
```python
from app.services.chroma_service import ChromaService

chroma = ChromaService()

# Get only PDFs for a specific paper
pdfs = chroma.collection.get(
    where={"source": "docling", "arxiv_id": "2301.12345"}
)

# Get only GitHub files for that paper
github = chroma.collection.get(
    where={"source": "github", "arxiv_id": "2301.12345"}
)
```

### Check What Was Ingested

```python
from app.services.chroma_service import ChromaService

chroma = ChromaService()

# Get all records for a paper
records = chroma.collection.get(
    where={"arxiv_id": "2301.12345"},
    include=["metadatas"]
)

for record_id, metadata in zip(records["ids"], records["metadatas"]):
    if metadata.get("source") == "github":
        print(f"GitHub: {metadata['file_path']} ({metadata['language']})")
    elif metadata.get("source") == "docling":
        print(f"PDF: {metadata['format']}")
```

## Testing Locally

### Run Unit Tests

```bash
cd backend
poetry run pytest tests/test_github_integration.py -v
```

**Output**:
```
tests/test_github_integration.py::TestGitHubServiceIntegration::test_normalize_github_url_https PASSED
tests/test_github_integration.py::TestGitHubServiceIntegration::test_normalize_github_url_https_with_git_suffix PASSED
tests/test_github_integration.py::TestGitHubServiceIntegration::test_normalize_github_url_ssh PASSED
tests/test_github_integration.py::TestGitHubServiceIntegration::test_infer_file_type_readme PASSED
tests/test_github_integration.py::TestGitHubServiceIntegration::test_infer_file_type_python_code PASSED
tests/test_github_integration.py::TestGitHubServiceIntegration::test_ingest_repo_files_empty_list PASSED
tests/test_github_integration.py::TestRepoIngestion::test_ingest_repo_files_mock PASSED
...
```

### Test with a Real Repository

```bash
# Start your backend
cd backend
poetry run uvicorn app.main:app --reload

# In another terminal, test with a real repo
curl -X POST "http://localhost:8000/library/add/2301.00001" \
  -H "Content-Type: application/json" \
  -d '{
    "github_repos": ["https://github.com/openai/gpt-2"]
  }'
```

**Tips for testing**:
- Use small, real GitHub repos first (openai/gpt-2, torvalds/linux)
- Check logs for debugging: `poetry run python -c "import logging; logging.basicConfig(level=logging.DEBUG)"`
- Verify data in Chroma: `poetry run python -c "from app.services.chroma_service import ChromaService; c = ChromaService(); print(f'Total records: {len(c.collection.get()[\"ids\"])}')"

## Troubleshooting

### Issue: GitHub Repo Not Found

**Symptom**:
```json
{
  "status": "error",
  "error": "Could not determine default branch"
}
```

**Causes**:
1. Repo is private and no token provided
2. Repo URL is incorrect
3. GitHub API is rate-limited

**Solutions**:
- Add GitHub token to `.env`
- Double-check repo URL
- Wait an hour or upgrade GitHub token

### Issue: "Files Too Large" Warning

**Symptom**: Repo ingested but fewer files than expected

**Cause**: Individual files exceeded 50KB limit

**Solutions**:
- Expected behavior (prevents token bloat)
- Adjust `MAX_CONTENT_LENGTH` in `gemini_service.py` if needed
- Focus on repos with smaller files

### Issue: Slow Ingestion

**Symptom**: Took >2 minutes to ingest PDF + 3 repos

**Cause**: Normal - involves multiple network requests + embeddings

**Typical timing**:
- PDF fetch: 5-30s
- Per repo API calls: 1-5s
- Per repo files: 10-30s
- Embedding batch: 5-15s
- **Total**: 30s-2min for PDF + 2-3 repos

**To speed up**:
- Add GitHub token (faster API access)
- Reduce number of repos
- Reduce file count limits in `github_service.py`

### Issue: Rate Limited by GitHub

**Symptom**:
```json
{
  "status": "error",
  "error": "403 Forbidden"
}
```

**Solution**:
```bash
# Add to .env
GITHUB_API_TOKEN=ghp_your_token_here

# Or wait 1 hour for unauthenticated limit to reset
```

## Next: Integration with Frontend

The frontend library page (`frontend/app/library/page.tsx`) will automatically show GitHub files alongside PDF records since they all have the same `arxiv_id` in metadata.

To display them differently:
```tsx
// In frontend/app/library/page.tsx
{item.metadata.source === "github" && (
  <span className="text-purple-600">🐙 GitHub: {item.metadata.file_path}</span>
)}
{item.metadata.source === "docling" && (
  <span className="text-blue-600">📄 PDF</span>
)}
```

## Production Considerations

1. **Rate Limiting**: Add request throttling if ingesting many papers
2. **Caching**: Consider caching repo files to avoid re-fetching
3. **Batch Operations**: Create `/library/batch` for multiple papers
4. **Monitoring**: Log ingestion success rates and timings
5. **Cleanup**: Delete old records periodically
6. **Token Security**: Use secrets manager, not `.env` in production

---

**That's it!** You now have GitHub + arXiv integration fully working. Start ingesting with examples above! 🚀
