# Firebase & Data Connect Architecture

This document explains how Firebase and Firebase Data Connect are routed and used in your PaperLink application.

## Overview

Your application uses **Firebase** for authentication and **Firebase Data Connect** (GraphQL) for structured data storage. The architecture follows this pattern:

```
Frontend (Next.js) 
  ├─ Firebase Auth (Authentication)
  ├─ Firebase Data Connect (GraphQL Database)
  └─ Backend API (FastAPI) - for document processing, embeddings, RAG
```

---

## 🔥 Firebase Components

### 1. **Firebase Authentication**
- **Location**: `frontend/lib/firebase.ts`
- **Purpose**: User authentication (Google Sign-In)
- **Usage**: Used throughout the frontend for user sessions

### 2. **Firebase Data Connect**
- **Purpose**: GraphQL database for structured data (users, papers, chats, etc.)
- **Backend**: PostgreSQL database hosted on Google Cloud SQL
- **Frontend**: Generated TypeScript SDK for queries/mutations

---

## 📁 Directory Structure

### Frontend Data Connect
```
frontend/
├─ dataconnect/
│  ├─ dataconnect.yaml          # Data Connect service config
│  ├─ schema/
│  │  └─ schema.gql              # GraphQL schema (User, Paper, Chat, etc.)
│  └─ example/
│     ├─ connector.yaml         # Connector config (generates SDK)
│     ├─ queries.gql             # GraphQL queries
│     └─ mutations.gql          # GraphQL mutations
├─ src/
│  └─ dataconnect-generated/     # ⚠️ GENERATED - Auto-created SDK
│     ├─ index.cjs.js
│     ├─ index.esm.js
│     ├─ index.d.ts
│     └─ react/                  # React hooks (if enabled)
└─ lib/
   ├─ firebase.ts                # Firebase app initialization + Auth
   └─ dataconnect.ts             # Re-exports generated SDK
```

### Backend Data Connect
```
backend/
├─ dataconnect/
│  ├─ dataconnect.yaml           # Data Connect service config (different service)
│  ├─ schema/
│  │  └─ schema.gql              # Same schema as frontend (should match)
│  └─ example/
│     └─ connector.yaml          # Connector config
└─ src/
   └─ dataconnect-generated/     # ⚠️ GENERATED - Auto-created SDK
```

**Note**: Both frontend and backend have their own `dataconnect-generated` directories, but they connect to the **same Firebase Data Connect service** and database.

---

## 🔄 Data Flow & Routing

### Frontend → Data Connect Flow

```
User Action (Frontend Component)
    ↓
Next.js API Route (/app/api/*/route.ts)
    ↓
Firebase App Initialization
    ↓
Data Connect Client (getDataConnect)
    ↓
Generated SDK Functions (queries/mutations)
    ↓
Firebase Data Connect Service (Cloud)
    ↓
PostgreSQL Database (Cloud SQL)
```

### Example: Adding a Paper

1. **User clicks "Add Paper"** in `frontend/app/library/page.tsx`
2. **Frontend calls** `/api/library/add` (Next.js API route)
3. **API route** (`frontend/app/api/library/add/route.ts`):
   ```typescript
   // Initialize Firebase
   const app = getFirebaseApp();
   const dc = getDataConnect(app, connectorConfig);
   
   // Use generated mutation
   await addPaper(dc, { userId, title, authors, ... });
   ```
4. **Data Connect** saves to PostgreSQL database
5. **API route** also calls **Backend API** (`http://localhost:8000/library/add/{docId}`) for document processing
6. **Backend** processes PDF, generates embeddings, stores in ChromaDB
7. **API route** updates paper status: `updatePaperIngestionStatus(dc, { paperId, status: "completed" })`

---

## 📍 Where Data Connect is Used

### Frontend API Routes (Next.js)

All these routes use Firebase Data Connect:

| Route | Purpose | Data Connect Operations |
|-------|---------|-------------------------|
| `/api/library/add` | Add paper to library | `addPaper()`, `updatePaperIngestionStatus()`, `listPapers()` |
| `/api/library/list` | List user's papers | `listPapers()` |
| `/api/library/delete` | Delete paper | `deletePaper()` |
| `/api/library/favorite` | Toggle favorite | `togglePaperFavorite()` |
| `/api/library/check-status` | Check ingestion status | `getPaper()` |
| `/api/chat` | Send chat message | `addChat()` |
| `/api/chat/sessions` | Manage chat sessions | `createChatSession()`, `listChatSessions()`, etc. |
| `/api/chat/sessions/[id]` | Get session details | `getChatSession()`, `getChatsForSession()` |
| `/api/discovery/search-history` | Search history | `addSearchHistory()`, `listSearchHistory()` |
| `/api/discovery/save-search` | Save search | `addSearchHistory()` |

### Frontend Components

Components that use Data Connect (via API routes or direct SDK):

- `app/library/page.tsx` - Library management
- `app/chat/page.tsx` - Chat interface
- `app/discovery/page.tsx` - Paper discovery
- `contexts/UserContext.tsx` - User management

---

## 🔧 Configuration Files

### 1. Firebase Configuration

**Root**: `CSE5914/firebase.json`
```json
{
  "emulators": {
    "dataconnect": {
      "dataDir": "dataconnect/.dataconnect/pgliteData"
    }
  },
  "dataconnect": {
    "source": "dataconnect"
  }
}
```

**Frontend**: `frontend/dataconnect/dataconnect.yaml`
```yaml
specVersion: "v1"
serviceId: "paper-477421-2-service"
location: "us-east4"
schema:
  source: "./schema"
  datasource:
    postgresql:
      database: "paper-477421-2-database"
      cloudSql:
        instanceId: "paper-477421-instance"
connectorDirs: ["./example"]
```

