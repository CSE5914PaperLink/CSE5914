# How to Verify Paper Extraction

This guide helps you check if papers are being successfully extracted and stored.

## 1. Check Backend Logs

When a paper is being ingested, you should see logs like:

```
[INGESTION] Starting ingestion for paper_id: <paper_id>
[INGESTION] Fetching PDF from: <pdf_url>
[INGESTION] PDF downloaded, size: <size> bytes
[INGESTION] Starting Docling extraction...
[INGESTION] Extracted <N> text chunks, <M> images
[INGESTION] Storing <N> chunks into ChromaDB...
[INGESTION] Successfully stored in ChromaDB: <N> text chunks, <M> images
[INGESTION] ✅ Completed ingestion for paper_id: <paper_id>
```

**If you see errors**, look for lines starting with:
- `[INGESTION] ❌ Failed for <paper_id>: <error>`
- `ERROR` or `Exception` messages

## 2. Check Ingestion Status Endpoint

### Check status of a specific paper:
```bash
GET /api/ingest/status/{paper_id}
```

Response examples:
- **Pending/Not started**: `{"status": "pending", "progress": 0}`
- **Processing**: `{"status": "processing", "progress": 50}`
- **Completed**: `{"status": "completed", "progress": 100, "text_chunks_count": 150, "image_chunks_count": 10}`
- **Failed**: `{"status": "failed", "progress": 0, "error": "error message"}`

### Check all tracked papers:
```bash
GET /api/ingest/debug/all
```

This returns all papers currently being tracked, including their status, progress, and metadata.

## 3. Verify in ChromaDB

### Check if a paper exists in ChromaDB:
```bash
GET /api/ingest/debug/chromadb-check/{paper_id}
```

Response:
```json
{
  "paper_id": "198cbb2f-d2c4-4338-8464-399edf5997cc",
  "exists_in_chromadb": true,
  "chunk_count": 150,
  "sample_metadata": [...]
}
```

## 4. Test Semantic Search

If a paper was successfully extracted, you should be able to search it:

```bash
POST /api/search/semantic
Body: {
  "query": "test query about the paper",
  "user_id": "your_user_id",
  "limit": 5
}
```

If the paper appears in search results, extraction was successful.

## 5. Common Issues

### Issue: Status shows "pending" forever
- **Check**: Backend logs for errors
- **Check**: PDF URL is accessible (try downloading it manually)
- **Check**: Background task is actually running (look for `[INGESTION]` logs)

### Issue: Status shows "failed"
- **Check**: Error message in status response
- **Check**: Backend logs for detailed error
- **Common causes**:
  - PDF URL is invalid or inaccessible
  - PDF file is corrupted
  - Docling service error
  - ChromaDB connection issue

### Issue: Status shows "completed" but no chunks in search
- **Check**: Use `/api/ingest/debug/chromadb-check/{paper_id}` to verify chunks exist
- **Check**: Try searching with different queries
- **Possible issue**: Embeddings may not have been created properly

## 6. Quick Verification Checklist

- [ ] Paper ingestion request returns `200 OK` with `{"success": true, ...}`
- [ ] Status endpoint shows progress increasing: `10% → 30% → 50% → 90% → 100%`
- [ ] Status eventually becomes `"completed"` (not stuck at "processing")
- [ ] Backend logs show extraction completed without errors
- [ ] ChromaDB check shows `exists_in_chromadb: true` with chunk_count > 0
- [ ] Semantic search returns results for the paper

## 7. Example Test Flow

1. **Ingest a paper**:
   ```bash
   POST /api/ingest
   {
     "paper_id": "test-paper-123",
     "pdf_url": "https://arxiv.org/pdf/2301.00001.pdf",
     "user_id": "test-user"
   }
   ```

2. **Check status immediately**:
   ```bash
   GET /api/ingest/status/test-paper-123
   ```
   Should return `"processing"` with progress

3. **Wait 10-30 seconds, then check again**:
   ```bash
   GET /api/ingest/status/test-paper-123
   ```
   Should return `"completed"` with progress 100

4. **Verify in ChromaDB**:
   ```bash
   GET /api/ingest/debug/chromadb-check/test-paper-123
   ```
   Should show chunks exist

5. **Test search**:
   ```bash
   POST /api/search/semantic
   {
     "query": "introduction",
     "user_id": "test-user",
     "limit": 5
   }
   ```
   Should return results from the paper
