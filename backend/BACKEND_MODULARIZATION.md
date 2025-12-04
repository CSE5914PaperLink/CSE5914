# Backend Modularization Guide

## Overview

This document outlines the modular architecture of the backend and provides hosting recommendations for each component.

## Current Architecture

The backend is a FastAPI application with the following structure:

```
backend/
├── app/
│   ├── api/              # API route handlers
│   ├── core/             # Core configuration
│   ├── services/         # Business logic services
│   └── main.py           # FastAPI app entry point
├── apphosting.yaml       # Firebase App Hosting config
└── requirements.txt      # Dependencies
```

---

## Component Breakdown

### 1. **API Gateway Layer** (`app/api/`)

#### Components:
- **`routes_health.py`** - Health check endpoint
- **`routes_arxiv.py`** - arXiv paper search and PDF download
- **`routes_openalex.py`** - OpenAlex academic search API
- **`routes_gemini.py`** - Gemini LLM chat and RAG agent endpoints
- **`routes_library.py`** - Document library management (add/list/delete)
- **`routes_docling.py`** - PDF extraction and processing
- **`routes_compare.py`** - Document comparison service

#### Responsibilities:
- HTTP request/response handling
- Input validation
- Route registration
- Error handling

#### Hosting Recommendation:
- **Primary**: Firebase App Hosting (Cloud Run) - Current setup
- **Alternative**: 
  - Google Cloud Run (direct deployment)
  - AWS Lambda + API Gateway (for serverless)
  - Azure Container Apps
  - Kubernetes (for high-scale deployments)

---

### 2. **Service Layer** (`app/services/`)

#### 2.1 **ChromaService** (`chroma_service.py`)
**Purpose**: Vector database management for document embeddings

**Dependencies**:
- ChromaDB (local/persistent storage)
- Embedding functions

**Hosting Recommendations**:
- **Option A - Embedded (Current)**: 
  - Deploy with API service
  - Use persistent volume (Cloud Storage, EBS, etc.)
  - Best for: Small to medium datasets (<10GB)
  - Storage: Mount persistent disk or use Cloud Storage FUSE

- **Option B - Separate Service**:
  - ChromaDB Server (Docker container)
  - Host on: Cloud Run, ECS, or Kubernetes
  - Best for: Larger datasets, multiple API instances

- **Option C - Managed Vector DB**:
  - Pinecone, Weaviate Cloud, Qdrant Cloud
  - Best for: Production scale, managed infrastructure

**Storage Requirements**:
- Persistent disk: 10GB - 1TB (depending on document count)
- Memory: 2GB - 16GB (for query performance)

---

#### 2.2 **GeminiService** (`gemini_service.py`)
**Purpose**: Google Gemini LLM API wrapper

**Dependencies**:
- Google Gemini API key
- `google-genai` SDK

**Hosting Recommendations**:
- **No separate hosting needed** - API wrapper only
- Deploy with API Gateway service
- Ensure API key is in environment variables/secrets

**Considerations**:
- Rate limiting: Monitor API quotas
- Cost: Pay-per-use model
- Latency: API calls to Google's servers

---

#### 2.3 **DoclingService** (`docling_service.py`)
**Purpose**: PDF document extraction and processing

**Dependencies**:
- Docling library
- Transformers (HuggingFace tokenizer)
- Temporary file storage

**Hosting Recommendations**:
- **Option A - Same Container (Current)**:
  - Deploy with API service
  - Use `/tmp` for temporary files
  - Best for: Low to medium volume

- **Option B - Separate Worker Service**:
  - Cloud Run Jobs or Cloud Tasks
  - Process PDFs asynchronously
  - Best for: High volume, long-running tasks
  - Queue: Cloud Tasks, SQS, or Redis Queue

**Resource Requirements**:
- CPU: 2-4 cores (for OCR/processing)
- Memory: 4GB - 8GB (for large PDFs)
- Storage: Ephemeral `/tmp` (1-5GB)

---

#### 2.4 **EmbeddingService** (`embedding_service.py`)
**Purpose**: Nomic embedding model for text and images

**Dependencies**:
- Nomic embeddings (local inference)
- Transformers library
- Model weights (~500MB)

