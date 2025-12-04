#!/bin/bash
# Quick deployment script for Next.js frontend
# Usage: ./deploy.sh [service-name] [region] [backend-url]

set -e

# Configuration
PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project)}
REGION=${REGION:-us-central1}
REPOSITORY=${REPOSITORY:-frontend-repo}
SERVICE_NAME=${1:-frontend-app}
REGION=${2:-$REGION}
BACKEND_URL=${3:-https://backend-api-wirfpvv3kq-uc.a.run.app}

echo "🚀 Deploying Next.js Frontend to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo "Repository: $REPOSITORY"
echo "Backend URL: $BACKEND_URL"

# Check if repository exists
if ! gcloud artifacts repositories describe $REPOSITORY --location=$REGION &>/dev/null; then
    echo "📦 Creating Artifact Registry repository..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Frontend Next.js Docker repository"
fi

# Check for Firebase environment variables
if [ -z "$FIREBASE_API_KEY" ] || [ -z "$FIREBASE_PROJECT_ID" ]; then
    echo "⚠️  Warning: Firebase environment variables not set!"
    echo "Please set the following environment variables:"
    echo "  FIREBASE_API_KEY"
    echo "  FIREBASE_AUTH_DOMAIN"
    echo "  FIREBASE_PROJECT_ID"
    echo "  FIREBASE_STORAGE_BUCKET"
    echo "  FIREBASE_MESSAGING_SENDER_ID"
    echo "  FIREBASE_APP_ID"
    echo ""
    echo "Or pass them as build arguments in cloudbuild.yaml"
    exit 1
fi

# Build and deploy
echo "🔨 Building and deploying..."
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_REGION=$REGION,_REPOSITORY=$REPOSITORY,_SERVICE_NAME=$SERVICE_NAME,_BACKEND_URL=$BACKEND_URL,_FIREBASE_API_KEY=${FIREBASE_API_KEY},_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN},_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID},_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET},_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID},_FIREBASE_APP_ID=${FIREBASE_APP_ID}

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.url)")

echo "✅ Deployment complete!"
echo "🌐 Frontend URL: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update backend CORS to allow: $SERVICE_URL"
echo "2. Test the frontend: $SERVICE_URL"

