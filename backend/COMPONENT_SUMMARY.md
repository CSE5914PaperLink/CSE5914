# Backend Component Summary

## Component Overview

This document provides a detailed breakdown of each backend component, its purpose, dependencies, and hosting recommendations.

---

## 1. API Routes Layer

### 1.1 Health Check (`routes_health.py`)
- **Purpose**: Basic health check endpoint
- **Endpoints**: `GET /health`
- **Dependencies**: None
- **Complexity**: ⭐ (Very Simple)
- **Hosting**: Deploy with API Gateway
- **Resource Needs**: Minimal

---

### 1.2 arXiv Integration (`routes_arxiv.py`)
- **Purpose**: Search and download arXiv papers
- **Endpoints**: 
  - `GET /arxiv/search` - Search papers
  - `GET /arxiv/download/{doc_id}` - Download PDF
- **Dependencies**: 
  - `httpx` (HTTP client)
  - arXiv API (external)
- **Complexity**: ⭐⭐ (Simple)
- **Hosting**: Deploy with API Gateway
- **Resource Needs**: 
  - Network bandwidth for PDF downloads
  - Temporary storage for streaming responses
- **Considerations**: 
  - Rate limiting from arXiv
  - Large PDF file sizes (streaming response)

---

### 1.3 OpenAlex Integration (`routes_openalex.py`)
- **Purpose**: Academic paper search via OpenAlex API
- **Endpoints**: 
  - `GET /openalex/search` - Search works
  - `GET /openalex/works/{id}` - Get specific work
- **Dependencies**: 
  - `httpx` (HTTP client)
  - OpenAlex API (external)
- **Complexity**: ⭐⭐ (Simple)
- **Hosting**: Deploy with API Gateway
- **Resource Needs**: Minimal (API proxy)
- **Considerations**: 
  - OpenAlex rate limits
  - Filtering to arXiv-only papers

---

### 1.4 Gemini LLM (`routes_gemini.py`)
- **Purpose**: Chat and RAG (Retrieval-Augmented Generation) endpoints
- **Endpoints**: 
  - `POST /gemini/chat` - Simple chat
  - `POST /gemini/chat_agent` - RAG agent with streaming
- **Dependencies**: 
  - `GeminiService`
  - `ChromaService`
  - `EmbeddingService`
  - `AgentService`
- **Complexity**: ⭐⭐⭐⭐ (Complex)
- **Hosting**: Deploy with API Gateway, but consider separating AgentService
- **Resource Needs**: 
  - Memory: 2-4GB (for agent state)
  - Network: Streaming responses
- **Considerations**: 
  - Long-running requests (streaming)
  - State management (thread_id)
  - Rate limiting from Gemini API

---

### 1.5 Library Management (`routes_library.py`)
- **Purpose**: Manage document library (add, list, delete)
- **Endpoints**: 
  - `POST /library/add/{doc_id}` - Add arXiv paper
  - `GET /library/list` - List documents
  - `GET /library/chunks/{doc_id}` - Get document chunks
  - `DELETE /library/delete/{doc_id}` - Delete document
  - `POST /library/check_batch` - Batch check papers
- **Dependencies**: 
  - `ChromaService`
  - `EmbeddingService`
  - `DoclingService`
  - `GitHubService`
- **Complexity**: ⭐⭐⭐ (Moderate)
- **Hosting**: Deploy with API Gateway
- **Resource Needs**: 
  - CPU: High (for PDF processing)
  - Memory: 4-8GB (for Docling)
  - Storage: Persistent (for ChromaDB)
- **Considerations**: 
  - Long-running operations (PDF ingestion)
  - Consider async processing for large PDFs

---

### 1.6 Docling PDF Extraction (`routes_docling.py`)
- **Purpose**: Extract text and images from PDFs
- **Endpoints**: 
  - `POST /docling/extract` - Extract from uploaded file
  - `POST /docling/extract_url` - Extract from URL
- **Dependencies**: 
  - `DoclingService`
- **Complexity**: ⭐⭐⭐ (Moderate)
- **Hosting**: 
  - **Option A**: Same container (current)
  - **Option B**: Separate Cloud Run service
  - **Option C**: Cloud Run Jobs (async)