**Hosting Recommendations**:
- **Option A - Local Inference (Current)**:
  - Deploy with API service
  - Model loaded in memory
  - Best for: Low latency, moderate throughput

- **Option B - Separate Embedding Service**:
  - Dedicated Cloud Run service
  - Model pre-loaded, handles embedding requests
  - Best for: High throughput, multiple API instances

- **Option C - Managed Embedding API**:
  - Google Vertex AI Embeddings
  - OpenAI Embeddings API
  - Best for: Scale, no model management

**Resource Requirements**:
- CPU: 2-4 cores
- Memory: 4GB - 8GB (for model + batch processing)
- GPU: Optional (for faster inference)

---

#### 2.5 **AgentService** (`agent_service.py`)
**Purpose**: LangGraph RAG agent with document search

**Dependencies**:
- LangGraph
- Gemini LLM
- ChromaService
- EmbeddingService

**Hosting Recommendations**:
- **Deploy with API Gateway** (Current)
- State management: In-memory (MemorySaver) - not persistent
- **For Production**: Use persistent checkpoint store:
  - PostgreSQL (via LangGraph checkpointer)
  - Redis (for session state)
  - Firestore (for conversation history)

**Considerations**:
- Session state: Currently ephemeral
- For multi-instance: Use shared state store

---

#### 2.6 **ComparisonService** (`comparison_service.py`)
**Purpose**: Compare two documents using LLM

**Dependencies**:
- GeminiService
- ChromaService

**Hosting Recommendations**:
- **Deploy with API Gateway** (Current)
- **For Long Comparisons**: Consider async processing:
  - Cloud Run Jobs
  - Cloud Tasks
  - Return job ID, poll for results

---

#### 2.7 **GitHubService** (`github_service.py`)
**Purpose**: Fetch files from GitHub repositories

**Dependencies**:
- GitHub API (optional token)
- HTTP client

**Hosting Recommendations**:
- **Deploy with API Gateway** (Current)
- **Rate Limiting**: 
  - With token: 5,000 requests/hour
  - Without token: 60 requests/hour
- Consider caching repository metadata

---

### 3. **Core Configuration** (`app/core/`)

#### Components:
- **`config.py`** - Settings and environment variables

**Hosting Recommendations**:
- Use environment variables or secrets manager:
  - Google Secret Manager
  - AWS Secrets Manager
  - Azure Key Vault
- Never commit secrets to code

---

## Recommended Modular Architecture

