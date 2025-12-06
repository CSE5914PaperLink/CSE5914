# Complete File List for Lovable Migration

This document lists **every file** you need to provide to Lovable to migrate your PaperLink project from Google Cloud to Lovable, including the database connection setup.

## 📋 Migration Overview

Your project consists of:
- **Frontend**: Next.js 16 with TypeScript
- **Backend**: FastAPI (Python) 
- **Database**: Firebase Data Connect (GraphQL) with PostgreSQL
- **Vector DB**: ChromaDB (for embeddings)
- **Auth**: Firebase Authentication
- **AI**: Google Gemini API

---

## ✅ ESSENTIAL FILES (Must Include)

### 🎨 Frontend Files

#### Configuration Files
```
frontend/
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Lock file for exact versions
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
├── next-env.d.ts                  # Next.js type definitions
├── eslint.config.mjs              # ESLint configuration
├── postcss.config.mjs             # PostCSS configuration
└── empty-module.js                # Canvas module stub
```

#### Application Code
```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout with UserProvider
│   ├── page.tsx                    # Home page
│   ├── globals.css                 # Global styles
│   ├── favicon.ico                 # Site icon
│   ├── chat/
│   │   └── page.tsx               # Chat interface page
│   ├── compare/
│   │   └── page.tsx               # Paper comparison page
│   ├── discovery/
│   │   └── page.tsx               # Paper discovery page
│   ├── docs/
│   │   └── page.tsx               # Documentation page
│   ├── library/
│   │   └── page.tsx               # Library management page
│   ├── login/
│   │   └── page.tsx               # Login page
│   └── profile/
│       └── page.tsx               # User profile page
│   └── api/                       # Next.js API routes
│       ├── chat/
│       │   ├── route.ts           # Chat API endpoint
│       │   └── sessions/
│       │       ├── route.ts       # Chat sessions list
│       │       └── [id]/
│       │           └── route.ts  # Individual session
│       ├── compare/
│       │   └── route.ts           # Comparison API
│       ├── discovery/
│       │   ├── add/
│       │   │   └── route.ts       # Add paper from discovery
│       │   ├── save-search/
│       │   │   └── route.ts       # Save search
│       │   ├── search/
│       │   │   └── route.ts       # Search API
│       │   └── search-history/
│       │       └── route.ts      # Search history
│       └── library/
│           ├── add/
│           │   └── route.ts       # Add paper to library
│           ├── check-status/
│           │   └── route.ts      # Check ingestion status
│           ├── delete/
│           │   └── route.ts      # Delete paper
│           ├── favorite/
│           │   └── route.ts      # Toggle favorite
│           └── list/
│               └── route.ts       # List papers
```

#### Components
```
frontend/
├── components/
│   ├── LoginButton.tsx            # Authentication component
│   ├── Navbar.tsx                 # Navigation bar
│   └── chat/
│       ├── ChatHistory.tsx        # Chat history sidebar
│       ├── citations.ts           # Citation utilities
│       ├── InputForm.tsx          # Chat input form
│       ├── Messages.tsx           # Message display
│       ├── PdfViewer.tsx          # PDF viewer component
│       ├── Sidebar.tsx            # Chat sidebar
│       ├── sourceUtils.ts         # Source utilities
│       └── types.ts               # TypeScript types
```

#### Contexts & Utilities
```
frontend/
├── contexts/
│   └── UserContext.tsx            # User context provider
├── lib/
│   ├── backend.ts                 # Backend API client
│   ├── dataconnect.ts             # Data Connect utilities
│   └── firebase.ts                # Firebase initialization & auth
```

#### Firebase Data Connect Configuration
```
frontend/
├── dataconnect/
│   ├── dataconnect.yaml           # Data Connect service config
│   ├── schema/
│   │   └── schema.gql            # GraphQL schema (CRITICAL)
│   └── example/
│       ├── connector.yaml        # Connector configuration
│       ├── queries.gql           # GraphQL queries
│       └── mutations.gql        # GraphQL mutations
```

#### Generated Data Connect SDK (IMPORTANT)
```
frontend/
└── src/
    └── dataconnect-generated/    # Generated TypeScript SDK
        ├── index.cjs.js          # CommonJS entry
        ├── index.esm.js          # ESM entry
        ├── index.d.ts            # TypeScript definitions
        ├── package.json          # Package config
        ├── README.md             # SDK documentation
        └── react/                # React hooks (if enabled)
            ├── index.cjs.js
            ├── index.d.ts
            ├── package.json
            └── esm/
                ├── index.esm.js
                └── package.json
```

