# Deployment Guide - PaperLink Frontend & Backend

This guide covers preparing and deploying both the frontend (Next.js) and backend (FastAPI) components in the correct order.

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] Firebase project created and configured
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase project initialized (`firebase login` and `firebase use <project-id>`)
- [ ] Google Cloud project linked to Firebase
- [ ] Firebase Data Connect service deployed
- [ ] Required API keys obtained (Gemini, GitHub, etc.)

### Required Environment Variables

**Backend:**
- `GEMINI_API_KEY` - Google Gemini API key
- `GITHUB_API_TOKEN` (optional) - For GitHub integration
- `NOMIC_API_KEY` (optional) - For embeddings
- `DEBUG` - Set to `false` for production

**Frontend:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `BACKEND_URL` - Production backend URL (set after backend deployment)

---

## 🚀 Deployment Order

**IMPORTANT**: Deploy in this exact order:

1. **Backend** (Firebase App Hosting) - Must be deployed first
2. **Frontend** (Firebase Hosting) - Deployed after backend URL is known

---

## Step 1: Prepare Backend for Deployment

### 1.1 Update Backend Configuration

#### Update CORS in `backend/app/main.py`

```python
# Configure CORS - Update with production frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-frontend-domain.web.app",  # Add production URL
        "https://your-frontend-domain.firebaseapp.com",  # Add production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Update `backend/apphosting.yaml`

```yaml
# Settings for Backend (on Cloud Run).
runConfig:
  minInstances: 0
  maxInstances: 10  # Adjust based on expected load
  concurrency: 80
  cpu: 1
  memoryMiB: 512

# Environment variables and secrets.
env:
  # Runtime environment variables
  - variable: DEBUG
    value: "false"
    availability:
      - RUNTIME
  
  # Secrets from Cloud Secret Manager
  - variable: GEMINI_API_KEY
    secret: gemini-api-key  # Create this secret in Secret Manager
    availability:
      - RUNTIME
  
  # Optional secrets
  - variable: GITHUB_API_TOKEN
    secret: github-api-token  # If using GitHub features
    availability:
      - RUNTIME
  
  - variable: NOMIC_API_KEY
    secret: nomic-api-key  # If using Nomic embeddings
    availability:
      - RUNTIME
```

### 1.2 Create Cloud Secrets

Before deploying, create secrets in Google Cloud Secret Manager:

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create secrets
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-
echo -n "your-github-token" | gcloud secrets create github-api-token --data-file=-
echo -n "your-nomic-key" | gcloud secrets create nomic-api-key --data-file=-

# Grant App Hosting service account access
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="service-${PROJECT_NUMBER}@gcp-sa-firebaseapphosting.iam.gserviceaccount.com"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding github-api-token \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding nomic-api-key \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

### 1.3 Generate Data Connect SDK (Backend)

```bash
cd CSE5914/backend
firebase dataconnect:sdk:generate
```

This generates `src/dataconnect-generated/` directory.

### 1.4 Create Backend Build Configuration

Create `backend/.gcloudignore`:

```
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
.venv/
venv/
env/
*.log
.git/
.gitignore
.pytest_cache/
.coverage
chroma/
chroma_data/
tests/
*.md
```

### 1.5 Deploy Backend

```bash
cd CSE5914/backend

# Ensure you're in the correct Firebase project
firebase use YOUR_PROJECT_ID

# Deploy backend to App Hosting
firebase deploy --only apphosting:backend

# Note the backend URL from the output
# It will look like: https://backend-XXXXX-XX.a.run.app
```

**Save the backend URL** - you'll need it for frontend configuration!

---

## Step 2: Prepare Frontend for Deployment

### 2.1 Update Frontend Configuration

#### Update `frontend/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",  // Changed from http
        hostname: "your-backend-url.run.app",  // Your backend domain
        pathname: "/library/images/**",
      },
      {
        protocol: "https",
        hostname: "localhost",  // Keep for local dev
        port: "8000",
        pathname: "/library/images/**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },
  // Output configuration for static export (if needed)
  // output: 'standalone',  // Uncomment if using standalone build
};