### Architecture Option 1: Monolithic (Current)
```
┌─────────────────────────────────────┐
│     FastAPI Application              │
│  ┌───────────────────────────────┐   │
│  │  API Routes                  │   │
│  └───────────────────────────────┘   │
│  ┌───────────────────────────────┐   │
│  │  Services (All in-process)    │   │
│  └───────────────────────────────┘   │
│  ┌───────────────────────────────┐   │
│  │  ChromaDB (Local)             │   │
│  └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Pros**: Simple, low latency, easy deployment
**Cons**: Limited scalability, resource contention

---

### Architecture Option 2: Microservices (Recommended for Scale)
```
┌─────────────────┐
│  API Gateway    │  ← FastAPI routes
│  (Cloud Run)    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼───┐ ┌───▼───┐ ┌───▼───┐
│Chroma │ │Embed │ │Docling│ │Agent  │
│Service│ │Service│ │Worker │ │Service│
└───────┘ └──────┘ └───────┘ └───────┘
```

**Pros**: Scalable, independent scaling, fault isolation
**Cons**: More complex, network latency, service discovery

---

### Architecture Option 3: Hybrid (Recommended for Production)
```
┌─────────────────────────────────────┐
│  API Gateway (FastAPI)              │
│  - Health, Search, Library routes   │
└────────┬────────────────────────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
┌───▼───┐ ┌──▼──────┐ ┌──────▼──────┐
│Chroma │ │Embed   │ │Async Workers │
│DB     │ │Service │ │(Docling)    │
└───────┘ └─────────┘ └─────────────┘
```

**Components**:
- **API Gateway**: Lightweight routes (search, library management)
- **Embedding Service**: Separate service for embeddings
- **ChromaDB**: Separate service or managed DB
- **Async Workers**: Cloud Run Jobs for PDF processing

---

## Hosting Strategy by Component

### Tier 1: Always-On Services (Deploy Together)
- **API Gateway** (routes_health, routes_arxiv, routes_openalex, routes_library, routes_compare)
- **GeminiService** (lightweight wrapper)
- **GitHubService** (lightweight wrapper)

**Hosting**: Firebase App Hosting / Cloud Run
**Scaling**: 0-10 instances, auto-scaling
**Cost**: Pay-per-request

---

### Tier 2: Resource-Intensive Services (Consider Separation)
- **DoclingService** (CPU/memory intensive)
- **EmbeddingService** (model loading, memory intensive)
- **AgentService** (stateful, memory intensive)

**Hosting Options**:
1. **Same container**: If traffic is low-medium
2. **Separate Cloud Run services**: For independent scaling
3. **Cloud Run Jobs**: For async/batch processing (Docling)

---

### Tier 3: Data Layer (Persistent Storage)
- **ChromaDB** (vector database)

**Hosting Options**:
1. **Embedded with API** (current): Use persistent disk
2. **ChromaDB Server**: Separate container/service
3. **Managed Vector DB**: Pinecone, Weaviate, Qdrant

**Storage**:
- Persistent disk: 10GB - 1TB
- Backup: Regular snapshots to Cloud Storage

---

## Deployment Recommendations

### Development / Small Scale (<1000 users)
- **Single Cloud Run service** with all components
- Persistent disk for ChromaDB
- Environment variables for secrets

### Production / Medium Scale (1000-10,000 users)
- **API Gateway**: Separate Cloud Run service
- **Embedding Service**: Separate Cloud Run service (pre-load model)
- **ChromaDB**: Separate service or managed DB
- **Docling**: Cloud Run Jobs (async processing)
- **Secrets**: Google Secret Manager

### Enterprise Scale (10,000+ users)
- **API Gateway**: Multiple regions, load balanced
- **Embedding Service**: Dedicated instances, GPU optional
- **ChromaDB**: Managed service (Pinecone/Weaviate) or Kubernetes cluster
- **Docling**: Kubernetes Jobs or dedicated worker pool
- **Monitoring**: Cloud Monitoring, distributed tracing
- **Caching**: Redis for frequently accessed data

---

## Cost Optimization

1. **ChromaDB**: Use persistent disk, not managed service (unless scale requires it)
2. **Embedding Service**: Pre-load model, keep warm instances
3. **Docling**: Use Cloud Run Jobs (pay per job, not always-on)
4. **API Gateway**: Use min instances = 0 (scale to zero)
5. **Gemini API**: Monitor usage, implement caching for common queries

---

## Security Considerations

1. **Secrets**: Use Secret Manager, never in code
2. **API Keys**: Rotate regularly
3. **Network**: Use VPC for internal service communication
4. **Authentication**: Add API key or OAuth for production
5. **Rate Limiting**: Implement per-user/IP limits

---

## Monitoring & Observability

1. **Logging**: Cloud Logging (structured logs)
2. **Metrics**: Cloud Monitoring (latency, error rates)
3. **Tracing**: Cloud Trace (distributed tracing)
4. **Alerts**: Set up for error rates, latency spikes

---

## Migration Path

### Phase 1: Current (Monolithic)
- All services in one container
- ChromaDB embedded with persistent disk

### Phase 2: Extract Embedding Service
- Move EmbeddingService to separate Cloud Run service
- Pre-load model, reduce cold starts

### Phase 3: Extract ChromaDB
- Deploy ChromaDB as separate service
- Or migrate to managed vector DB

### Phase 4: Async Processing
- Move Docling to Cloud Run Jobs
- Use Cloud Tasks for job queue

---

## Next Steps

1. **Immediate**: Review current hosting configuration
2. **Short-term**: Extract EmbeddingService if experiencing cold starts
3. **Medium-term**: Consider ChromaDB separation if dataset grows
4. **Long-term**: Evaluate managed vector DB for scale

