# Quick Start: Deploy to Google Cloud

This is a quick reference guide. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Prerequisites Check

```bash
# Verify you have the required tools
gcloud --version
docker --version
python --version  # Should be 3.11+

# Login to Google Cloud
gcloud auth login
gcloud auth application-default login
```

## One-Time Setup

### 1. Create Project and Enable APIs

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com
```

### 2. Create Artifact Registry

```bash
export REGION="us-central1"
export REPOSITORY="backend-repo"

gcloud artifacts repositories create $REPOSITORY \
    --repository-format=docker \
    --location=$REGION
```

### 3. Store Secrets

```bash
# Store Gemini API key (required)
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"

# Grant access to Cloud Run
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Deploy

### Option 1: Using the deployment script

```bash
chmod +x deploy.sh
./deploy.sh backend-api us-central1
```

### Option 2: Manual deployment

```bash
# Build and deploy
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_REGION=us-central1,_REPOSITORY=backend-repo,_SERVICE_NAME=backend-api

# Or deploy directly
gcloud run deploy backend-api \
    --source . \
    --region us-central1 \
    --memory 4Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 10 \
    --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

## Configure CORS (After First Deployment)

```bash
# Replace with your frontend URL
gcloud run services update backend-api \
    --region us-central1 \
    --set-env-vars CORS_ORIGINS="https://your-frontend.com"
```

## Test Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe backend-api \
    --region us-central1 \
    --format="value(status.url)")

# Test health endpoint
curl $SERVICE_URL/health

# Test root endpoint
curl $SERVICE_URL/
```

## View Logs

```bash
gcloud run services logs read backend-api --region us-central1 --limit 50
```

## Update Deployment

```bash
# Just run the deploy script again
./deploy.sh backend-api us-central1
```

## Common Issues

### Build timeout errors
If you get "context deadline exceeded" or timeout errors:

1. **The timeout has been increased to 1 hour** - this should handle most cases
2. **Try building locally first** to test:
   ```bash
   docker build -t backend-test .
   ```
3. **If still timing out**, the dependencies are very heavy. Options:
   - Use the optimized Dockerfile: `docker build -f Dockerfile.optimized -t backend-test .`
   - Build in stages (build image separately, then deploy)
   - Consider removing unused heavy dependencies (gpt4all, docling if not needed)

### "Permission denied" errors
```bash
# Grant yourself necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$(gcloud config get-value account)" \
    --role="roles/run.admin"
```

### "Secret not found" errors
- Verify secret exists: `gcloud secrets list`
- Check IAM permissions for the service account

### Container won't start
- Check logs: `gcloud run services logs read backend-api --region us-central1`
- Verify all required environment variables are set

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain
3. Set up CI/CD pipeline
4. Plan for ChromaDB persistence (see DEPLOYMENT_GUIDE.md)