- **Resource Needs**: 
  - CPU: 2-4 cores (for OCR/processing)
  - Memory: 4-8GB (for large PDFs)
  - Storage: Temporary (1-5GB)
- **Considerations**: 
  - CPU-intensive operation
  - Long processing time for large PDFs
  - Consider async/background processing

---

### 1.7 Document Comparison (`routes_compare.py`)
- **Purpose**: Compare two documents using LLM
- **Endpoints**: 
  - `POST /compare` - Compare two documents
- **Dependencies**: 
  - `ChromaService`
  - `ComparisonService`
  - `GeminiService`
- **Complexity**: ⭐⭐⭐⭐ (Complex)
- **Hosting**: Deploy with API Gateway
- **Resource Needs**: 
  - Memory: 2-4GB
  - Network: Multiple LLM API calls
- **Considerations**: 
  - Long-running operation
  - Multiple LLM calls per request
  - Consider async processing for large comparisons

---

## 2. Service Layer

### 2.1 ChromaService (`chroma_service.py`)
- **Purpose**: Vector database for document embeddings
- **Key Features**:
  - Persistent storage
  - Similarity search
  - Document metadata storage
- **Dependencies**: 
  - ChromaDB library
  - Embedding function
- **Complexity**: ⭐⭐⭐ (Moderate)
- **Hosting Options**:
  1. **Embedded** (Current): Same container, persistent disk
  2. **Separate Service**: ChromaDB server container
  3. **Managed**: Pinecone, Weaviate, Qdrant
- **Resource Needs**: 
  - Storage: 10GB - 1TB (persistent)
  - Memory: 2-16GB (for query performance)
  - CPU: 1-4 cores
- **Considerations**: 
  - Data persistence critical
  - Backup strategy needed
  - Scaling limitations with embedded approach

---

### 2.2 GeminiService (`gemini_service.py`)
- **Purpose**: Wrapper for Google Gemini LLM API
- **Key Features**:
  - Content generation
  - Multimodal support (text + images)
  - Configurable parameters
- **Dependencies**: 
  - `google-genai` SDK
  - Gemini API key
- **Complexity**: ⭐⭐ (Simple)
- **Hosting**: Deploy with API Gateway (lightweight)
- **Resource Needs**: Minimal (API wrapper)
- **Considerations**: 
  - API rate limits
  - Cost per token
  - Network latency to Google servers

---

### 2.3 DoclingService (`docling_service.py`)
- **Purpose**: PDF extraction and processing
- **Key Features**:
  - Extract markdown from PDF
  - Extract images with bounding boxes
  - Chunk documents
- **Dependencies**: 
  - Docling library
  - Transformers (HuggingFace)
  - Temporary file storage
- **Complexity**: ⭐⭐⭐⭐ (Complex)
- **Hosting Options**:
  1. **Same Container** (Current): For low-medium volume
  2. **Separate Service**: For high volume
  3. **Cloud Run Jobs**: For async/batch processing
- **Resource Needs**: 
  - CPU: 2-4 cores
  - Memory: 4-8GB
  - Storage: Temporary (1-5GB)
- **Considerations**: 
  - CPU-intensive
  - Long processing time
  - Model loading overhead

---

### 2.4 EmbeddingService (`embedding_service.py`)
- **Purpose**: Generate embeddings for text and images
- **Key Features**:
  - Nomic embeddings (local inference)
  - Text and image embeddings
  - Multimodal support
- **Dependencies**: 
  - Nomic embeddings library
  - Transformers
  - Model weights (~500MB)
- **Complexity**: ⭐⭐⭐⭐ (Complex)
- **Hosting Options**:
  1. **Same Container** (Current): Model loaded per instance
  2. **Separate Service**: Pre-load model, handle requests
  3. **Managed API**: Use Vertex AI or OpenAI embeddings
- **Resource Needs**: 
  - CPU: 2-4 cores
  - Memory: 4-8GB (model + batch processing)
  - GPU: Optional (for faster inference)
- **Considerations**: 
  - Model loading time (cold starts)
  - Memory usage
  - Batch processing efficiency

---

### 2.5 AgentService (`agent_service.py`)
- **Purpose**: LangGraph RAG agent for document Q&A
- **Key Features**:
  - Document search tool
  - Conversational memory
  - Citation tracking
  - GitHub-aware mode
