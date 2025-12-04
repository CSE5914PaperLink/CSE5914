# Setup Correct Firebase Project

## Your Project Information
- **Project Name**: PaperLink
- **Project ID**: `paper-477421`

## Issue
The deployment was trying to use the wrong project ID (`praxis-wall-474823-v4`). 

## Solution

### Step 1: Set the Correct Firebase Project

```powershell
# Navigate to your project directory
cd "C:\Users\Athin\OneDrive\Documents\VSCode Work\capstone\CSE5914"

# Set Firebase to use your correct project
firebase use paper-477421

# Verify it's set correctly
firebase projects:list
```

### Step 2: Enable Required APIs for Correct Project

```powershell
# Set gcloud to use your project
gcloud config set project paper-477421

# Enable all required APIs
gcloud services enable firebaseapphosting.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 3: Verify APIs are Enabled

```powershell
# Check if APIs are enabled
gcloud services list --enabled --project=paper-477421 --filter="firebaseapphosting OR run.googleapis"
```

### Step 4: Update .firebaserc (Optional)

You can also update `.firebaserc` to set a default project:

```json
{
  "projects": {
    "default": "paper-477421"
  },
  "targets": {},
  "etags": {}
}
```

### Step 5: Deploy with Correct Project

```powershell
# Make sure you're using the correct project
firebase use paper-477421

# Deploy backend
cd backend
firebase deploy --only apphosting:backend
```

## Quick Commands

```powershell
# Set project in Firebase
firebase use paper-477421

# Set project in gcloud
gcloud config set project paper-477421

# Enable APIs
gcloud services enable firebaseapphosting.googleapis.com run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# Verify
firebase projects:list
gcloud config get-value project
```

## Notes

- Your frontend Data Connect is already configured with the correct project ID (`paper-477421`)
- The backend `apphosting.yaml` has the correct frontend URLs (`paper-477421.web.app`)
- Make sure you're always using `paper-477421` for all Firebase/Google Cloud operations