**Backend**: `backend/dataconnect/dataconnect.yaml`
```yaml
specVersion: "v1"
serviceId: "backend"
location: "us-east1"
schema:
  source: "./schema"
  datasource:
    postgresql:
      database: "fdcdb"
      cloudSql:
        instanceId: "backend-fdc"
connectorDirs: ["./example"]
```

**Note**: Frontend and backend use **different service IDs** but should share the **same schema**.

### 2. Connector Configuration

**Frontend**: `frontend/dataconnect/example/connector.yaml`
```yaml
connectorId: example
generate:
  javascriptSdk:
    - outputDir: ../../src/dataconnect-generated
      package: "@dataconnect/generated"
      packageJsonDir: ../..
      react: true  # Generates React hooks
```

This generates the TypeScript SDK in `frontend/src/dataconnect-generated/`.

---

## 🗄️ GraphQL Schema

**Location**: `frontend/dataconnect/schema/schema.gql` (and `backend/dataconnect/schema/schema.gql`)

### Main Types:

1. **User** - User accounts (linked to Firebase Auth)
2. **Paper** - Research papers in user's library
3. **ChatSession** - Chat conversation sessions
4. **Chat** - Individual chat messages
5. **ChatPaper** - Links papers to chat messages
6. **CodeLink** - GitHub repository links for papers
7. **SearchHistory** - User search history

---

## 🔐 Authentication Flow

1. **User signs in** via `signInWithGoogle()` in `lib/firebase.ts`
2. **Firebase Auth** handles OAuth with Google
3. **User ID** (from Firebase Auth) is used as `userId` in Data Connect queries
4. **Data Connect** uses `@auth(level: PUBLIC)` in queries/mutations (can be restricted later)

---

## 🔌 How Frontend Connects to Data Connect

### Step 1: Initialize Firebase App
```typescript
// In any API route or component
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... other config
};

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}
```

### Step 2: Get Data Connect Client
```typescript
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig } from "@/src/dataconnect-generated";

const app = getFirebaseApp();
const dc = getDataConnect(app, connectorConfig);
```

### Step 3: Use Generated Functions
```typescript
import { listPapers, addPaper } from "@/src/dataconnect-generated";

// Query
const { data } = await listPapers(dc, { userId: "..." });

// Mutation
const { data } = await addPaper(dc, {
  userId: "...",
  title: "...",
  authors: [...],
  // ...
});
```

---

## 🖥️ Backend Integration

### Backend Data Connect Usage

The backend **also** has Data Connect configured, but it's primarily used for:
- **Schema definition** (should match frontend)
- **Potential server-side operations** (if needed)
- **Firebase Functions** integration

### Backend API Routes

The backend (FastAPI) handles:
- **Document processing** (`/library/add/{docId}`)
- **Embeddings** (`/gemini/chat`, `/gemini/chat_agent`)
- **Vector search** (ChromaDB)
- **External APIs** (ArXiv, OpenAlex)

**Note**: The backend does **NOT** directly use Data Connect in most cases. Instead:
1. Frontend saves metadata to Data Connect
2. Frontend calls backend API for processing
3. Frontend updates Data Connect with processing status

---

## 📊 Complete Request Flow Example

### Adding a Paper to Library

```
1. User clicks "Add Paper" button
   └─> frontend/app/library/page.tsx

2. Frontend calls Next.js API route
   └─> POST /api/library/add?doc_id=1234&user_id=user-abc

3. API route (frontend/app/api/library/add/route.ts):
   a. Fetches paper metadata from ArXiv API
   b. Initializes Firebase Data Connect
   c. Checks for duplicates: listPapers(dc, { userId })
   d. Adds paper: addPaper(dc, { userId, title, ... })
   e. Calls backend API: POST http://localhost:8000/library/add/1234
   f. Backend processes PDF, generates embeddings
   g. Updates status: updatePaperIngestionStatus(dc, { paperId, status: "completed" })

4. Response sent to frontend
   └─> { success: true, paperId: "...", status: "completed" }
```

---

## 🚀 Deployment Considerations

1. **Generated Files**: `src/dataconnect-generated/` directories are **auto-generated** during build/deployment
2. **Environment Variables**: Both frontend and backend need Firebase config
3. **Service IDs**: Frontend and backend use different Data Connect service IDs (may need to align)
4. **Schema Sync**: Ensure `frontend/dataconnect/schema/schema.gql` matches `backend/dataconnect/schema/schema.gql`

---

## 🔍 Key Files Summary

| File | Purpose |
|------|---------|
| `frontend/lib/firebase.ts` | Firebase app + Auth initialization |
| `frontend/lib/dataconnect.ts` | Re-exports generated Data Connect SDK |
| `frontend/dataconnect/schema/schema.gql` | GraphQL schema definition |
| `frontend/dataconnect/example/queries.gql` | GraphQL queries |
| `frontend/dataconnect/example/mutations.gql` | GraphQL mutations |
| `frontend/src/dataconnect-generated/` | **Generated** TypeScript SDK |
| `frontend/app/api/**/route.ts` | Next.js API routes using Data Connect |
| `backend/dataconnect/` | Backend Data Connect config (mirrors frontend) |

---

## ⚠️ Important Notes

1. **Generated SDKs**: The `dataconnect-generated` directories are auto-generated. Don't edit them manually.
2. **Service IDs**: Frontend uses `paper-477421-2-service`, backend uses `backend` - ensure they point to the same database or coordinate properly.
3. **Schema Sync**: Keep frontend and backend schemas in sync.
4. **Authentication**: Data Connect queries use `@auth(level: PUBLIC)` - consider restricting for production.

