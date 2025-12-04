# CORS Configuration for Backend

## Current Setup

The backend CORS is configured in `app/main.py` and reads from the `CORS_ORIGINS` environment variable.

## Frontend URL

Your frontend is hosted at: **https://frontend-app-745486781817.us-central1.run.app/**

## Configuration Methods

### Method 1: Using apphosting.yaml (Recommended for Firebase App Hosting)

The `apphosting.yaml` file has been updated with the CORS_ORIGINS environment variable:

```yaml
- variable: CORS_ORIGINS
  value: "http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app"
  availability:
    - RUNTIME
```

**To apply:**
```bash
cd CSE5914/backend
firebase deploy --only apphosting:backend
```

### Method 2: Using Google Cloud Console (If backend is on Cloud Run directly)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Run** → Your backend service
3. Click **Edit & Deploy New Revision**
4. Go to **Variables & Secrets** tab
5. Add environment variable:
   - **Name**: `CORS_ORIGINS`
   - **Value**: `http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app`
6. Click **Deploy**

### Method 3: Using gcloud CLI

```bash
gcloud run services update YOUR_BACKEND_SERVICE_NAME \
  --set-env-vars CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app" \
  --region us-central1
```

## Verify CORS is Working

After updating, test from your frontend:

1. Open browser console on https://frontend-app-745486781817.us-central1.run.app/
2. Try making a request to your backend
3. Check for CORS errors in the console
4. If you see CORS errors, verify:
   - The URL in CORS_ORIGINS matches exactly (no trailing slash)
   - The backend service has been redeployed
   - Environment variable is set correctly

## Adding More Frontend URLs

If you have multiple frontend deployments, add them to the comma-separated list:

```yaml
value: "http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app,https://your-other-domain.com"
```

## Current CORS Configuration

The backend allows:
- ✅ All HTTP methods (`allow_methods=["*"]`)
- ✅ All headers (`allow_headers=["*"]`)
- ✅ Credentials (`allow_credentials=True`)
- ✅ Origins from `CORS_ORIGINS` environment variable

## Troubleshooting

### CORS Error Still Appears

1. **Check the exact URL**: Make sure there's no trailing slash mismatch
   - ✅ `https://frontend-app-745486781817.us-central1.run.app`
   - ❌ `https://frontend-app-745486781817.us-central1.run.app/`

2. **Verify environment variable**: Check backend logs to see what origins are allowed
   ```python
   # Add this temporarily to main.py to debug
   print(f"Allowed CORS origins: {allowed_origins}")
   ```

3. **Check backend deployment**: Ensure the new environment variable is deployed
   ```bash
   # Check current environment variables
   gcloud run services describe YOUR_BACKEND_SERVICE --format="value(spec.template.spec.containers[0].env)"
   ```

4. **Clear browser cache**: Hard refresh (Ctrl+Shift+R) to clear cached CORS headers

### Preflight Request Fails

If OPTIONS requests are failing:
- Verify `allow_methods=["*"]` is set
- Check that backend is responding to OPTIONS requests
- Verify `allow_headers=["*"]` includes all needed headers

