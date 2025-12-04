# Frontend Modularization Guide

## Overview

This document outlines the modular architecture of the frontend Next.js application and provides hosting recommendations for each component.

## Current Architecture

The frontend is a Next.js 16 application using the App Router with the following structure:

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/                # API route handlers (proxies to backend)
│   ├── chat/               # Chat page
│   ├── compare/            # Document comparison page
│   ├── discovery/          # Paper discovery page
│   ├── library/            # Library management page
│   └── ...                 # Other pages
├── components/             # React components
├── contexts/               # React contexts (UserContext)
├── lib/                    # Utility libraries
│   ├── firebase.ts         # Firebase initialization
│   └── dataconnect.ts      # Data Connect client
└── public/                 # Static assets
```

---

## Component Breakdown

### 1. **Pages Layer** (`app/`)

#### Components:
- **`page.tsx`** - Home page
- **`chat/page.tsx`** - Chat interface with RAG
- **`compare/page.tsx`** - Document comparison interface
- **`discovery/page.tsx`** - Paper discovery/search interface
- **`library/page.tsx`** - Library management interface
- **`login/page.tsx`** - Authentication page
- **`profile/page.tsx`** - User profile page
- **`docs/page.tsx`** - Documentation page

#### Responsibilities:
- Page-level UI components
- Client-side routing
- User interaction handling
- Data fetching from API routes

#### Hosting Recommendation:
- **Primary**: Cloud Run (SSR/SSG) or Firebase Hosting (static export)
- **Alternative**: 
  - Vercel (optimized for Next.js)
  - Netlify
  - AWS Amplify
  - Azure Static Web Apps

---

### 2. **API Routes Layer** (`app/api/`)

#### 2.1 **Chat API** (`app/api/chat/`)
- **`route.ts`** - Main chat endpoint (proxies to backend `/gemini/chat` or `/gemini/chat_agent`)
- **`sessions/route.ts`** - Chat session management
- **`sessions/[id]/route.ts`** - Individual session handling

**Dependencies**:
- Firebase Data Connect
- Backend API (Gemini service)

**Hosting**: Deploy with Next.js app (server-side routes)

---

#### 2.2 **Discovery API** (`app/api/discovery/`)
- **`search/route.ts`** - Search arXiv papers (proxies to `/arxiv/search`)
- **`add/route.ts`** - Add paper to library (proxies to `/library/add`)
- **`save-search/route.ts`** - Save search queries
- **`search-history/route.ts`** - Retrieve search history

**Dependencies**:
- Firebase Data Connect
- Backend API (arXiv, Library services)

**Hosting**: Deploy with Next.js app

---

#### 2.3 **Library API** (`app/api/library/`)
- **`list/route.ts`** - List user's library (proxies to `/library/list`)
- **`add/route.ts`** - Add document to library (proxies to `/library/add`)
- **`delete/route.ts`** - Delete document (proxies to `/library/delete`)
- **`check-status/route.ts`** - Check ingestion status (proxies to `/library/check_batch`)
- **`favorite/route.ts`** - Favorite/unfavorite documents

**Dependencies**:
- Firebase Data Connect
- Backend API (Library service)

**Hosting**: Deploy with Next.js app

---

#### 2.4 **Compare API** (`app/api/compare/`)
- **`route.ts`** - Compare two documents (proxies to `/compare`)

**Dependencies**:
- Backend API (Comparison service)

**Hosting**: Deploy with Next.js app

---

### 3. **Components Layer** (`components/`)

#### 3.1 **Chat Components** (`components/chat/`)
- **`ChatHistory.tsx`** - Chat history sidebar
- **`InputForm.tsx`** - Chat input form
- **`Messages.tsx`** - Message display
- **`PdfViewer.tsx`** - PDF viewer with highlighting
- **`Sidebar.tsx`** - Document sidebar
- **`citations.ts`** - Citation utilities
- **`sourceUtils.ts`** - Source handling utilities
- **`types.ts`** - TypeScript types

**Dependencies**:
- `@react-pdf-viewer/core`
- `pdfjs-dist`
- Backend API (for PDF serving)

**Hosting**: Client-side components, bundled with Next.js

---

#### 3.2 **Shared Components**
- **`LoginButton.tsx`** - Authentication button
- **`Navbar.tsx`** - Navigation bar

**Dependencies**:
- Firebase Auth

**Hosting**: Client-side components

---

### 4. **Contexts Layer** (`contexts/`)

#### Components:
- **`UserContext.tsx`** - User authentication state management

**Dependencies**:
- Firebase Auth

**Hosting**: Client-side, bundled with app

---

### 5. **Libraries Layer** (`lib/`)

#### 5.1 **Firebase Integration** (`lib/firebase.ts`)
- **Purpose**: Firebase app initialization
- **Dependencies**: Firebase SDK

#### 5.2 **Data Connect** (`lib/dataconnect.ts`)
- **Purpose**: GraphQL client for Firebase Data Connect
- **Dependencies**: `@firebase/data-connect`, generated client

**Hosting**: Server-side and client-side utilities

---

## Recommended Modular Architecture

### Architecture Option 1: Monolithic Next.js (Current)
```
┌─────────────────────────────────────┐
│     Next.js Application             │
│  ┌───────────────────────────────┐   │
│  │  Pages (SSR/SSG)              │   │
│  └───────────────────────────────┘   │
│  ┌───────────────────────────────┐   │
│  │  API Routes (Server-side)     │   │
│  └───────────────────────────────┘   │
│  ┌───────────────────────────────┐   │
│  │  Components (Client-side)     │   │
│  └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Pros**: Simple, single deployment, Next.js optimizations
**Cons**: All routes in one service, can't scale API routes independently

