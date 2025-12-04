# Frontend Deployment Guide - Google Cloud

This guide walks you through deploying the Next.js frontend to Google Cloud Platform.

## Prerequisites

1. **Google Cloud Account**: Same project as backend
2. **Google Cloud CLI**: Already installed
3. **Backend API**: Deployed and accessible (e.g., `https://backend-api-wirfpvv3kq-uc.a.run.app`)
4. **Firebase Project**: Configured with authentication

## Initial Setup

### 1. Create Artifact Registry Repository

```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export REGION=us-central1
export REPOSITORY=frontend-repo

# Create Artifact Registry repository
gcloud artifacts repositories create ${REPOSITORY} \
    --repository-format=docker \
    --location=${REGION} \
    --description="Frontend Next.js Docker repository"
```

### 2. Get Firebase Configuration

You need your Firebase configuration values. Get them from:
- Firebase Console → Project Settings → General → Your apps

You'll need:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. Set Your Backend URL

```bash
export BACKEND_URL="https://backend-api-wirfpvv3kq-uc.a.run.app"
```

## Deployment

### Option 1: Using Cloud Build (Recommended)

```bash
# Set all your Firebase config variables
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="123456789"
export FIREBASE_APP_ID="1:123456789:web:abc123"

# Deploy
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_REGION=${REGION},_REPOSITORY=${REPOSITORY},_SERVICE_NAME=frontend-app,_BACKEND_URL=${BACKEND_URL},_FIREBASE_API_KEY=${FIREBASE_API_KEY},_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN},_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID},_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET},_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID},_FIREBASE_APP_ID=${FIREBASE_APP_ID}
```

### Option 2: Manual Build and Deploy

```bash
# Build the Docker image
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="${FIREBASE_API_KEY}" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="${FIREBASE_AUTH_DOMAIN}" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID}" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET}" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="${FIREBASE_MESSAGING_SENDER_ID}" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="${FIREBASE_APP_ID}" \
  --build-arg NEXT_PUBLIC_BACKEND_URL="${BACKEND_URL}" \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/frontend-app:latest .

# Authenticate Docker
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Push the image
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/frontend-app:latest

# Deploy to Cloud Run
gcloud run deploy frontend-app \
    --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/frontend-app:latest \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --set-env-vars BACKEND_URL=${BACKEND_URL}
```

## Update Backend CORS

After deploying, update your backend to allow requests from the frontend domain:

```bash
# Get your frontend URL
FRONTEND_URL=$(gcloud run services describe frontend-app \
    --region us-central1 \
    --format="value(status.url)")

# Update backend CORS
gcloud run services update backend-api \
    --region us-central1 \
    --set-env-vars CORS_ORIGINS="${FRONTEND_URL}"
```

## Environment Variables

### Build-time (NEXT_PUBLIC_*)
These are baked into the Next.js build and exposed to the browser:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BACKEND_URL`

### Runtime (Server-side)
- `BACKEND_URL` - Used by API routes to proxy to backend

## Testing Deployment

```bash
# Get service URL
FRONTEND_URL=$(gcloud run services describe frontend-app \
    --region us-central1 \
    --format="value(status.url)")

echo "Frontend URL: ${FRONTEND_URL}"

# Test health endpoint (if you add one)
curl ${FRONTEND_URL}/api/health

# Open in browser
echo "Open: ${FRONTEND_URL}"
```

## Troubleshooting

### Build fails with "Cannot find module"
- Ensure `package.json` and `package-lock.json` are committed
- Check that all dependencies are listed in `package.json`

### Environment variables not working
- `NEXT_PUBLIC_*` variables must be set at build time
- Regular variables can be set at runtime

### CORS errors
- Update backend CORS to include frontend URL
- Check that `NEXT_PUBLIC_BACKEND_URL` is set correctly

### Firebase auth not working
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check Firebase project settings
- Ensure Firebase Auth is enabled

## Next Steps

1. Set up custom domain (optional)
2. Configure Cloud CDN for static assets
3. Set up monitoring and alerts
4. Configure Firebase Hosting for static export (optional)

