# Architecture Diagrams: GitHub Integration

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                          │
│                    /library page displays results                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP requests
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                                │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │          routes_library.py                                  │   │
│  │  POST /library/add/{arxiv_id}                              │   │
│  │  - Accepts optional github_repos list                     │   │
│  │  - Orchestrates PDF + GitHub ingestion                    │   │
│  └──────┬──────────────────────────┬──────────────────────────┘   │
│         │                          │                               │
│         ▼                          ▼                               │
│  ┌──────────────┐          ┌──────────────────────┐               │
│  │ gemini_service.py        │ github_service.py    │               │
│  ├──────────────┤          ├──────────────────────┤               │
│  │ • PDF ingestion         │ • URL normalization  │               │
│  │ • Repo ingestion        │ • File fetching      │               │
│  │ • Embeddings            │ • Type inference     │               │
│  └──────┬──────────────────┴──────┬───────────────┘               │
│         │                         │                               │
│         └─────────────┬───────────┘                               │
│                       ▼                                           │
│  ┌────────────────────────────┐      ┌──────────────────┐        │
│  │ chroma_service.py          │      │ docling_service  │        │
│  │ - Upsert vectors           │      │ - PDF→Markdown   │        │
│  │ - Query documents          │      │ - Content extract│        │
│  └──────┬─────────────────────┘      └──────────────────┘        │
│         │                                                         │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          ▼
    ┌──────────────────┐
    │  Chroma DB       │
    │  (SQLite)        │
    │                  │
    │ [Document store] │
    │ [Embeddings]     │
    │ [Metadata]       │
    └──────────────────┘
```

## Request Flow: PDF + GitHub Ingestion

```
User Request:
POST /library/add/2301.12345
{
  "github_repos": [
    "https://github.com/owner/repo1",
    "https://github.com/owner/repo2"
  ]
}
         │
         ▼
╔════════════════════════════════════════════════════════════════╗
║  add_arxiv(arxiv_id, request)                                 ║
║  routes_library.py                                            ║
╚════════════════════════════════════════════════════════════════╝
         │
         ├─────────────────┬──────────────────┬──────────────┐
         │                 │                  │              │
         ▼                 ▼                  ▼              ▼
    ┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────┐
    │ Response    │ │ Log         │ │ Normalize│ │ Fetch    │
    │ object      │ │ tracking    │ │ URLs     │ │ arXiv    │
    │ init        │ │             │ │ via      │ │ metadata │
    │             │ │             │ │ GitHub   │ │          │
    └─────────────┘ └─────────────┘ │ Service  │ └────┬─────┘
                                     └──────────┘      │
                                                       ▼
                           ┌───────────────────────────────────────┐
                           │ Step 1: Ingest arXiv PDF              │
                           ├───────────────────────────────────────┤
                           │ 1. Download PDF from arxiv.org        │
                           │    https://arxiv.org/pdf/{id}.pdf     │
                           │ 2. Fetch metadata from arXiv API      │
                           │    (title, authors, summary)          │
                           │ 3. Extract markdown via Docling       │
                           │ 4. Generate embeddings via Gemini     │
                           │ 5. Upsert to Chroma                   │
                           │    ID: arxiv:{arxiv_id}               │
                           │    source: "docling"                  │
                           └────────────┬────────────────────────┘
                                        │ pdf_ingested = True
                                        ▼
                    ┌────────────────────────────────────────┐
                    │ Step 2: Loop over GitHub repos        │
                    └────────────┬─────────────────────────┘
                                 │
                    For each repo_url in request.github_repos:
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
    ┌────────────┐          ┌────────────┐          ┌────────────┐
    │ Repo 1     │          │ Repo 2     │          │ ...        │
    │            │          │            │          │            │
    │ normalize_ │          │ normalize_ │          │ normalize_ │
    │ github_url │          │ github_url │          │ github_url │
    │     │      │          │     │      │          │     │      │
    │     ▼      │          │     ▼      │          │     ▼      │
    │ GitHub    │          │ GitHub    │          │ GitHub    │
    │ Service:  │          │ Service:  │          │ Service:  │
    │ fetch_    │          │ fetch_    │          │ fetch_    │
    │ repo_     │          │ repo_     │          │ repo_     │
    │ files()   │          │ files()   │          │ files()   │
    │     │      │          │     │      │          │     │      │
    │     ▼      │          │     ▼      │          │     ▼      │
    │ [Repo     │          │ [Repo     │          │ [Repo     │
    │  Files]   │          │  Files]   │          │  Files]   │
    │     │      │          │     │      │          │     │      │
    │     ▼      │          │     ▼      │          │     ▼      │
    │ ingest_   │          │ ingest_   │          │ ingest_   │
    │ repo_     │          │ repo_     │          │ repo_     │
    │ files_    │          │ files_    │          │ files_    │
    │ into_     │          │ into_     │          │ into_     │
    │ chroma()  │          │ chroma()  │          │ chroma()  │
    │     │      │          │     │      │          │     │      │
    │     ▼      │          │     ▼      │          │     ▼      │
    │ Count: 6  │          │ Count: 4  │          │ Count: 0  │
    │ Status:OK │          │ Status:OK │          │ Status:ERR│
    │     │      │          │     │      │          │     │      │
    └─────┼──────┘          └─────┼──────┘          └─────┼──────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────────┐
                    │ Add all results to response  │
                    │ repos[] array                │
                    └──────────────────────┬───────┘
                                          │
                                          ▼
                    ┌──────────────────────────────┐
                    │ Return JSON response         │
                    │ - status: "ok"               │
                    │ - arxiv_id: "2301.12345"     │
                    │ - pdf_ingested: true         │
                    │ - repos: [...]               │
                    └──────────────────────────────┘
