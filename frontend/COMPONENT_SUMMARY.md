# Frontend Component Summary

## Component Overview

This document provides a detailed breakdown of each frontend component, its purpose, dependencies, and hosting recommendations.

---

## 1. Pages Layer

### 1.1 Home Page (`app/page.tsx`)
- **Purpose**: Landing page
- **Dependencies**: None
- **Complexity**: ⭐ (Simple)
- **Hosting**: Static/SSG page

---

### 1.2 Chat Page (`app/chat/page.tsx`)
- **Purpose**: Chat interface with RAG capabilities
- **Dependencies**: 
  - Chat components
  - Backend API (Gemini service)
  - Firebase Data Connect
- **Complexity**: ⭐⭐⭐⭐ (Complex)
- **Hosting**: SSR page (Cloud Run)

---

### 1.3 Discovery Page (`app/discovery/page.tsx`)
- **Purpose**: Paper discovery and search
- **Dependencies**: 
  - Backend API (arXiv, OpenAlex)
  - Firebase Data Connect
- **Complexity**: ⭐⭐⭐ (Moderate)
- **Hosting**: SSR page

---

### 1.4 Library Page (`app/library/page.tsx`)
- **Purpose**: Document library management
- **Dependencies**: 
  - Backend API (Library service)
  - Firebase Data Connect
  - PDF viewer
- **Complexity**: ⭐⭐⭐⭐ (Complex)
- **Hosting**: SSR page

---

### 1.5 Compare Page (`app/compare/page.tsx`)
- **Purpose**: Document comparison interface
- **Dependencies**: 
  - Backend API (Comparison service)
- **Complexity**: ⭐⭐⭐ (Moderate)
- **Hosting**: SSR page

---

## 2. API Routes Layer

### 2.1 Chat API (`app/api/chat/`)
- **Purpose**: Proxy chat requests to backend
- **Endpoints**: 
  - `POST /api/chat` - Main chat endpoint
  - `GET/POST /api/chat/sessions` - Session management
- **Dependencies**: 
  - Backend API (`/gemini/chat`, `/gemini/chat_agent`)
  - Firebase Data Connect
- **Complexity**: ⭐⭐⭐ (Moderate)
- **Hosting**: Server-side API routes (Cloud Run)

---

### 2.2 Discovery API (`app/api/discovery/`)
- **Purpose**: Proxy discovery/search requests
- **Endpoints**: 
  - `GET /api/discovery/search` - Search papers
  - `POST /api/discovery/add` - Add to library
  - `POST /api/discovery/save-search` - Save search
  - `GET /api/discovery/search-history` - Get history
- **Dependencies**: 
  - Backend API (arXiv, Library)
  - Firebase Data Connect
- **Complexity**: ⭐⭐ (Simple)
- **Hosting**: Server-side API routes

---

### 2.3 Library API (`app/api/library/`)
- **Purpose**: Proxy library management requests
- **Endpoints**: 
  - `GET /api/library/list` - List documents
  - `POST /api/library/add` - Add document
  - `DELETE /api/library/delete` - Delete document
  - `POST /api/library/check-status` - Check status
  - `POST /api/library/favorite` - Favorite/unfavorite
- **Dependencies**: 
  - Backend API (Library service)
  - Firebase Data Connect
- **Complexity**: ⭐⭐⭐ (Moderate)
- **Hosting**: Server-side API routes

---

### 2.4 Compare API (`app/api/compare/`)
- **Purpose**: Proxy comparison requests
- **Endpoints**: 
  - `POST /api/compare` - Compare documents
- **Dependencies**: 
  - Backend API (Comparison service)
- **Complexity**: ⭐⭐ (Simple)
- **Hosting**: Server-side API routes

---

## 3. Components Layer

### 3.1 Chat Components (`components/chat/`)
- **ChatHistory.tsx** - Chat history sidebar
- **InputForm.tsx** - Chat input form
- **Messages.tsx** - Message display
- **PdfViewer.tsx** - PDF viewer with highlighting
- **Sidebar.tsx** - Document sidebar
- **citations.ts** - Citation utilities
- **sourceUtils.ts** - Source handling
- **types.ts** - TypeScript types

**Dependencies**: 
- `@react-pdf-viewer/core`
- `pdfjs-dist`
- Backend API

**Complexity**: ⭐⭐⭐⭐ (Complex)
**Hosting**: Client-side, bundled with Next.js

---

### 3.2 Shared Components
- **LoginButton.tsx** - Authentication button
- **Navbar.tsx** - Navigation bar

**Dependencies**: Firebase Auth
**Complexity**: ⭐⭐ (Simple)
**Hosting**: Client-side

---

## 4. Contexts Layer

### 4.1 UserContext (`contexts/UserContext.tsx`)
- **Purpose**: User authentication state management
- **Dependencies**: Firebase Auth
- **Complexity**: ⭐⭐ (Simple)
- **Hosting**: Client-side

---

## 5. Libraries Layer

### 5.1 Firebase (`lib/firebase.ts`)
- **Purpose**: Firebase app initialization
- **Dependencies**: Firebase SDK
- **Complexity**: ⭐ (Simple)

### 5.2 Data Connect (`lib/dataconnect.ts`)
- **Purpose**: GraphQL client
- **Dependencies**: `@firebase/data-connect`
- **Complexity**: ⭐⭐ (Simple)

### 5.3 Backend (`lib/backend.ts`)
- **Purpose**: Centralized backend URL configuration
- **Dependencies**: None
- **Complexity**: ⭐ (Simple)

---

## Quick Reference: Hosting Decisions

| Component | Current | Recommended | Scale When |
|-----------|---------|-------------|------------|
| Pages | Next.js SSR | Cloud Run | Always |
| API Routes | Next.js API | Cloud Run | Always |
| Components | Client-side | Bundled | Always |
| Static Assets | Next.js | Firebase Hosting/CDN | >100MB assets |

---

## Environment Variables Summary

### Required (Build-time)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BACKEND_URL`

### Required (Runtime)
- `BACKEND_URL` - Server-side backend URL

---

## Next Steps

1. Deploy frontend to Cloud Run
2. Configure environment variables
3. Update backend CORS
4. Test all features
5. Set up monitoring

