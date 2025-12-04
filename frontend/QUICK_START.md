# Quick Start: Deploy Frontend to Google Cloud

This is a quick reference guide. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Prerequisites Check

```bash
# Verify you have the required tools
gcloud --version
docker --version
node --version  # Should be 18+

# Login to Google Cloud
gcloud auth login
gcloud auth application-default login
```

## One-Time Setup

### 1. Create Artifact Registry

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION="us-central1"
export REPOSITORY="frontend-repo"

gcloud artifacts repositories create $REPOSITORY \
    --repository-format=docker \
    --location=$REGION
```

### 2. Get Firebase Configuration

Get your Firebase config from Firebase Console → Project Settings → General:

```bash
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="123456789"
export FIREBASE_APP_ID="1:123456789:web:abc123"
```

### 3. Set Backend URL

```bash
export BACKEND_URL="https://backend-api-wirfpvv3kq-uc.a.run.app"
```

## Deploy

### Option 1: Using the deployment script

```bash
chmod +x deploy.sh
./deploy.sh frontend-app us-central1 $BACKEND_URL
```

### Option 2: Manual deployment

```bash
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_REGION=$REGION,_REPOSITORY=$REPOSITORY,_SERVICE_NAME=frontend-app,_BACKEND_URL=$BACKEND_URL,_FIREBASE_API_KEY=$FIREBASE_API_KEY,_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN,_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET,_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID,_FIREBASE_APP_ID=$FIREBASE_APP_ID
```

## Update Backend CORS

After deployment, update your backend to allow the frontend:

```bash
# Get frontend URL
FRONTEND_URL=$(gcloud run services describe frontend-app \
    --region us-central1 \
    --format="value(status.url)")

# Update backend CORS
gcloud run services update backend-api \
    --region us-central1 \
    --set-env-vars CORS_ORIGINS="${FRONTEND_URL}"
```

## Test Deployment

```bash
# Get service URL
FRONTEND_URL=$(gcloud run services describe frontend-app \
    --region us-central1 \
    --format="value(status.url)")

echo "Frontend URL: $FRONTEND_URL"
# Open in browser
```

## Common Issues

### Build fails
- Check that all Firebase environment variables are set
- Verify `package.json` and `package-lock.json` are present
- Ensure Node.js version matches (22)

### Environment variables not working
- `NEXT_PUBLIC_*` variables must be set at build time (in Dockerfile build args)
- Regular variables can be set at runtime

### CORS errors
- Update backend CORS to include frontend URL
- Check that `NEXT_PUBLIC_BACKEND_URL` matches your backend URL

### Firebase auth not working
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set correctly
- Check Firebase project settings
- Ensure Firebase Auth is enabled in Firebase Console

## Next Steps

1. Set up custom domain (optional)
2. Configure monitoring
3. Set up CI/CD pipeline