#### Public Assets
```
frontend/
└── public/
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── vercel.svg
    └── window.svg
```

---

### ⚙️ Backend Files

#### Configuration Files
```
backend/
├── pyproject.toml                 # Poetry project config
├── poetry.lock                    # Poetry lock file
├── requirements.txt              # Python dependencies
└── requirements-dev.txt         # Dev dependencies (optional)
```

#### Application Code
```
backend/
├── app/
│   ├── main.py                   # FastAPI app entry point
│   ├── docling_test.py           # Docling test script
│   ├── core/
│   │   └── config.py             # Configuration settings
│   ├── api/
│   │   ├── routes_arxiv.py       # ArXiv API routes
│   │   ├── routes_compare.py     # Comparison routes
│   │   ├── routes_docling.py     # Docling routes
│   │   ├── routes_gemini.py      # Gemini AI routes
│   │   ├── routes_health.py      # Health check
│   │   ├── routes_library.py     # Library management
│   │   └── routes_openalex.py    # OpenAlex routes
│   └── services/
│       ├── agent_service.py      # AI agent service
│       ├── chroma_service.py     # ChromaDB service
│       ├── comparison_service.py # Paper comparison
│       ├── docling_service.py    # PDF parsing service
│       ├── embedding_service.py  # Embedding generation
│       ├── gemini_service.py    # Gemini API service
│       ├── github_service.py     # GitHub integration
│       └── section_utils.py     # Section utilities
```

#### Backend Data Connect Configuration
```
backend/
├── dataconnect/
│   ├── dataconnect.yaml          # Backend Data Connect config
│   ├── schema/
│   │   └── schema.gql            # GraphQL schema (should match frontend)
│   └── example/
│       ├── connector.yaml        # Connector config
│       ├── queries.gql          # Queries (if used)
│       └── mutations.gql        # Mutations (if used)
└── src/
    └── dataconnect-generated/    # Generated Python SDK (if exists)
```

#### Tests (Optional but Recommended)
```
backend/
└── tests/
    ├── test_arxiv.py
    ├── test_docling_api.py
    ├── test_extract_images.py
    ├── test_gemini_rag.py
    ├── test_openalex.py
    └── test_smoke.py
```

---

## 🔑 ENVIRONMENT VARIABLES & SECRETS

Create `.env.example` files with placeholders:

### Frontend Environment Variables
```env
# frontend/.env.local.example
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_BACKEND_API_BASE=http://localhost:8000
```

### Backend Environment Variables
```env
# backend/.env.example
DEBUG=true
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CREDENTIALS_PATH=path/to/service-account.json
CHROMA_PERSIST_DIRECTORY=./chroma
```

---

## 📊 DATABASE MIGRATION NOTES

### Firebase Data Connect to Lovable Database

Your current setup uses:
- **Firebase Data Connect** (GraphQL) with PostgreSQL on Google Cloud SQL
- **Database**: `paper-477421-2-database`
- **Instance**: `paper-477421-instance`
- **Location**: `us-east4`

### What Lovable Needs:

1. **GraphQL Schema** (`frontend/dataconnect/schema/schema.gql`)
   - This defines your database structure
   - Lovable can use this to set up a compatible database

2. **Database Export** (if possible):
   - Export your PostgreSQL database data
   - Provide SQL dump or CSV exports of tables:
     - `User`
     - `Paper`
     - `ChatSession`
     - `Chat`
     - `ChatPaper`
     - `CodeLink`
     - `SearchHistory`

3. **Connection Details**:
   - Current database connection string
   - Database credentials (if migrating data)
   - Schema version/migrations

### Migration Strategy Options:

**Option A: Keep Firebase Data Connect**
- Keep using Firebase Data Connect
- Just migrate frontend/backend hosting to Lovable
- Provide Firebase credentials

**Option B: Migrate to Lovable Database**
- Export PostgreSQL data
- Recreate schema in Lovable's database
- Update connection strings in code
- Provide database export files

---

## 🗂️ ADDITIONAL FILES (Documentation - Optional but Helpful)

