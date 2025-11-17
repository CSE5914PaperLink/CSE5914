# Multimodal RAG with Image Embeddings and Bounding Boxes

## Overview

This implementation extends the RAG (Retrieval-Augmented Generation) system to support **multimodal retrieval** of both text chunks and images from PDF documents. Images are embedded using Nomic's vision model and stored in the vector database alongside their bounding box coordinates.

## Key Features

1. **Multimodal Embeddings**: Uses `nomic-embed-vision-v1.5` to embed images alongside `nomic-embed-text-v1.5` for text
2. **Bounding Box Preservation**: Stores PDF coordinate bounding boxes for each extracted image
3. **Semantic Image Search**: Images are independently embedded and retrieved based on semantic similarity to queries
4. **Unified Retrieval**: Both text and image chunks are retrieved together in a single query

## Architecture

### 1. Embedding Service (`app/services/embedding_service.py`)

The `NomicEmbeddingService` class now supports:

```python
# Text embedding (existing)
embed_texts(texts: List[str]) -> List[List[float]]
embed_query(text: str) -> List[float]

# Image embedding (new)
embed_images(images: List[Union[Image.Image, bytes, str]]) -> List[List[float]]
```

Images can be provided as:

- PIL `Image` objects
- Raw `bytes`
- Base64-encoded strings

### 2. Document Extraction (`app/services/docling_service.py`)

The `ImageAsset` dataclass now includes bounding box information:

```python
@dataclass
class ImageAsset:
    filename: str
    data_base64: str
    media_type: Optional[str]
    page: Optional[int]
    bbox: Optional[dict]  # {"l": left, "r": right, "t": top, "b": bottom}
```

Bounding boxes are in **PDF coordinate space** where:

- Origin (0,0) is at bottom-left
- `l` (left), `r` (right): horizontal position in points
- `b` (bottom), `t` (top): vertical position in points from bottom

### 3. Ingestion (`ingest_pdf_bytes_into_chroma`)

The ingestion pipeline now:

1. **Extracts text** → chunks → embeds with text model
2. **Extracts images** with bounding boxes → embeds with vision model
3. **Stores both** in Chroma with metadata:

**Text chunk metadata:**

```python
{
    "doc_id": "arxiv:2408.09869v5",
    "chunk_type": "text",
    "chunk_index": 0,
    "preview": "First 200 chars...",
    ...
}
```

**Image chunk metadata:**

```python
{
    "doc_id": "arxiv:2408.09869v5",
    "chunk_type": "image",
    "image_index": 0,
    "filename": "image_0.png",
    "page": 3,
    "media_type": "image/png",
    "image_data": "base64...",  # Full base64 image data
    "bbox": {"l": 72.0, "r": 540.0, "t": 720.0, "b": 120.0},
    "bbox_left": 72.0,
    "bbox_right": 540.0,
    "bbox_top": 720.0,
    "bbox_bottom": 120.0,
}
```

### 4. Retrieval (`/gemini/chat_rag` endpoint)

The RAG endpoint now:

1. Embeds the user query with text model
2. Performs similarity search in Chroma (returns top-k from both text and images)
3. Separates results into text chunks and image chunks
4. Builds context with both types:

```
[CHUNK id=... doc_id=... idx=0]
This is the text content...
---
[IMAGE id=... doc_id=... page=3 image_0.png bbox=[l:72.0, r:540.0, t:720.0, b:120.0]]
Description: Image: image_0.png from page 3 (bbox: ...)
---
```

5. Returns structured response:

```json
{
    "model": "gemini-2.0-flash",
    "content": "LLM response...",
    "chunks": [...],  // Text chunks only
    "images": [       // Image chunks with bbox
        {
            "id": "arxiv:xxx::image::0",
            "doc_id": "arxiv:xxx",
            "type": "image",
            "filename": "image_0.png",
            "page": 3,
            "bbox": {"l": 72.0, "r": 540.0, "t": 720.0, "b": 120.0},
            "url": "/library/images/arxiv:xxx/image_0.png",
            "distance": 0.234
        }
    ]
}
```

## Usage Example

### Ingesting a PDF

```python
from app.services.embedding_service import ingest_pdf_bytes_into_chroma

with open("paper.pdf", "rb") as f:
    pdf_bytes = f.read()

stats = ingest_pdf_bytes_into_chroma(
    pdf_bytes=pdf_bytes,
    doc_id="arxiv:2408.09869v5",
    extra_metadata={"title": "Paper Title"}
)
# Returns: {"text_chunks": 48, "image_chunks": 5}
```

### Querying with RAG

```bash
curl -X POST http://localhost:8000/gemini/chat_rag \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Tell me about the architecture diagram",
    "doc_ids": ["arxiv:2408.09869v5"],
    "top_k": 10
  }'
```

The response will include:

- `chunks`: Relevant text passages
- `images`: Relevant image chunks with bounding boxes
- `content`: LLM response informed by both text and images

## Bounding Box Coordinate System

Images are extracted with precise bounding boxes in PDF coordinate space:

```
PDF Coordinate System (Docling):

  (0, page_height) ← top-left
        ↓
  t (top edge, from bottom)
  ┌─────────────┐
  │   Image     │
  └─────────────┘
  b (bottom edge, from bottom)
        ↑
  (0, 0) ← bottom-left

  l (left)  →  r (right)
```

This allows:

- **Precise image localization** on the PDF page
- **Overlaying annotations** or highlights in a PDF viewer
- **Re-extracting images** at higher resolution if needed

## Testing

Run the test suite:

```bash
cd backend
python test_multimodal_rag.py
```

Tests verify:

1. ✓ Image embedding with Nomic vision model
2. ✓ Bounding box storage and retrieval
3. ✓ Multimodal retrieval (text + images together)

## Benefits

1. **Semantic Image Search**: Find relevant figures/charts based on query meaning, not just text mentions
2. **Richer Context**: LLM receives both textual and visual information
3. **Precise Localization**: Bounding boxes enable linking back to exact locations in source PDFs
4. **Unified Vector Space**: Text and images are embedded in compatible semantic spaces (Nomic models)

## Technical Notes

- **Embedding Dimension**: Both text and vision models use 768-dimensional embeddings
- **Storage**: Chroma collections are disambiguated by embedding dimension (`documents_d768`)
- **Metadata Serialization**: Complex objects (dicts) are JSON-serialized by `ChromaService.sanitize()`
- **Image Cropping**: Uses `pypdfium2` to render PDF pages and crop images at 2x scale for clarity
