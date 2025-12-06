# How to Check if Papers Are Being Extracted

## Quick Check Methods

### 1. Look for Log Messages

When extraction happens successfully, you should see in your backend console:

```
INGESTED PDF: 150 text chunks, 10 image chunks
```

This message appears when:
- PDF is downloaded
- Text is extracted using Docling
- Chunks are embedded
- Data is stored in ChromaDB

### 2. Check Ingestion Status

```bash
curl http://localhost:8000/api/ingest/status/YOUR_PAPER_ID
```

**Response meanings:**
- `{"status": "pending", "progress": 0}` - Not started yet
- `{"status": "processing", "progress": 50}` - Currently extracting
- `{"status": "completed", "progress": 100}` - ✅ Successfully extracted
- `{"status": "failed", "progress": 0}` - ❌ Extraction failed

### 3. Check ChromaDB

```bash
# Check if paper exists in ChromaDB
curl -X POST http://localhost:8000/library/check_batch \
  -H "Content-Type: application/json" \
  -d '["YOUR_PAPER_ID"]'
```

Returns `{"results": {"YOUR_PAPER_ID": true}}` if extracted.

### 4. List All Papers in ChromaDB

```bash
curl http://localhost:8000/library/debug/list_all
```

Shows all papers with chunk counts.

### 5. Try Semantic Search

If papers are extracted, you can search them:

```bash
curl -X POST http://localhost:8000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "your search query",
    "user_id": "test",
    "limit": 5
  }'
```

## What to Look For

### ✅ Successful Extraction Signs:
- Backend logs show "INGESTED PDF: X text chunks, Y image chunks"
- Status endpoint returns "completed"
- Papers appear in ChromaDB check
- Search returns results

### ❌ Extraction Not Working Signs:
- Status stays "pending" forever
- Status shows "failed"
- No logs about ingestion
- ChromaDB check returns false

## Troubleshooting

**If status stays "pending":**
- Check backend console for errors
- Verify PDF URL is accessible
- Check if background task is running

**If status shows "failed":**
- Check backend logs for error message
- Verify PDF URL is valid
- Check disk space (ChromaDB needs storage)

**If no logs appear:**
- Verify `/api/ingest` endpoint was called
- Check if background processing started
- Look for exception messages in console

## Testing Extraction

```bash
# Test with a known PDF
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "paper_id": "test-extraction",
    "pdf_url": "https://arxiv.org/pdf/2301.00001.pdf",
    "user_id": "test"
  }'

# Wait 10-30 seconds, then check:
curl http://localhost:8000/api/ingest/status/test-extraction
```