---

### Architecture Option 2: Separated API Routes (For Scale)
```
┌─────────────────┐
│  Next.js Pages  │  ← Static/SSG pages
│  (Cloud Run)    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼───┐ ┌───▼───┐ ┌───▼───┐
│ Chat  │ │Disc  │ │Lib    │ │Comp   │
│ API   │ │API   │ │API    │ │API    │
└───────┘ └──────┘ └───────┘ └───────┘
```

**Pros**: Independent scaling, fault isolation
**Cons**: More complex, network latency, multiple deployments

---

### Architecture Option 3: Hybrid (Recommended for Production)
```
┌─────────────────────────────────────┐
│  Next.js App (Cloud Run)            │
│  - Pages (SSR/SSG)                  │
│  - API Routes (server-side)         │
│  - Static Assets (CDN)              │
└─────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│Backend│ │Firebase │
│API    │ │Services │
└───────┘ └─────────┘
```

**Components**:
- **Next.js App**: All pages and API routes
- **Backend API**: FastAPI service (already deployed)
- **Firebase**: Auth, Data Connect, Storage

---

## Hosting Strategy by Component

### Tier 1: Static Assets (CDN)
- **`public/`** - Static files (images, icons, etc.)
- **Next.js static exports** - Pre-rendered pages

**Hosting**: 
- Firebase Hosting (automatic with Next.js)
- Cloud Storage + CDN
- Cloudflare CDN

---

### Tier 2: Pages (SSR/SSG)
- All page components (`app/*/page.tsx`)

**Hosting Options**:
1. **Cloud Run** (Recommended): Full Next.js with SSR
2. **Firebase Hosting**: Static export (faster, but no SSR)
3. **Vercel**: Optimized for Next.js (easiest)

---

### Tier 3: API Routes (Server-side)
- All API route handlers (`app/api/**`)

**Hosting**: 
- Deploy with Next.js app (Cloud Run)
- Or extract to separate Cloud Run services for independent scaling

---

### Tier 4: Client Components
- React components, contexts, utilities

**Hosting**: Bundled with Next.js, served to browser

---

## Deployment Recommendations

### Development / Small Scale (<1000 users)
- **Single Cloud Run service** with full Next.js app
- Static assets via Next.js built-in serving
- Environment variables for configuration

### Production / Medium Scale (1000-10,000 users)
- **Cloud Run** with Next.js (SSR enabled)
- **Firebase Hosting** for static assets (CDN)
- **Cloud CDN** for global distribution
- **Environment variables** via Secret Manager

### Enterprise Scale (10,000+ users)
- **Multiple Cloud Run instances** (regional)
- **Cloud CDN** for global distribution
- **Firebase Hosting** for static assets
- **Separate API routes** as microservices (if needed)
- **Monitoring**: Cloud Monitoring, Error Reporting

---

## Environment Variables

### Required (Server-side)
- `BACKEND_URL` - Backend API URL (e.g., `https://backend-api-wirfpvv3kq-uc.a.run.app`)

### Required (Client-side - NEXT_PUBLIC_*)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BACKEND_URL` - Backend URL for client-side calls

### Optional
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Analytics

---

## Cost Optimization

1. **Static Export**: Use `next export` for static pages (cheaper hosting)
2. **ISR (Incremental Static Regeneration)**: Cache pages, reduce server load
3. **Image Optimization**: Use Next.js Image component with CDN
4. **API Route Caching**: Cache API responses where possible
5. **Minimize API Routes**: Keep heavy processing on backend

---

## Security Considerations

1. **Environment Variables**: 
   - Server-side vars: Use Secret Manager
   - Client-side vars: Only `NEXT_PUBLIC_*` are exposed
2. **API Routes**: Validate user authentication
3. **CORS**: Configure backend to allow frontend domain
4. **Firebase Rules**: Set up proper security rules
5. **Rate Limiting**: Implement on API routes

---

## Monitoring & Observability

1. **Logging**: Cloud Logging (structured logs)
2. **Metrics**: Cloud Monitoring (page views, API calls)
3. **Error Tracking**: Error Reporting
4. **Performance**: Web Vitals monitoring
5. **Analytics**: Firebase Analytics (optional)

---

## Migration Path

### Phase 1: Current (Monolithic Next.js)
- All pages and API routes in one Next.js app
- Deploy to Cloud Run

### Phase 2: Optimize Static Assets
- Move static assets to Firebase Hosting/CDN
- Enable static export for public pages

### Phase 3: Separate API Routes (If Needed)
- Extract high-traffic API routes to separate services
- Use API Gateway for routing

### Phase 4: Global Distribution
- Deploy to multiple regions
- Use Cloud CDN for global edge caching

---

## Next Steps

1. **Immediate**: Deploy Next.js app to Cloud Run
2. **Short-term**: Configure environment variables
3. **Medium-term**: Set up Firebase Hosting for static assets
4. **Long-term**: Optimize with CDN and caching strategies

