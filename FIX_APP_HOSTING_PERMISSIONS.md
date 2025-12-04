# Fix Firebase App Hosting Permission Error

## Error
```
Error: Request to https://serviceusage.googleapis.com/v1/projects/YOUR_PROJECT_ID/services/firebaseapphosting.googleapis.com had HTTP Error: 403, Permission denied to get service [firebaseapphosting.googleapis.com]
```

**Note**: Replace `YOUR_PROJECT_ID` with your actual project ID (e.g., `paper-477421`)

## Solution

This error occurs because:
1. Firebase App Hosting API is not enabled for your project
2. Your account doesn't have the necessary permissions

### Step 1: Enable Firebase App Hosting API

**Option A: Using Google Cloud Console (Recommended)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `praxis-wall-474823-v4`
3. Navigate to **APIs & Services** → **Library**
4. Search for "Firebase App Hosting API"
5. Click on it and click **Enable**

**Option B: Using gcloud CLI**

```powershell
# Set your project (replace with your actual project ID)
gcloud config set project paper-477421

# Enable the Firebase App Hosting API
gcloud services enable firebaseapphosting.googleapis.com
```

**Option C: Using Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Navigate to **APIs** tab
5. Enable **Firebase App Hosting API**

### Step 2: Verify Permissions

Your account needs the following IAM roles:
- `Firebase Admin` or
- `Editor` or
- `Owner`

**Check your permissions:**

```powershell
# Check current project
gcloud config get-value project

# List your IAM roles for the project (replace with your project ID)
gcloud projects get-iam-policy paper-477421 --flatten="bindings[].members" --filter="bindings.members:user:YOUR_EMAIL" --format="table(bindings.role)"
```

**If you need to request permissions:**
- Contact your project owner/administrator
- Or if you're the owner, ensure you're using the correct account

### Step 3: Enable Required APIs

Firebase App Hosting also requires these APIs to be enabled:

```powershell
# Set your project (replace with your actual project ID)
gcloud config set project paper-477421

# Enable all required APIs
gcloud services enable \
  firebaseapphosting.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

### Step 4: Verify API is Enabled

```powershell
# Check if API is enabled (replace with your project ID)
gcloud services list --enabled --project=paper-477421 --filter="name:firebaseapphosting.googleapis.com"
```

### Step 5: Retry Deployment

After enabling the API, wait a few minutes for it to propagate, then retry:

```powershell
# Make sure you're using the correct project
cd CSE5914
firebase use paper-477421

# Deploy backend
cd backend
firebase deploy --only apphosting:backend
```

## Alternative: Use Cloud Run Directly

If Firebase App Hosting continues to have issues, you can deploy directly to Cloud Run:

### Create Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Deploy to Cloud Run

```powershell
# Set your project
gcloud config set project paper-477421

cd backend

# Build and deploy
gcloud run deploy backend \
  --source . \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --set-env-vars "DEBUG=false,ALLOWED_ORIGINS=http://localhost:3000,https://paper-477421.web.app,https://paper-477421.firebaseapp.com" \
  --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"
```

## Troubleshooting

### Still Getting 403 Error?

1. **Wait a few minutes** - API enablement can take 1-5 minutes to propagate
2. **Check billing** - Ensure billing is enabled for your project
3. **Verify project** - Make sure you're using the correct project:
   ```powershell
   firebase use paper-477421
   ```
4. **Check Firebase CLI version**:
   ```powershell
   firebase --version
   # Update if needed: npm install -g firebase-tools@latest
   ```

### Check Project Billing

Firebase App Hosting requires a billing account:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **Billing** → **Account Management**
4. Ensure billing is enabled

## Quick Fix Script

Run this PowerShell script to enable everything:

```powershell
# Set project (replace with your actual project ID)
$PROJECT_ID = "paper-477421"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable firebaseapphosting.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Wait a bit
Write-Host "Waiting 30 seconds for APIs to propagate..."
Start-Sleep -Seconds 30

# Verify
gcloud services list --enabled --filter="name:firebaseapphosting.googleapis.com"

Write-Host "APIs enabled! Try deploying again."
```

