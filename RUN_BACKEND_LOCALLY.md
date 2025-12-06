# Quick Start: Run Backend Locally

## Your Setup

- ✅ **Backend**: Run locally
- ✅ **Frontend**: Hosted online at `https://frontend-app-745486781817.us-central1.run.app`

## Steps

### 1. Start Backend Locally

```powershell
cd CSE5914\backend

# Option A: Use the helper script
.\start-backend-local.ps1

# Option B: Manual start
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Your backend will be running at: **http://localhost:8000**

### 2. Expose Backend to Internet (Tunnel)

Since your frontend is hosted online, you need to expose your local backend using a tunnel.

#### Option A: ngrok (Recommended)

1. Install ngrok: https://ngrok.com/download
2. Sign up and get authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. Authenticate: `ngrok config add-authtoken YOUR_AUTHTOKEN`
4. Start tunnel:
   ```powershell
   ngrok http 8000
   ```
5. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

#### Option B: Cloudflare Tunnel

```powershell
cloudflared tunnel --url http://localhost:8000
```

### 3. Configure Backend CORS

Your backend needs to allow requests from your hosted frontend.

**Option A: Use the helper script** (already configured)

The `start-backend-local.ps1` script sets CORS automatically.

**Option B: Set environment variable**

```powershell
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app"
```

**Option C: Use .env file**

Create `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app
```

### 4. Update Frontend Environment

Update your hosted frontend to use the tunnel URL:

- **Vercel**: Dashboard → Settings → Environment Variables → Update `NEXT_PUBLIC_BACKEND_URL` = `https://your-tunnel-url.ngrok-free.app`
- **Cloud Run**: Rebuild with new environment variable

### 5. Test

1. Visit your hosted frontend
2. Open browser console (F12)
3. Check Network tab - requests should go to your tunnel URL
4. Test backend: Visit `https://your-tunnel-url.ngrok-free.app/health`

## Troubleshooting

### CORS Errors

Make sure your hosted frontend URL is in `CORS_ORIGINS`:
- ✅ `https://frontend-app-745486781817.us-central1.run.app`
- ❌ No trailing slash
- ❌ Must match exactly

### Connection Issues

1. Verify backend is running: `curl http://localhost:8000/health`
2. Verify tunnel is running and forwarding to port 8000
3. Check tunnel URL is correct in frontend environment
4. Test tunnel URL directly: `curl https://your-tunnel-url.ngrok-free.app/health`

## Full Guide

For detailed instructions, see:
- **[LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md](./LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md)** - Complete guide with all options

## Quick Commands

```powershell
# Start backend (Terminal 1)
cd CSE5914\backend
.\start-backend-local.ps1

# Start tunnel (Terminal 2)
ngrok http 8000

# Test backend locally
curl http://localhost:8000/health

# Test backend via tunnel (replace with your tunnel URL)
curl https://your-tunnel-url.ngrok-free.app/health
```

