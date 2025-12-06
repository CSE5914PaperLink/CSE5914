# Verify and Update Backend CORS

## Step 1: Verify Your Service Name

First, check what your actual backend service name is:

```bash
# List all Cloud Run services
gcloud run services list --region us-central1

# Or get the service name from the URL
# If your backend is at: https://backend-api-wirfpvv3kq-uc.a.run.app
# The service name is likely: backend-api
```

## Step 2: Check Current Environment Variables

Before updating, check what environment variables are currently set:

```bash
gcloud run services describe backend-api \
    --region us-central1 \
    --format="value(spec.template.spec.containers[0].env)"
```

Or to see just CORS_ORIGINS:

```bash
gcloud run services describe backend-api \
    --region us-central1 \
    --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGINS')].value)"
```

## Step 3: Update CORS (Recommended Method)

### Option A: Update Only CORS_ORIGINS (Preserves Other Env Vars)

**Windows (PowerShell):**
```powershell
gcloud run services update backend-api `
    --region us-central1 `
    --update-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000"
```

**Mac/Linux:**
```bash
gcloud run services update backend-api \
    --region us-central1 \
    --update-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000"
```

### Option B: Set CORS_ORIGINS (If No Other Env Vars to Preserve)

**Windows (PowerShell):**
```powershell
gcloud run services update backend-api `
    --region us-central1 `
    --set-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000"
```

**Mac/Linux:**
```bash
gcloud run services update backend-api \
    --region us-central1 \
    --set-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000"
```

**⚠️ Warning**: `--set-env-vars` will REPLACE all environment variables. If you have other env vars (like secrets), use `--update-env-vars` instead.

## Step 4: Verify It Worked

```bash
# Check the updated CORS_ORIGINS
gcloud run services describe backend-api \
    --region us-central1 \
    --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGINS')].value)"
```

You should see: `https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000`

## Step 5: Test the Connection

After updating, wait a few seconds for the new revision to deploy, then test:

```bash
# Test from localhost (simulating browser request)
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://backend-api-wirfpvv3kq-uc.a.run.app/health -v
```

You should see `Access-Control-Allow-Origin: http://localhost:3000` in the response headers.

## Troubleshooting

### Command Fails with "Service not found"
- Check the service name: `gcloud run services list --region us-central1`
- Verify the region is correct

### CORS Still Not Working After Update
1. **Wait for deployment**: It takes 10-30 seconds for the new revision to be active
2. **Check the revision**: 
   ```bash
   gcloud run revisions list --service backend-api --region us-central1
   ```
3. **Force a new revision**: Sometimes you need to trigger a new deployment
4. **Check browser console**: Look for the exact CORS error message

### Preserving Other Environment Variables

If you have other env vars (like secrets), use `--update-env-vars`:

```bash
# First, get all current env vars
gcloud run services describe backend-api \
    --region us-central1 \
    --format="get(spec.template.spec.containers[0].env)" > current-env.yaml

# Then update only CORS_ORIGINS
gcloud run services update backend-api \
    --region us-central1 \
    --update-env-vars CORS_ORIGINS="..."
```

## Quick One-Liner (Recommended)

```bash
gcloud run services update backend-api \
    --region us-central1 \
    --update-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000"
```

This will:
- ✅ Update only the CORS_ORIGINS variable
- ✅ Preserve all other environment variables
- ✅ Work immediately after deployment completes


