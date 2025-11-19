# PaperLink Frontend

Next.js 16 (App Router) + TypeScript single-page application providing user interface for document ingestion, chat (RAG), library management, discovery, and profile interactions. It integrates Firebase (Auth + Data Connect) and communicates with the backend FastAPI services.

## Features

- Chat interface with streaming / message display (`app/chat/` & `components/chat/*`)
- Document viewer (PDF) and ingestion workflow
- Library management (add/list/delete/check-status)
- Discovery flows (scholarly search) via `app/discovery/`
- User authentication & context via Firebase (`lib/firebase.ts`, `contexts/UserContext.tsx`)
- Firebase Data Connect GraphQL integration (`dataconnect/` + generated client in `src/dataconnect-generated/`)
- Responsive layout with `Navbar` and route-based pages
- Markdown rendering for rich content (`react-markdown`)

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (TSConfig included) |
| UI / Styling | Tailwind CSS 4 (via PostCSS) + global CSS |
| Animations | Framer Motion |
| Auth / Backend Services | Firebase SDK (v10) |
| GraphQL | Firebase Data Connect (`@firebase/data-connect`) |
| Markdown | `react-markdown` |
| Linting | ESLint 9 + `eslint-config-next` |

## Directory Structure

```text
frontend/
├─ app/                    # App Router pages
│  ├─ layout.tsx           # Root layout
│  ├─ page.tsx             # Landing page
│  ├─ chat/                # Chat UI route
│  ├─ discovery/           # Discovery (search) route
│  ├─ docs/                # Documentation viewer route
│  ├─ library/             # Library management route
│  ├─ login/               # Login route
│  ├─ profile/             # Profile route
│  └─ api/                 # Next.js route handlers (server-side endpoints)
│     ├─ chat/route.ts     # Chat API proxy/handler
│     ├─ discovery/...     # Discovery API handlers
│     └─ library/...       # Library CRUD handlers
├─ components/             # Reusable UI components
│  ├─ Navbar.tsx           # Top navigation
│  ├─ LoginButton.tsx      # Auth entry
│  └─ chat/                # Chat-specific components (InputForm, Messages, PdfViewer, Sidebar, types)
├─ contexts/               # React contexts (UserContext)
├─ dataconnect/            # GraphQL schema & connector definitions
│  ├─ dataconnect.yaml
│  ├─ schema/              # `schema.gql`
│  └─ example/             # Sample connector & queries
├─ lib/                    # Helpers (firebase, dataconnect client setup)
├─ public/                 # Static assets
├─ src/dataconnect-generated/  # Generated GraphQL client package
├─ eslint.config.mjs       # ESLint configuration
├─ next.config.ts          # Next.js configuration
├─ postcss.config.mjs      # PostCSS (Tailwind pipeline)
├─ tsconfig.json           # TypeScript config
├─ package.json            # Dependencies & scripts
└─ README.md
```

## Scripts

```bash
npm run dev     # Start development server on http://localhost:3000
npm run build   # Production build (/.next)
npm run start   # Start built production server
npm run lint    # Run ESLint
```

Alternative package managers (yarn/pnpm/bun) can be used equivalently.

## Setup

```bash
git clone <repo>
cd frontend
npm install
cp .env.example .env.local   # If example file exists; otherwise create manually
npm run dev
```

Open <http://localhost:3000> in your browser.

## Environment Variables

Create `frontend/.env.local` for Next.js (automatically loaded). Prefix variables with `NEXT_PUBLIC_` if they must be exposed client-side.

Common (adjust to actual usage):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxx
# Data Connect specific configuration might go here
BACKEND_API_BASE=http://127.0.0.1:8000  # Used by route handlers / fetch calls
```

Never commit secrets; `.env.local` is ignored by Next.js default rules.

## Development Workflow

- UI changes: modify components under `components/` or page routes in `app/`
- API integration: update `app/api/*` route handlers or `lib/dataconnect.ts`
- GraphQL updates: adjust schema in `dataconnect/schema/schema.gql`, regenerate client (document process when established)
- Auth logic: evolve `contexts/UserContext.tsx` and `lib/firebase.ts`

Hot reload is automatic via Next.js dev server.

## Styling

Tailwind CSS 4 via PostCSS pipeline. Add utility classes directly in JSX. Global styles in `app/globals.css`.

To configure theme or plugins, add/modify `tailwind.config.js` (create if not present) and restart `npm run dev`.

## Testing & Quality

Currently no explicit test setup in `package.json`. Recommended additions:

1. Add Jest + React Testing Library for component/unit tests.
2. Add Playwright or Cypress for E2E.

Run linting:

```bash
npm run lint
```

Consider adding a pre-commit hook (Husky) to run `eslint --max-warnings=0`.

## Building & Production

```bash
npm run build
npm run start  # Serves .next/ on default port 3000
```

Deploy targets:

- Vercel (native support for Next.js 16)
- Firebase Hosting (configure rewrites for App Router if used in multi-service deployment)
- Docker container (add a `Dockerfile` with multi-stage build)

Example minimal Dockerfile (add if needed):

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm install --production --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm","run","start"]
```

## Backend Integration

Frontend route handlers (`app/api/*`) or components fetch data from the FastAPI backend. Centralize base URL in an environment variable (`BACKEND_API_BASE`). Use `fetch` with relative helper wrappers for error handling and auth token attachment.

## GraphQL (Firebase Data Connect)

- Schema resides in `dataconnect/schema/schema.gql`.
- Generated client package at `src/dataconnect-generated/` is symlinked/dependency via `file:` in `package.json` (`@dataconnect/generated`).
- Modify schema then regenerate (document command once generation script is added). Ensure version bump or clean install to refresh local generated code.

## Troubleshooting

| Issue | Cause | Resolution |
|-------|-------|------------|
| 404 on routes | Missing page or incorrect folder | Ensure folder under `app/` has a `page.tsx` |
| Styling not applied | Tailwind config missing | Add `tailwind.config.js` and restart dev server |
| Firebase auth fails | Misconfigured env vars | Verify all `NEXT_PUBLIC_FIREBASE_*` values |
| GraphQL errors | Schema/client mismatch | Regenerate client after schema changes |
| Cannot import generated code | Build path stale | Reinstall deps `npm install` or clean `.next` |

Enable verbose Next.js logs by running `NEXT_DEBUG=1 npm run dev` (optional).

## Quick Start

```bash
git clone <repo>
cd frontend
npm install
echo "BACKEND_API_BASE=http://127.0.0.1:8000" > .env.local
npm run dev
```

Visit <http://localhost:3000>.