export default nextConfig;
```

#### Update `frontend/firebase.json` for Hosting

```json
{
  "emulators": {
    "dataconnect": {
      "dataDir": "dataconnect/.dataconnect/pgliteData"
    }
  },
  "dataconnect": {
    "source": "dataconnect"
  },
  "hosting": {
    "public": ".next",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

**Note**: For Next.js, you might want to use Firebase Hosting with Next.js integration or deploy to Vercel/other platforms. The above is a basic setup.

### 2.2 Generate Data Connect SDK (Frontend)

```bash
cd CSE5914/frontend
firebase dataconnect:sdk:generate
```

This generates `src/dataconnect-generated/` directory.

### 2.3 Set Frontend Environment Variables

Create environment variables in Firebase Hosting or your hosting platform:

**For Firebase Hosting:**
```bash
# Set environment variables (these are build-time for Next.js)
firebase functions:config:set \
  backend.url="https://your-backend-url.run.app" \
  firebase.api_key="your-api-key" \
  firebase.auth_domain="your-project.firebaseapp.com" \
  firebase.project_id="your-project-id" \
  firebase.storage_bucket="your-project.appspot.com" \
  firebase.messaging_sender_id="your-sender-id" \
  firebase.app_id="your-app-id"
```

**For Next.js build, create `.env.production` (don't commit this):**

```env
# Backend URL (from Step 1.5)
BACKEND_URL=https://your-backend-url.run.app

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 2.4 Build Frontend

```bash
cd CSE5914/frontend

# Install dependencies
npm install

# Generate Data Connect SDK
firebase dataconnect:sdk:generate

# Build for production
npm run build
```

### 2.5 Deploy Frontend

**Option A: Firebase Hosting (with Next.js)**

```bash
cd CSE5914/frontend

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Option B: Vercel (Recommended for Next.js)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# - BACKEND_URL
# - NEXT_PUBLIC_FIREBASE_*
```

**Option C: Other Platforms**

Follow your platform's Next.js deployment guide, ensuring:
- Environment variables are set
- Build command: `npm run build`
- Start command: `npm start` (if using Node.js server)

---

## Step 3: Post-Deployment Verification

### 3.1 Verify Backend

```bash
# Check backend health
curl https://your-backend-url.run.app/health

# Expected response: {"status": "healthy"}
```

### 3.2 Verify Frontend

1. Visit your frontend URL
2. Check browser console for errors
3. Test authentication (Google Sign-In)
4. Test adding a paper to library
5. Test chat functionality

### 3.3 Verify Data Connect

1. Check Firebase Console → Data Connect
2. Verify schema is deployed
3. Test a query in the Data Connect console

---

## 🔧 Configuration Files Summary

### Backend Files to Update:

| File | Changes Needed |
|------|----------------|
| `backend/app/main.py` | Update CORS origins with production frontend URL |
| `backend/apphosting.yaml` | Add environment variables and secrets |
| `backend/app/core/config.py` | Already configured for environment variables |

### Frontend Files to Update:

| File | Changes Needed |
|------|----------------|
| `frontend/next.config.ts` | Update image remotePatterns with backend URL |
| `frontend/firebase.json` | Add hosting configuration |
| `.env.production` | Create with all environment variables |

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Backend deployment fails
- Check `apphosting.yaml` syntax
- Verify secrets exist in Secret Manager
- Check service account permissions

**Issue**: CORS errors
- Verify frontend URL is in `allow_origins` list
- Check backend logs: `gcloud logging read "resource.type=cloud_run_revision"`

**Issue**: Environment variables not working
- Verify secrets are created and accessible
- Check secret names match in `apphosting.yaml`
- Verify service account has `secretAccessor` role

### Frontend Issues

**Issue**: Build fails
- Ensure Data Connect SDK is generated: `firebase dataconnect:sdk:generate`
- Check all environment variables are set
- Verify `src/dataconnect-generated/` exists

**Issue**: Backend API calls fail
- Verify `BACKEND_URL` environment variable is set correctly
- Check CORS configuration in backend
- Verify backend is deployed and accessible

**Issue**: Firebase Auth not working
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check Firebase Console → Authentication → Settings
- Verify authorized domains include your frontend URL

**Issue**: Data Connect queries fail
- Verify Data Connect service is deployed
- Check schema matches between frontend and backend
- Verify generated SDK is up to date

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Firebase project created
- [ ] All API keys obtained
- [ ] Secrets created in Secret Manager
- [ ] Service account permissions configured
- [ ] Data Connect schema deployed

### Backend Deployment
- [ ] CORS updated with production frontend URL
- [ ] `apphosting.yaml` configured with secrets
- [ ] Data Connect SDK generated
- [ ] Backend deployed successfully
- [ ] Backend URL saved

### Frontend Deployment
- [ ] `next.config.ts` updated with backend URL
- [ ] `firebase.json` configured for hosting
- [ ] Data Connect SDK generated
- [ ] Environment variables set
- [ ] Frontend built successfully
- [ ] Frontend deployed successfully

### Post-Deployment
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Authentication works
- [ ] Backend API calls succeed
- [ ] Data Connect queries work
- [ ] All features tested

---

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
      - run: firebase deploy --only apphosting:backend --project ${{ secrets.FIREBASE_PROJECT_ID }}
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

  deploy-frontend:
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd frontend && npm install && npm run build
      - run: firebase deploy --only hosting --project ${{ secrets.FIREBASE_PROJECT_ID }}
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
          BACKEND_URL: ${{ secrets.BACKEND_URL }}
```

---

## 📚 Additional Resources

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Data Connect](https://firebase.google.com/docs/data-connect)

---

## 🎯 Quick Reference

**Deploy Backend:**
```bash
cd backend
firebase deploy --only apphosting:backend
```

**Deploy Frontend:**
```bash
cd frontend
firebase dataconnect:sdk:generate
npm run build
firebase deploy --only hosting
```

**Update Environment Variables:**
- Backend: Edit `apphosting.yaml` and redeploy
- Frontend: Update in hosting platform dashboard or `.env.production`

