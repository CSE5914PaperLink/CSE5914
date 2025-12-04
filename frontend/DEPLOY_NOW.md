# Deploy Frontend Now - Step by Step

Follow these steps to deploy your frontend to Google Cloud Run.

## Step 1: Get Your Firebase Configuration

If you already have `.env.local`, you can get the values from there. Otherwise, get them from Firebase Console → Project Settings → General.

**Windows (PowerShell):**
```powershell
# Read from .env.local if it exists
Get-Content .env.local | Select-String "NEXT_PUBLIC_FIREBASE"
```

**Mac/Linux:**
```bash
# Read from .env.local if it exists
grep NEXT_PUBLIC_FIREBASE .env.local
```

Or get them manually from Firebase Console.

## Step 2: Set Environment Variables

**Windows (PowerShell):**
```powershell
$env:FIREBASE_API_KEY="your-api-key"
$env:FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
$env:FIREBASE_PROJECT_ID="your-project-id"
$env:FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
$env:FIREBASE_MESSAGING_SENDER_ID="123456789"
$env:FIREBASE_APP_ID="1:123456789:web:abc123"
$env:BACKEND_URL="https://backend-api-wirfpvv3kq-uc.a.run.app"
```

**Mac/Linux:**
```bash
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
export FIREBASE_MESSAGING_SENDER_ID="123456789"
export FIREBASE_APP_ID="1:123456789:web:abc123"
export BACKEND_URL="https://backend-api-wirfpvv3kq-uc.a.run.app"
```

## Step 3: Create Artifact Registry (One-time)

```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export REGION="us-central1"
export REPOSITORY="frontend-repo"

# Create repository (skip if already exists)
gcloud artifacts repositories create $REPOSITORY \
    --repository-format=docker \
    --location=$REGION \
    --description="Frontend Next.js Docker repository" 2>/dev/null || echo "Repository already exists"
```

## Step 4: Deploy!

**Option A: Using the deploy script (Easiest)**

**Mac/Linux:**
```bash
cd CSE5914/frontend
chmod +x deploy.sh
./deploy.sh frontend-app us-central1 $BACKEND_URL
```

**Windows (PowerShell):**
You'll need to run the gcloud command directly (see Option B) or use WSL.

**Option B: Manual deployment (Works everywhere)**

**Windows (PowerShell):**
```powershell
cd CSE5914\frontend

gcloud builds submit --config=cloudbuild.yaml `
    --substitutions=_REGION=us-central1,_REPOSITORY=frontend-repo,_SERVICE_NAME=frontend-app,_BACKEND_URL=$env:BACKEND_URL,_FIREBASE_API_KEY=$env:FIREBASE_API_KEY,_FIREBASE_AUTH_DOMAIN=$env:FIREBASE_AUTH_DOMAIN,_FIREBASE_PROJECT_ID=$env:FIREBASE_PROJECT_ID,_FIREBASE_STORAGE_BUCKET=$env:FIREBASE_STORAGE_BUCKET,_FIREBASE_MESSAGING_SENDER_ID=$env:FIREBASE_MESSAGING_SENDER_ID,_FIREBASE_APP_ID=$env:FIREBASE_APP_ID
```

**Mac/Linux:**
```bash
cd CSE5914/frontend

gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_REGION=us-central1,_REPOSITORY=frontend-repo,_SERVICE_NAME=frontend-app,_BACKEND_URL=$BACKEND_URL,_FIREBASE_API_KEY=$FIREBASE_API_KEY,_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN,_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET,_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID,_FIREBASE_APP_ID=$FIREBASE_APP_ID
```

This will take 5-15 minutes. The build will:
1. Build the Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run

## Step 5: Get Your Frontend URL

After deployment completes, get your frontend URL:

```bash
gcloud run services describe frontend-app \
    --region us-central1 \
    --format="value(status.url)"
```

Save this URL - you'll need it for the next step!

## Step 6: Update Backend CORS

Update your backend to allow requests from the frontend:

**Windows (PowerShell):**
```powershell
$FRONTEND_URL = gcloud run services describe frontend-app --region us-central1 --format="value(status.url)"

gcloud run services update backend-api `
    --region us-central1 `
    --update-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000,$FRONTEND_URL"
```

**Mac/Linux:**
```bash
FRONTEND_URL=$(gcloud run services describe frontend-app \
    --region us-central1 \
    --format="value(status.url)")

gcloud run services update backend-api \
    --region us-central1 \
    --update-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000,${FRONTEND_URL}"
```

## Step 7: Test Your Deployment

1. Open your frontend URL in a browser
2. Check the browser console (F12) for any errors
3. Try using the app features

## Troubleshooting

### Build fails
- Check that all Firebase environment variables are set
- Verify `package.json` exists
- Check build logs: `gcloud builds list --limit=1`

### Deployment fails
- Check service name doesn't conflict
- Verify you have Cloud Run permissions
- Check logs: `gcloud run services logs read frontend-app --region us-central1`

### CORS errors after deployment
- Make sure you ran Step 6 (update backend CORS)
- Wait 10-30 seconds after updating CORS
- Check backend CORS: `gcloud run services describe backend-api --region us-central1 --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGINS')].value)"`

## Quick One-Liner (After Setting Env Vars)

**Mac/Linux:**
```bash
cd CSE5914/frontend && \
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=_REGION=us-central1,_REPOSITORY=frontend-repo,_SERVICE_NAME=frontend-app,_BACKEND_URL=$BACKEND_URL,_FIREBASE_API_KEY=$FIREBASE_API_KEY,_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN,_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET,_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID,_FIREBASE_APP_ID=$FIREBASE_APP_ID && \
FRONTEND_URL=$(gcloud run services describe frontend-app --region us-central1 --format="value(status.url)") && \
echo "Frontend deployed at: $FRONTEND_URL" && \
gcloud run services update backend-api --region us-central1 --update-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000,${FRONTEND_URL}" && \
echo "Backend CORS updated!"
```

