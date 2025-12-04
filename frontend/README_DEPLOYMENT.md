# Frontend Deployment Files Overview

This directory contains all files needed to deploy the Next.js frontend to Google Cloud.

## Files Created

### Core Deployment Files

1. **`Dockerfile`** - Multi-stage container image for Next.js
   - Stage 1: Install dependencies
   - Stage 2: Build Next.js app with standalone output
   - Stage 3: Runtime with minimal Node.js image
   - Optimized for production

2. **`cloudbuild.yaml`** - Google Cloud Build configuration
   - Builds Docker image with Firebase config
   - Pushes to Artifact Registry
   - Deploys to Cloud Run
   - Handles build-time environment variables

3. **`.dockerignore`** - Files excluded from Docker build
4. **`.gcloudignore`** - Files excluded from gcloud deployments

### Deployment Scripts

5. **`deploy.sh`** - Quick deployment script
   - Automates build and deploy
   - Creates repository if needed
   - Shows service URL after deployment

### Configuration Files

6. **`next.config.ts`** - Updated Next.js config
   - Enabled standalone output for Docker
   - Added backend URL to image remote patterns

7. **`lib/backend.ts`** - Centralized backend URL configuration
   - Helper functions for backend API calls
   - Type-safe endpoint definitions

### Documentation

8. **`FRONTEND_MODULARIZATION.md`** - Architecture documentation
   - Component breakdown
   - Hosting recommendations
   - Scaling strategies

9. **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide
   - Step-by-step instructions
   - Environment variable setup
   - Troubleshooting

10. **`QUICK_START.md`** - Quick reference guide
    - Minimal steps to deploy
    - Common commands

11. **`.env.example`** - Example environment variables
    - Template for local development
    - Documents all required variables

## Quick Deployment

```bash
# 1. Set Firebase environment variables
export FIREBASE_API_KEY="your-key"
export FIREBASE_PROJECT_ID="your-project"
# ... (see QUICK_START.md for all variables)

# 2. Set backend URL
export BACKEND_URL="https://backend-api-wirfpvv3kq-uc.a.run.app"

# 3. Deploy
./deploy.sh frontend-app us-central1 $BACKEND_URL
```

## Configuration Checklist

Before deploying, ensure:

- [ ] Google Cloud project created
- [ ] Artifact Registry repository created
- [ ] Firebase project configured
- [ ] Firebase configuration values obtained
- [ ] Backend API deployed and accessible
- [ ] Backend CORS configured (after frontend deployment)

## Environment Variables

### Build-time (NEXT_PUBLIC_*)
These are baked into the Next.js build:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BACKEND_URL`

### Runtime (Server-side)
- `BACKEND_URL` - Used by API routes

## Architecture

```
Frontend (Next.js on Cloud Run)
  ├── Pages (SSR/SSG)
  ├── API Routes (proxies to backend)
  └── Components (client-side)
         │
         ├── Backend API (Cloud Run)
         └── Firebase Services
```

## Next Steps

1. Review `FRONTEND_MODULARIZATION.md` for architecture details
2. Follow `QUICK_START.md` for rapid deployment
3. Configure monitoring and alerts
4. Set up custom domain (optional)
5. Optimize with CDN for static assets

