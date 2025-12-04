# Deployment Checklist

Use this checklist to ensure everything is configured correctly before deployment.

## Pre-Deployment Setup

### Firebase Project
- [ ] Firebase project created
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged in to Firebase (`firebase login`)
- [ ] Project selected (`firebase use <project-id>`)
- [ ] Firebase Data Connect service deployed
- [ ] Firebase Authentication enabled (Google Sign-In)

### API Keys & Secrets
- [ ] Google Gemini API key obtained
- [ ] (Optional) GitHub API token obtained
- [ ] (Optional) Nomic API key obtained
- [ ] All secrets created in Google Cloud Secret Manager
- [ ] Service account has access to secrets

### Code Preparation
- [ ] Backend CORS updated with production frontend URL placeholder
- [ ] `backend/apphosting.yaml` configured
- [ ] `frontend/next.config.ts` updated
- [ ] `frontend/firebase.json` has hosting config
- [ ] All environment variable placeholders updated

---

## Step 1: Backend Deployment

### Pre-Deployment
- [ ] Secrets created in Secret Manager:
  - [ ] `gemini-api-key`
  - [ ] (Optional) `github-api-token`
  - [ ] (Optional) `nomic-api-key`
- [ ] Service account permissions granted
- [ ] `backend/apphosting.yaml` updated with secret names
- [ ] `ALLOWED_ORIGINS` includes production frontend URL

### Deployment
- [ ] Data Connect SDK generated: `cd backend && firebase dataconnect:sdk:generate`
- [ ] Backend deployed: `firebase deploy --only apphosting:backend`
- [ ] Backend URL saved (e.g., `https://backend-XXXXX-XX.a.run.app`)
- [ ] Backend health check passes: `curl https://your-backend-url/health`

### Post-Deployment
- [ ] Backend accessible from browser
- [ ] CORS working (test from frontend)
- [ ] Environment variables loaded correctly
- [ ] Secrets accessible

---

## Step 2: Frontend Deployment

### Pre-Deployment
- [ ] Backend URL obtained from Step 1
- [ ] `BACKEND_URL` environment variable set
- [ ] `NEXT_PUBLIC_FIREBASE_*` variables set
- [ ] `frontend/next.config.ts` updated with backend hostname
- [ ] `ALLOWED_ORIGINS` in backend updated with frontend URL

### Deployment
- [ ] Data Connect SDK generated: `cd frontend && firebase dataconnect:sdk:generate`
- [ ] Dependencies installed: `npm install`
- [ ] Frontend built: `npm run build`
- [ ] Build successful (no errors)
- [ ] Frontend deployed

### Post-Deployment
- [ ] Frontend URL obtained
- [ ] Frontend loads without errors
- [ ] Browser console shows no errors
- [ ] Authentication works (Google Sign-In)
- [ ] Backend API calls succeed
- [ ] Data Connect queries work

---

## Verification Tests

### Backend Tests
- [ ] Health endpoint: `GET /health` returns `{"status": "healthy"}`
- [ ] Root endpoint: `GET /` returns `{"message": "Hello, world!"}`
- [ ] CORS headers present in responses
- [ ] API endpoints respond correctly

### Frontend Tests
- [ ] Home page loads
- [ ] User can sign in with Google
- [ ] Library page loads user's papers
- [ ] Can add paper to library
- [ ] Chat functionality works
- [ ] Discovery/search works
- [ ] No console errors

### Integration Tests
- [ ] Frontend can call backend API
- [ ] Backend processes requests from frontend
- [ ] Data Connect saves/retrieves data
- [ ] Paper ingestion workflow completes
- [ ] Chat messages save to database

---

## Production Configuration

### Security
- [ ] `DEBUG=false` in production
- [ ] API keys stored in Secret Manager (not in code)
- [ ] CORS restricted to production domains
- [ ] Environment variables not committed to git
- [ ] `.env` files in `.gitignore`

### Performance
- [ ] Backend instance limits configured appropriately
- [ ] Frontend caching headers set
- [ ] Image optimization configured
- [ ] Database indexes optimized

### Monitoring
- [ ] Error logging enabled
- [ ] Health checks configured
- [ ] Alerts set up (if applicable)
- [ ] Analytics configured (if applicable)

---

## Rollback Plan

If deployment fails:
- [ ] Know how to rollback backend deployment
- [ ] Know how to rollback frontend deployment
- [ ] Have previous working version tagged in git
- [ ] Know how to revert environment variables

---

## Post-Deployment

### Documentation
- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] Secrets locations documented
- [ ] Team notified of deployment

### Monitoring
- [ ] Check error logs for first 24 hours
- [ ] Monitor performance metrics
- [ ] Verify user reports
- [ ] Check cost/billing (if applicable)

---

## Quick Commands Reference

```bash
# Backend
cd backend
firebase dataconnect:sdk:generate
firebase deploy --only apphosting:backend

# Frontend
cd frontend
firebase dataconnect:sdk:generate
npm install
npm run build
firebase deploy --only hosting

# Check backend health
curl https://your-backend-url.run.app/health

# View backend logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