```

## Chroma Database Schema

```
┌──────────────────────────────────────────────────────────────────┐
│                    Chroma Collection                             │
│                   (documents)                                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌─────────────┐ ┌──────────┐ ┌──────────┐
        │ arXiv PDF   │ │ GitHub   │ │ GitHub   │
        │ Record      │ │ File 1   │ │ File 2   │
        │             │ │          │ │          │
        │ ID:         │ │ ID:      │ │ ID:      │
        │ arxiv:2301  │ │ 2301|git │ │ 2301|git │
        │ .12345      │ │ hub|..   │ │ hub|..   │
        │             │ │          │ │          │
        │ document:   │ │ document:│ │ document:│
        │ <full PDF   │ │ <README  │ │ <Python  │
        │  markdown>  │ │  content>│ │  code>   │
        │             │ │          │ │          │
        │ metadata:   │ │ metadata:│ │ metadata:│
        │  source:    │ │  source: │ │  source: │
        │  docling    │ │  github  │ │  github  │
        │  arxiv_id:  │ │  arxiv_id│ │  arxiv_id│
        │  2301.12345 │ │  :2301.. │ │  :2301.. │
        │  format:    │ │  repo_url│ │  repo_url│
        │  pdf        │ │  :https..│ │  :https..│
        │  length:    │ │  file_   │ │  file_   │
        │  45000      │ │  path:   │ │  path:   │
        │  title:     │ │  README. │ │  src/    │
        │  "Paper..   │ │  md      │ │  main.py │
        │  authors:   │ │  language│ │  language│
        │  [...]      │ │  :python │ │  :python │
        │  ...        │ │  kind:   │ │  kind:   │
        │             │ │  readme  │ │  code    │
        │             │ │  ...     │ │  ...     │
        │             │ │          │ │          │
        │ embedding:  │ │ embedding│ │ embedding│
        │ [768-dim    │ │ [768-dim │ │ [768-dim │
        │  vector]    │ │  vector] │ │  vector] │
        │             │ │          │ │          │
        └─────────────┘ └──────────┘ └──────────┘
```

## GitHub Service File Fetching

```
fetch_repo_files(repo_url)
         │
         ▼
normalize_github_url(url)
    https://github.com/owner/repo
         │
         ▼
extract_owner_repo(url)
    owner, repo = "owner", "repo"
         │
         ├─ Parallel Requests (Async):
         │
         ├──► get_default_branch(owner, repo)
         │    → API: /repos/owner/repo
         │    → returns: "main"
         │    │
         │    └──► fetch_file("README.md")
         │         → raw.githubusercontent.com/...
         │         → RepoFile {path, content, language, kind}
         │
         ├──► fetch_tree("docs", "*.md")
         │    → API: /repos/owner/repo/git/trees/main?recursive=1
         │    → Filter: startswith("docs/") AND endswith(".md")
         │    → Limit: 5 files
         │    │
         │    └──► For each file:
         │         fetch_file(path)
         │         → RepoFile objects
         │
         ├──► fetch_tree("src", "*.py")
         │    → API: /repos/owner/repo/git/trees/main?recursive=1
         │    → Filter: startswith("src/") AND endswith(".py")
         │    → Limit: 3 files
         │    │
         │    └──► For each file:
         │         fetch_file(path)
         │         → RepoFile objects
         │
         ├──► fetch_tree("examples", "*.py")
         │    → API: /repos/owner/repo/git/trees/main?recursive=1
         │    → Filter: startswith("examples/") AND endswith(".py")
         │    → Limit: 2 files
         │    │
         │    └──► For each file:
         │         fetch_file(path)
         │         → RepoFile objects
         │
         └──► fetch_tree("", "*.ipynb")
              → API: /repos/owner/repo/git/trees/main?recursive=1
              → Filter: endswith(".ipynb")
              → Limit: 2 files
              │
              └──► For each file:
                   fetch_file(path)
                   → RepoFile objects
                   
                   Aggregate all RepoFile objects
                              │
                              ▼
                      list[RepoFile]
