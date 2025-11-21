# Firebase App Hosting Deployment Guide

## Step 1: Find Your Backend ID

First, you need to find your App Hosting backend ID. You can do this by:

1. **Via Firebase Console:**
   - Go to Firebase Console > Build > App Hosting
   - Click on your site/backend
   - The backend ID will be shown in the URL or details page

2. **Via Firebase CLI:**
   ```powershell
   firebase apphosting:backends:list
   ```

## Step 2: Grant Access to Secrets

Once you have your backend ID, grant access to each secret:

```powershell
# Replace BACKEND_ID with your actual backend ID
$BACKEND_ID = "your-backend-id"

# Grant access to all secrets referenced in apphosting.yaml
firebase apphosting:secrets:grantaccess backend-url-secret --backend $BACKEND_ID
firebase apphosting:secrets:grantaccess firebase-api-key-secret --backend $BACKEND_ID
firebase apphosting:secrets:grantaccess firebase-auth-domain-secret --backend $BACKEND_ID
firebase apphosting:secrets:grantaccess firebase-project-id-secret --backend $BACKEND_ID
firebase apphosting:secrets:grantaccess firebase-storage-bucket-secret --backend $BACKEND_ID
firebase apphosting:secrets:grantaccess firebase-messaging-sender-id-secret --backend $BACKEND_ID
firebase apphosting:secrets:grantaccess firebase-app-id-secret --backend $BACKEND_ID
```

## Step 3: Verify Secrets Exist

Before granting access, make sure all secrets exist in Secret Manager:

```powershell
gcloud secrets list
```

If any are missing, create them:

```powershell
# Example: Create backend-url-secret
echo "https://cse5914-backend-xxxxx-uc.a.run.app" | gcloud secrets create backend-url-secret --data-file=-

# Example: Create Firebase API key secret
echo "your-firebase-api-key" | gcloud secrets create firebase-api-key-secret --data-file=-
```

## Step 4: Deploy

After granting access, deploy your frontend:

```powershell
cd CSE5914\frontend
firebase apphosting:backends:deploy --backend $BACKEND_ID
```

Or use the Firebase Console to trigger a deployment.

