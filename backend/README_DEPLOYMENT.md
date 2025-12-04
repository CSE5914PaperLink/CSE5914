# Deployment Files Overview

This directory contains all files needed to deploy the backend to Google Cloud.

## Files Created

### Core Deployment Files

1. **`Dockerfile`** - Container image definition for the backend
   - Uses Python 3.11 slim base image
   - Installs dependencies using pip and requirements.txt
   - Exposes port 8080 (Cloud Run compatible)
   - Includes health check

2. **`cloudbuild.yaml`** - Google Cloud Build configuration
   - Builds Docker image
   - Pushes to Artifact Registry
   - Deploys to Cloud Run
   - Configurable via substitution variables

3. **`apphosting.yaml`** - Firebase App Hosting configuration
   - Cloud Run settings (CPU, memory, scaling)
   - Environment variables
   - Secret references (commented out, uncomment when ready)

### Ignore Files

4. **`.dockerignore`** - Files excluded from Docker build context
5. **`.gcloudignore`** - Files excluded from gcloud deployments

### Deployment Scripts

6. **`deploy.sh`** - Quick deployment script
   - Automates build and deploy process
   - Creates repository if needed
   - Shows service URL after deployment

### Documentation

7. **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide
   - Step-by-step instructions
   - Multiple deployment options
   - Troubleshooting guide
   - Security best practices

8. **`QUICK_START.md`** - Quick reference guide
   - Minimal steps to get started
   - Common commands
   - Quick troubleshooting

9. **`.env.example`** - Example environment variables
   - Template for local development
   - Documents all required/optional variables

### Alternative Configurations

10. **`Dockerfile.cloudstorage`** - Alternative Dockerfile using Cloud Storage FUSE
    - For ChromaDB persistence via Cloud Storage
    - Requires additional setup

11. **`mount-gcs.sh`** - Script to mount Cloud Storage bucket
    - Used by Dockerfile.cloudstorage
    - Handles GCS bucket mounting

## Quick Deployment

```bash
# 1. Set up Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# 2. Store secrets
echo -n "your-api-key" | gcloud secrets create gemini-api-key --data-file=-

# 3. Deploy
./deploy.sh backend-api us-central1
```

## Configuration Checklist

Before deploying, ensure:

- [ ] Google Cloud project created
- [ ] Required APIs enabled (Cloud Run, Artifact Registry, Secret Manager)
- [ ] Secrets stored in Secret Manager
- [ ] Artifact Registry repository created
- [ ] CORS origins configured (if using custom frontend)
- [ ] ChromaDB persistence strategy decided (local disk, Cloud Storage, or managed DB)

## Environment Variables

### Required
- `GEMINI_API_KEY` - Google Gemini API key

### Optional
- `GITHUB_API_TOKEN` - GitHub API token
- `NOMIC_API_KEY` - Nomic API key
- `CORS_ORIGINS` - Comma-separated frontend URLs
- `CHROMA_PERSIST_PATH` - ChromaDB storage path
- `DEBUG` - Enable debug mode

## Next Steps

1. Review `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Follow `QUICK_START.md` for rapid deployment
3. Configure monitoring and alerts
4. Set up CI/CD pipeline
5. Plan for scaling (see `BACKEND_MODULARIZATION.md`)

