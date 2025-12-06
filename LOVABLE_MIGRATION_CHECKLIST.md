# Lovable Migration Quick Checklist

## ✅ Files to Include (Quick Reference)

### Frontend - All Files
```
✓ frontend/package.json
✓ frontend/package-lock.json
✓ frontend/tsconfig.json
✓ frontend/next.config.ts
✓ frontend/eslint.config.mjs
✓ frontend/postcss.config.mjs
✓ frontend/empty-module.js
✓ frontend/app/**/* (all pages and API routes)
✓ frontend/components/**/* (all components)
✓ frontend/contexts/**/* (UserContext)
✓ frontend/lib/**/* (utilities)
✓ frontend/dataconnect/**/* (GraphQL schema, queries, mutations)
✓ frontend/src/dataconnect-generated/**/* (generated SDK)
✓ frontend/public/**/* (static assets)
```

### Backend - All Files
```
✓ backend/pyproject.toml
✓ backend/poetry.lock
✓ backend/requirements.txt
✓ backend/app/**/* (all Python files)
✓ backend/dataconnect/**/* (schema and config)
✓ backend/tests/**/* (test files)
```

### Critical Database Files
```
✓ frontend/dataconnect/schema/schema.gql (MOST IMPORTANT)
✓ frontend/dataconnect/example/queries.gql
✓ frontend/dataconnect/example/mutations.gql
✓ frontend/dataconnect/dataconnect.yaml
✓ backend/dataconnect/schema/schema.gql (should match frontend)
```

### Environment Variables Needed
```
Frontend:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_BACKEND_API_BASE

Backend:
- GEMINI_API_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_CREDENTIALS_PATH (or service account JSON)
- CHROMA_PERSIST_DIRECTORY
```

## 🗄️ Database Migration Options

### Option 1: Keep Firebase Data Connect
- Provide Firebase credentials
- Keep existing database connection
- No data migration needed

### Option 2: Migrate to Lovable Database
- Export PostgreSQL data (SQL dump)
- Provide schema.gql file ✓ (already included)
- Provide data export files
- Update connection strings in code

## 📦 What to Exclude
```
✗ node_modules/
✗ .next/
✗ backend/chroma/ (vector DB data - too large)
✗ .git/
✗ *.log
✗ .env (actual secrets)
✗ __pycache__/
✗ dist/
✗ .venv/
```

## 🚀 Quick Steps

1. **Zip the project** excluding node_modules, .next, chroma data
2. **Include** all source files listed above
3. **Provide** environment variable template
4. **Export** database if migrating away from Firebase
5. **Document** API keys needed (Gemini, Firebase, etc.)

## 📋 File Count Estimate
- ~100+ essential files
- ~50+ frontend files
- ~20+ backend files
- ~15+ config files
- 1 critical schema file

