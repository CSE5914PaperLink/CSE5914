#!/bin/bash
# Quick deployment script for Google Cloud Run
# Usage: ./deploy.sh [service-name] [region]

set -e

# Configuration
PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project)}
REGION=${REGION:-us-central1}
REPOSITORY=${REPOSITORY:-backend-repo}
SERVICE_NAME=${1:-backend-api}
REGION=${2:-$REGION}

echo "🚀 Deploying to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo "Repository: $REPOSITORY"

# Check if repository exists, create if not
if ! gcloud artifacts repositories describe $REPOSITORY --location=$REGION &>/dev/null; then
    echo "📦 Creating Artifact Registry repository..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Backend API Docker repository"
fi

# Build and deploy using Cloud Build
echo "🔨 Building and deploying..."
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_REGION=$REGION,_REPOSITORY=$REPOSITORY,_SERVICE_NAME=$SERVICE_NAME

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.url)")

echo "✅ Deployment complete!"
echo "🌐 Service URL: $SERVICE_URL"
echo "💚 Health check: $SERVICE_URL/health"