```

## Embedding & Storage Flow

```
RepoFile objects (from GitHub)
    │
    ├─ Filter by size (max 50KB)
    │
    ├─ Extract content strings
    │
    ▼
texts: List[str]
    │
    ▼
GeminiEmbeddingService.embed_texts(texts)
    │
    ├─ Batch size: 100 items max
    │
    ├─ For each batch:
    │  ├─ API: models.embed_content()
    │  ├─ Config: task_type="retrieval_document"
    │  └─ Returns: [embedding.values for embedding in response.embeddings]
    │
    ▼
vectors: List[List[float]]
    │ (each vector has 768 dimensions)
    │
    ├─ For each (file, vector):
    │  │
    │  ├─ Build ID: "{arxiv_id}|github|{repo_url}|{file_path}"
    │  │
    │  ├─ Build metadata:
    │  │  ├─ arxiv_id
    │  │  ├─ source: "github"
    │  │  ├─ repo_url
    │  │  ├─ file_path
    │  │  ├─ language
    │  │  ├─ kind
    │  │  ├─ content_type: "github_{kind}"
    │  │  ├─ length
    │  │  └─ ...inherited fields...
    │  │
    │  └─ Collect:
    │     - ids[]
    │     - embeddings[]
    │     - documents[]
    │     - metadatas[]
    │
    ▼
ChromaService.upsert(
    ids=ids,
    embeddings=embeddings,
    documents=documents,
    metadatas=metadatas
)
    │
    ├─ Sanitize metadata (JSON-encode complex types)
    │
    ├─ Call: collection.upsert(...)
    │
    ▼
Data persisted in Chroma SQLite DB
```

## Error Handling Flow

```
ingest_repo_files_into_chroma(repo_url, arxiv_id, repo_files)
    │
    ├─ repo_files is empty?
    │  └─ return 0, log INFO
    │
    ├─ Filter by size (>50KB)?
    │  └─ Skipped files logged at DEBUG
    │
    ├─ All files oversized?
    │  └─ Log WARNING, return 0
    │
    ├─ embed_texts() fails?
    │  └─ Log ERROR, return 0
    │
    ├─ Embedding count mismatch?
    │  └─ Log ERROR, return 0
    │
    ├─ Upsert to Chroma fails?
    │  └─ Log ERROR, return count of files that were added
    │
    ▼
Return: int (count of files successfully ingested)
    │
    ├─ 0 = all failed
    │ 1-N = partial or full success
    │
    └─ Caller logs result and adds to response["repos"]
```

## Query Pattern Examples

```
Query: Get all records for a paper
chroma.collection.get(
    where={"arxiv_id": "2301.12345"},
    include=["metadatas", "documents"]
)
Result: All PDF + GitHub records mixed
    ├─ Can filter by source in app code
    │  ├─ source == "docling" → PDF
    │  └─ source == "github" → GitHub file
    │
    └─ Metadata includes file_path for GitHub records

Query: Get only GitHub README files
chroma.collection.get(
    where={
        "arxiv_id": "2301.12345",
        "source": "github",
        "kind": "readme"
    }
)
Result: Only README.md files from all repos for this paper

Query: Search by language
# Get all Python code files for a paper
chroma.collection.get(
    where={
        "arxiv_id": "2301.12345",
        "language": "python"
    }
)
Result: All .py files from both PDF and GitHub
    (Can then filter by source if needed)
```

---

**These diagrams show**:
1. System architecture and components
2. Complete request flow from user to database
3. Data schema and structure
4. File fetching process
5. Embedding and storage pipeline
6. Error handling strategies
7. Query patterns for retrieving data
