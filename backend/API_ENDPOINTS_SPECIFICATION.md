# New API Endpoints Specification

## Overview

New standardized API endpoints have been created to match your exact specification. These endpoints are available at `/api/*` and work alongside existing endpoints.

## Endpoints

### 1. POST /api/ingest
**PDF Ingestion using Docling**

**Request Body:**
```json
{
  "paper_id": "string",
  "pdf_url": "string (URL)",
  "user_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "doc_id": "string",
  "text_chunks": ["string", ...],
  "images": ["string (base64)", ...] // optional
}
```

**Notes:**
- Processing happens asynchronously in the background
- Initial response returns `success: true` and `doc_id`, with empty `text_chunks`
- Use `/api/ingest/status/{paper_id}` to check processing status
- Once completed, text_chunks and images are available

---

### 2. POST /api/search/semantic
**Semantic Search using ChromaDB**

**Request Body:**
```json
{
  "query": "string",
  "user_id": "string",
  "limit": 10 // optional, 1-100
}
```

**Response:**
```json
{
  "results": [
    {
      "doc_id": "string",
      "chunk_text": "string",
      "score": 0.95,
      "metadata": {}
    },
    ...
  ]
}
```

---

### 3. GET /api/ingest/status/{paper_id}
**Check Ingestion Status**

**Response:**
```json
{
  "status": "pending" | "processing" | "completed" | "failed",
  "progress": 50 // 0-100, optional
}
```

**Status Values:**
- `pending`: Queued for processing
- `processing`: Currently being processed
- `completed`: Successfully processed
- `failed`: Processing failed

---

### 4. POST /api/context
**Paper Context for RAG**

**Request Body:**
```json
{
  "query": "string",
  "paper_ids": ["string", ...]
}
```

**Response:**
```json
{
  "context_chunks": [
    {
      "text": "string",
      "source": "Paper Title (paper_id)",
      "relevance": 0.95
    },
    ...
  ]
}
```

---

### 5. DELETE /api/embeddings/{paper_id}
**Delete Paper Embeddings**

**Response:**
```json
{
  "success": true
}
```

---

## Usage Examples

### Ingest a PDF
```bash
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "paper_id": "12345",
    "pdf_url": "https://arxiv.org/pdf/1234.5678.pdf",
    "user_id": "user123"
  }'
```

### Check Ingestion Status
```bash
curl http://localhost:8000/api/ingest/status/12345
```

### Semantic Search
```bash
curl -X POST http://localhost:8000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning",
    "user_id": "user123",
    "limit": 10
  }'
```

### Get Context
```bash
curl -X POST http://localhost:8000/api/context \
  -H "Content-Type: application/json" \
  -d '{
    "query": "neural networks",
    "paper_ids": ["12345", "67890"]
  }'
```

### Delete Embeddings
```bash
curl -X DELETE http://localhost:8000/api/embeddings/12345
```

---

## Implementation Details

### Status Tracking
- Status is tracked in-memory (survives within a single backend instance)
- For production, consider using Redis or a database for persistence
- Status is automatically cleaned up after deletion

### Background Processing
- PDF ingestion happens asynchronously using FastAPI BackgroundTasks
- This allows the API to respond immediately while processing continues
- Progress is tracked and available via the status endpoint

### Error Handling
- All endpoints return appropriate HTTP status codes
- Errors include descriptive messages
- Failed ingestions are marked with `status: "failed"` and error details

---

## Testing

After starting your backend:

1. **Test ingestion:**
   ```bash
   curl -X POST http://localhost:8000/api/ingest \
     -H "Content-Type: application/json" \
     -d '{"paper_id": "test123", "pdf_url": "https://arxiv.org/pdf/2301.00001.pdf", "user_id": "test"}'
   ```

2. **Check status:**
   ```bash
   curl http://localhost:8000/api/ingest/status/test123
   ```

3. **Test search (after ingestion completes):**
   ```bash
   curl -X POST http://localhost:8000/api/search/semantic \
     -H "Content-Type: application/json" \
     -d '{"query": "test query", "user_id": "test", "limit": 5}'
   ```

---

## Notes

- All endpoints are available at `/api/*` prefix
- Existing endpoints at `/library/*`, `/gemini/*`, etc. continue to work
- The new endpoints use the same underlying services (Docling, ChromaDB, etc.)
- CORS is configured to allow your frontend domain

---

## Future Enhancements

Consider implementing:
1. Persistent status storage (Redis/database)
2. Webhook notifications on completion
3. Batch ingestion support
4. User-specific filtering in search
5. Rate limiting per user_id