- **Dependencies**: 
  - LangGraph
  - Gemini LLM
  - ChromaService
  - EmbeddingService
- **Complexity**: ⭐⭐⭐⭐⭐ (Very Complex)
- **Hosting**: Deploy with API Gateway
- **Resource Needs**: 
  - Memory: 2-4GB (for agent state)
  - Network: Streaming responses
- **Considerations**: 
  - State management (currently in-memory)
  - For production: Use persistent checkpoint store
  - Long-running conversations

---

### 2.6 ComparisonService (`comparison_service.py`)
- **Purpose**: Compare two documents section-by-section
- **Key Features**:
  - Section extraction
  - LLM-based comparison
  - Image assignment to sections
  - Citation building
- **Dependencies**: 
  - ChromaService
  - GeminiService
- **Complexity**: ⭐⭐⭐⭐ (Complex)
- **Hosting**: Deploy with API Gateway
- **Resource Needs**: 
  - Memory: 2-4GB
  - Network: Multiple LLM API calls
- **Considerations**: 
  - Long-running operation
  - Multiple LLM calls
  - Consider async processing

---

### 2.7 GitHubService (`github_service.py`)
- **Purpose**: Fetch files from GitHub repositories
- **Key Features**:
  - Repository file fetching
  - README detection
  - File type inference
- **Dependencies**: 
  - GitHub API (optional token)
  - `httpx` (HTTP client)
- **Complexity**: ⭐⭐ (Simple)
- **Hosting**: Deploy with API Gateway (lightweight)
- **Resource Needs**: Minimal
- **Considerations**: 
  - GitHub API rate limits
  - Token authentication recommended
  - Consider caching repository metadata

---

## 3. Core Configuration

### 3.1 Settings (`core/config.py`)
- **Purpose**: Application configuration and environment variables
- **Key Settings**:
  - Gemini API key
  - GitHub API token
  - ChromaDB paths
  - Nomic API key
- **Complexity**: ⭐ (Very Simple)
- **Hosting**: Use Secret Manager for production
- **Considerations**: 
  - Never commit secrets
  - Use environment variables
  - Rotate keys regularly

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    API Routes Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Health  │ │  arXiv  │ │ OpenAlex │ │ Gemini   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ Library  │ │ Docling  │ │ Compare │                │
│  └──────────┘ └──────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ ChromaService│ │GeminiService │ │DoclingService│     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │EmbeddingSvc  │ │AgentService  │ │ComparisonSvc │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│  ┌──────────────┐                                        │
│  │GitHubService │                                        │
│  └──────────────┘                                        │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  External Services                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ ChromaDB │ │ Gemini   │ │  arXiv   │ │ GitHub   │   │
│  │ (Local)  │ │   API    │ │   API    │ │   API    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Hosting Decisions

| Component | Current | Recommended | Scale When |
|-----------|---------|-------------|------------|
| API Routes | Same container | Same container | Always |
| ChromaService | Embedded | Separate service | >10GB data |
| GeminiService | Same container | Same container | Always |
| DoclingService | Same container | Cloud Run Jobs | >100 PDFs/day |
| EmbeddingService | Same container | Separate service | >1000 req/min |
| AgentService | Same container | Same container | Always |
| ComparisonService | Same container | Async jobs | >10 comparisons/day |
| GitHubService | Same container | Same container | Always |

---

## Resource Requirements Summary

### Minimum (Development)
- CPU: 2 cores
- Memory: 4GB
- Storage: 20GB (persistent)
- Cost: ~$20-50/month

### Recommended (Production)
- CPU: 4-8 cores
- Memory: 8-16GB
- Storage: 100GB-1TB (persistent)
- Cost: ~$100-300/month

### Enterprise (High Scale)
- CPU: 16+ cores (distributed)
- Memory: 32GB+ (distributed)
- Storage: 1TB+ (managed DB)
- Cost: ~$500-2000/month

---

## Next Steps

1. **Review current architecture** against your scale requirements
2. **Identify bottlenecks** (likely: Docling, EmbeddingService)
3. **Plan extraction** of resource-intensive services
4. **Set up monitoring** to track performance
5. **Implement async processing** for long-running tasks

