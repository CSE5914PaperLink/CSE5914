# How to Check if Paper Extraction is Working

## Quick Answer

The `[ChromaService]` message only means ChromaDB started. It doesn't mean papers are being extracted.

## How to Verify Extraction

### 1. Check Backend Console Logs

When extraction happens, you'll see:

```
INGESTED PDF: 150 text chunks, 10 image chunks
```

**If you see this:** ✅ Extraction is working!  
**If you don't see this:** ❌ Extraction might not be happening

### 2. Check Ingestion Status

```bash
curl http://localhost:8000/api/ingest/status/YOUR_PAPER_ID
```

**Expected responses:**
- `{"status": "pending", "progress": 0}` - Not started yet
- `{"status": "processing", "progress": 50}` - Currently extracting
- `{"status": "completed", "progress": 100}` - ✅ Successfully extracted!

### 3. Check if Paper is in ChromaDB

```bash
curl -X POST http://localhost:8000/library/check_batch \
  -H "Content-Type: application/json" \
  -d '["YOUR_PAPER_ID"]'
```

Returns: `{"results": {"YOUR_PAPER_ID": true}}` if extracted.

### 4. List All Papers in ChromaDB

```bash
curl http://localhost:8000/library/debug/list_all
```

Shows all papers with their chunk counts.

### 5. Try Semantic Search

```bash
curl -X POST http://localhost:8000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "user_id": "test", "limit": 5}'
```

If extraction worked, this should return results.

## What to Check

### ✅ Extraction Working:
- Status = "completed"
- ChromaDB check returns `true`
- Search returns results
- Backend logs show "INGESTED PDF"

### ❌ Extraction Not Working:
- Status stays "pending" forever
- Status = "failed"
- ChromaDB check returns `false`
- No "INGESTED PDF" log message

## Quick Test

```bash
# 1. Ingest a test paper
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "paper_id": "test123",
    "pdf_url": "https://arxiv.org/pdf/2301.00001.pdf",
    "user_id": "test"
  }'

# 2. Wait 10-30 seconds, then check status
curl http://localhost:8000/api/ingest/status/test123

# 3. Check if in ChromaDB
curl -X POST http://localhost:8000/library/check_batch \
  -H "Content-Type: application/json" \
  -d '["test123"]'
```

## Common Issues

**No logs appearing?**
- Check if `/api/ingest` endpoint was called
- Look for errors in backend console
- Verify PDF URL is accessible

**Status stuck on "pending"?**
- Check backend logs for errors
- PDF might be too large or URL unreachable
- Background task might have failed silently

**Status shows "failed"?**
- Check backend console for error message
- Verify PDF URL is valid
- Check disk space for ChromaDB storage