```
CSE5914/
├── README.md                      # Project overview
├── FIREBASE_DATACONNECT_ARCHITECTURE.md  # Database architecture docs
├── frontend/
│   ├── README.md                 # Frontend docs
│   └── QUICK_START.md           # Quick start guide
└── backend/
    ├── README.md                 # Backend docs
    └── QUICK_START.md           # Quick start guide
```

---

## 🚫 FILES TO EXCLUDE (Don't Include)

```
❌ node_modules/                  # Will be installed via npm install
❌ .next/                         # Build output
❌ backend/chroma/                # Vector DB data (too large, will regenerate)
❌ .git/                         # Git history
❌ *.log                         # Log files
❌ .env                          # Actual secrets (use .env.example)
❌ .env.local                    # Actual secrets
❌ dist/                         # Build artifacts
❌ __pycache__/                  # Python cache
❌ *.pyc                         # Python bytecode
❌ .venv/                        # Python virtual environment
❌ poetry.lock                   # Can regenerate (but include if you want exact versions)
```

---

## 📦 PACKAGE SUMMARY

### Frontend Dependencies (from package.json)
- Next.js 16.0.1
- React 19.2.0
- TypeScript
- Firebase 12.0.0
- @firebase/data-connect
- Tailwind CSS 4
- Framer Motion
- React PDF Viewer
- React Markdown

### Backend Dependencies (from pyproject.toml)
- FastAPI
- Uvicorn
- Firebase Admin SDK
- Docling (PDF parsing)
- ChromaDB (vector store)
- Google Gemini API
- LangChain libraries
- HTTPX

---

## 🔄 MIGRATION CHECKLIST

### Pre-Migration
- [ ] Export PostgreSQL database (if migrating away from Firebase Data Connect)
- [ ] Document all environment variables
- [ ] List all external API keys needed (Gemini, Firebase, etc.)
- [ ] Document ChromaDB data location (if migrating vector store)

### Files to Prepare
- [ ] All frontend source files
- [ ] All backend source files
- [ ] Configuration files (package.json, pyproject.toml, etc.)
- [ ] GraphQL schema files
- [ ] Generated SDK files (dataconnect-generated)
- [ ] Environment variable templates

### Database Migration
- [ ] Export current database schema
- [ ] Export current database data
- [ ] Document relationships and constraints
- [ ] Plan migration path (keep Firebase or migrate to Lovable DB)

### Post-Migration
- [ ] Update environment variables in Lovable
- [ ] Configure database connection
- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Test vector store functionality
- [ ] Verify AI/Gemini integration

---

## 📝 NOTES FOR LOVABLE TEAM

1. **Database**: The project uses Firebase Data Connect (GraphQL) with PostgreSQL. You'll need to either:
   - Keep Firebase Data Connect integration, OR
   - Migrate to Lovable's database system using the provided schema

2. **Vector Store**: ChromaDB is used for embeddings. Data is stored locally in `backend/chroma/`. You may need to:
   - Set up persistent storage for ChromaDB
   - Or migrate to Lovable's vector database solution

3. **Authentication**: Uses Firebase Auth. You'll need Firebase credentials configured.

4. **External APIs**: 
   - Google Gemini API (for AI chat)
   - ArXiv API (for paper discovery)
   - OpenAlex API (for paper metadata)

5. **Generated Files**: The `dataconnect-generated` folders contain auto-generated SDKs. These should be included but can be regenerated if needed.

6. **Build Process**: 
   - Frontend: `npm install && npm run build`
   - Backend: `poetry install` or `pip install -r requirements.txt`

---

## 🎯 QUICK FILE COUNT SUMMARY

- **Frontend Files**: ~50+ TypeScript/TSX files
- **Backend Files**: ~20+ Python files
- **Configuration Files**: ~15 files
- **Database Schema**: 1 GraphQL schema file (critical)
- **Generated SDKs**: ~10+ files (can regenerate)

**Total Essential Files**: ~100+ files

---

## 📧 WHAT TO PROVIDE TO LOVABLE

1. **Complete source code** (all files listed above)
2. **Database schema** (`schema.gql`)
3. **Database export** (if migrating data)
4. **Environment variable list** (with placeholders)
5. **API keys documentation** (what's needed, where to get them)
6. **Architecture documentation** (this file + FIREBASE_DATACONNECT_ARCHITECTURE.md)

---

**Last Updated**: Based on project structure as of migration request
**Project**: PaperLink (CSE5914)
**Current Hosting**: Google Cloud
**Target Hosting**: Lovable

