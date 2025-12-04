# Google Cloud Deployment Guide

This guide walks you through deploying the backend to Google Cloud Platform (GCP).

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud CLI**: Install from [cloud.google.com/sdk](https://cloud.google.com/sdk)
3. **Docker**: Install Docker Desktop or Docker Engine
4. **Firebase CLI** (optional, for Firebase App Hosting): `npm install -g firebase-tools`

## Initial Setup

### 1. Create a Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create YOUR_PROJECT_ID --name="Your Project Name"

# Set the project as default
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com
```

### 2. Configure Firebase (if using Firebase App Hosting)

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Set your project in .firebaserc
# Edit .firebaserc and add:
# {
#   "projects": {
#     "default": "YOUR_PROJECT_ID"
#   }
# }
```

## Option 1: Deploy to Cloud Run (Recommended)

Cloud Run is a fully managed serverless platform that automatically scales your containers.

### Step 1: Create Artifact Registry Repository

```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export REGION=us-central1
export REPOSITORY=backend-repo
export SERVICE_NAME=backend-api

# Create Artifact Registry repository
gcloud artifacts repositories create ${REPOSITORY} \
    --repository-format=docker \
    --location=${REGION} \
    --description="Backend API Docker repository"
```

### Step 2: Store Secrets in Secret Manager

```bash
# Store Gemini API key
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"

# Store GitHub token (optional)
echo -n "your-github-token" | gcloud secrets create github-api-token \
    --data-file=- \
    --replication-policy="automatic"

# Store Nomic API key (optional)
echo -n "your-nomic-api-key" | gcloud secrets create nomic-api-key \
    --data-file=- \
    --replication-policy="automatic"

# Grant Cloud Run service account access to secrets
export PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Step 3: Build and Deploy

#### Method A: Using Cloud Build (Recommended)

```bash
# Submit build with substitutions
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_REGION=${REGION},_REPOSITORY=${REPOSITORY},_SERVICE_NAME=${SERVICE_NAME}
```

#### Method B: Manual Build and Deploy

```bash
# Build the Docker image
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest .

# Authenticate Docker to Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Push the image
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest

# Deploy to Cloud Run
gcloud run deploy ${SERVICE_NAME} \
    --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --memory 4Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --set-env-vars PORT=8080 \
    --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
    --set-secrets GITHUB_API_TOKEN=github-api-token:latest \
    --set-secrets NOMIC_API_KEY=nomic-api-key:latest
```

### Step 4: Configure Environment Variables

```bash
# Set CORS origins (replace with your frontend URL)
gcloud run services update ${SERVICE_NAME} \
    --region ${REGION} \
    --set-env-vars CORS_ORIGINS="https://your-frontend-domain.com,https://www.your-frontend-domain.com"
```

### Step 5: Get Service URL

```bash
# Get the service URL
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format="value(status.url)"

# Test the health endpoint
curl https://YOUR_SERVICE_URL/health
```

## Option 2: Deploy via Firebase App Hosting

Firebase App Hosting provides a simpler deployment workflow integrated with Firebase.

### Step 1: Configure apphosting.yaml

The `apphosting.yaml` file is already configured. Update it with your secrets:

```yaml
env:
  - variable: GEMINI_API_KEY
    secret: gemini-api-key
    availability:
      - RUNTIME
  # Add other secrets as needed
```

### Step 2: Deploy

```bash
# From the backend directory
firebase apphosting:backends:create

# Deploy
firebase deploy --only apphosting
```

## Option 3: Deploy with Persistent Storage for ChromaDB

ChromaDB needs persistent storage. For production, consider:

### Option A: Cloud Storage (Recommended)

1. Create a Cloud Storage bucket:
```bash
gsutil mb -p ${PROJECT_ID} -l ${REGION} gs://${PROJECT_ID}-chromadb
```

2. Mount Cloud Storage using Cloud Storage FUSE (requires custom Dockerfile):
   - See `Dockerfile.cloudstorage` example below

### Option B: Persistent Disk (For Cloud Run with VPC)

1. Create a persistent disk:
```bash
gcloud compute disks create chromadb-disk \
    --size=100GB \
    --type=pd-standard \
    --zone=${REGION}-a
```

2. Mount it in Cloud Run (requires VPC connector)

### Option C: Managed Vector DB

Consider migrating to:
- **Pinecone**: Managed vector database
- **Weaviate Cloud**: Managed Weaviate
- **Qdrant Cloud**: Managed Qdrant

## Environment Variables

### Required
- `GEMINI_API_KEY`: Google Gemini API key

### Optional
- `GITHUB_API_TOKEN`: GitHub API token (for higher rate limits)
- `NOMIC_API_KEY`: Nomic API key (if using Nomic embeddings API)
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins
- `CHROMA_PERSIST_PATH`: Path for ChromaDB storage (default: `./chroma`)
- `DEBUG`: Enable debug mode (default: `false`)

## Monitoring and Logging

### View Logs

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}" --limit 50

# Or use the Cloud Console
# https://console.cloud.google.com/run
```

### Set Up Alerts

1. Go to Cloud Monitoring
2. Create alert policies for:
   - Error rate > 5%
   - Latency > 5 seconds
   - Memory usage > 80%

## Cost Optimization

1. **Set min-instances to 0**: Scale to zero when not in use
2. **Use Cloud Storage for ChromaDB**: Cheaper than persistent disks
3. **Monitor API usage**: Gemini API costs can add up
4. **Set max-instances**: Prevent runaway costs

## Troubleshooting

### Container won't start
- Check logs: `gcloud run services logs read ${SERVICE_NAME}`
- Verify environment variables are set
- Check secret permissions

### Out of memory errors
- Increase memory: `--memory 8Gi`
- Check ChromaDB size
- Monitor memory usage in Cloud Console

### Cold start issues
- Set `min-instances: 1` (costs more)
- Optimize Docker image size
- Pre-warm the service

### ChromaDB data not persisting
- Use Cloud Storage or persistent disk
- Check volume mounts
- Verify write permissions

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'
      
      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v1'
      
      - name: 'Deploy to Cloud Run'
        run: |
          gcloud builds submit --config=cloudbuild.yaml
```

## Security Best Practices

1. **Never commit secrets**: Use Secret Manager
2. **Enable IAM**: Restrict who can deploy
3. **Use VPC**: For internal service communication
4. **Enable audit logs**: Track all changes
5. **Rotate secrets**: Regularly update API keys

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain
3. Set up CI/CD pipeline
4. Plan for scaling (see BACKEND_MODULARIZATION.md)
5. Set up backup strategy for ChromaDB

## Support

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)

