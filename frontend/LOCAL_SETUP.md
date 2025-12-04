# Local Development Setup

This guide helps you configure your local frontend to connect to the hosted backend for testing.

## Quick Setup

### 1. Create Environment File

Copy the example environment file:

```bash
cd CSE5914/frontend
cp .env.local.example .env.local
```

### 2. Configure Backend URL

Edit `.env.local` and set your hosted backend URL:

```env
BACKEND_URL=https://backend-api-wirfpvv3kq-uc.a.run.app
NEXT_PUBLIC_BACKEND_URL=https://backend-api-wirfpvv3kq-uc.a.run.app
```

### 3. Configure Firebase (Required)

Get your Firebase configuration from Firebase Console → Project Settings → General:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Update Backend CORS

Your backend needs to allow requests from `http://localhost:3000`. Update the backend:

```bash
# Update backend CORS to include localhost
gcloud run services update backend-api \
    --region us-central1 \
    --set-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000"
```

Or if you want to keep the existing origins and add localhost:

```bash
# Get current CORS origins
CURRENT_ORIGINS=$(gcloud run services describe backend-api \
    --region us-central1 \
    --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGINS')].value)")

# Add localhost to existing origins
gcloud run services update backend-api \
    --region us-central1 \
    --set-env-vars CORS_ORIGINS="${CURRENT_ORIGINS},http://localhost:3000,http://127.0.0.1:3000"
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and will connect to your hosted backend.

## Environment Variables Explained

### Server-side Variables (API Routes)
- `BACKEND_URL` - Used by Next.js API routes (`app/api/**`) to proxy requests to the backend
  - This is NOT exposed to the browser
  - Default: `http://localhost:8000` (if not set)

### Client-side Variables (Browser)
- `NEXT_PUBLIC_BACKEND_URL` - Used by client-side components to make direct API calls
  - This IS exposed to the browser (all `NEXT_PUBLIC_*` variables are)
  - Default: `http://localhost:8000` (if not set)

### Why Two Variables?

- **Server-side** (`BACKEND_URL`): API routes run on the server, so they can use a private variable
- **Client-side** (`NEXT_PUBLIC_BACKEND_URL`): Components run in the browser, so they need a public variable

## Testing the Connection

### 1. Test Backend Health

```bash
# Test backend directly
curl https://backend-api-wirfpvv3kq-uc.a.run.app/health

# Should return: {"status":"ok"}
```

### 2. Test Frontend API Route

```bash
# Test frontend API route (proxies to backend)
curl http://localhost:3000/api/discovery/search?q=machine+learning

# Should return search results from backend
```

### 3. Check Browser Console

Open `http://localhost:3000` in your browser and check the console for any CORS errors or connection issues.

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. **Verify backend CORS is updated**:
   ```bash
   gcloud run services describe backend-api \
       --region us-central1 \
       --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGINS')].value)"
   ```

2. **Check that localhost:3000 is in the list**

3. **Restart the backend service** (if needed):
   ```bash
   # Force a new revision
   gcloud run services update backend-api --region us-central1
   ```

### Connection Refused

If you get connection errors:

1. **Verify backend URL is correct**:
   ```bash
   curl https://backend-api-wirfpvv3kq-uc.a.run.app/health
   ```

2. **Check environment variables**:
   ```bash
   # In your frontend directory
   cat .env.local
   ```

3. **Restart Next.js dev server** after changing `.env.local`

### Environment Variables Not Working

- **Restart dev server**: Next.js only loads `.env.local` on startup
- **Check file name**: Must be exactly `.env.local` (not `.env.local.txt`)
- **Check location**: Must be in the `frontend/` directory (same level as `package.json`)
- **Client-side vars**: Must have `NEXT_PUBLIC_` prefix to be available in browser

## Switching Between Local and Hosted Backend

### Use Hosted Backend (Current Setup)
```env
BACKEND_URL=https://backend-api-wirfpvv3kq-uc.a.run.app
NEXT_PUBLIC_BACKEND_URL=https://backend-api-wirfpvv3kq-uc.a.run.app
```

### Use Local Backend (if running backend locally)
```env
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Next Steps

1. ✅ Configure `.env.local` with your backend URL
2. ✅ Update backend CORS to allow localhost
3. ✅ Install dependencies: `npm install`
4. ✅ Start dev server: `npm run dev`
5. ✅ Test the connection
6. ✅ Start developing!

## Quick Reference

```bash
# Create env file
cp .env.local.example .env.local

# Edit env file (Windows)
notepad .env.local

# Edit env file (Mac/Linux)
nano .env.local

# Install dependencies
npm install

# Run dev server
npm run dev

# Test backend
curl https://backend-api-wirfpvv3kq-uc.a.run.app/health
```

