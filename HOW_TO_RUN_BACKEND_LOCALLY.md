# How to Run Backend Locally

## Your Situation

- ✅ Backend: Run locally on your machine
- ✅ Frontend: Hosted online (Lovable, Cloud Run, Vercel, etc.)

## Quick Start

### Step 1: Start Backend

```powershell
cd CSE5914\backend
.\start-backend-local.ps1
```

Or manually:
```powershell
cd CSE5914\backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend runs at: **http://localhost:8000**

### Step 2: Expose Backend to Internet

Your hosted frontend can't access `localhost`, so you need a tunnel:

**Using ngrok:**
```powershell
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Step 3: Update Frontend Environment

Set your hosted frontend's `NEXT_PUBLIC_BACKEND_URL` to the tunnel URL.

### Step 4: Configure CORS

The backend needs to allow your hosted frontend. The `start-backend-local.ps1` script does this automatically, or set:

```powershell
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app"
```

## Detailed Guides

**For Lovable:**
- **[LOVABLE_QUICK_START.md](./LOVABLE_QUICK_START.md)** - Quick 3-step guide for Lovable
- **[LOVABLE_BACKEND_SETUP.md](./LOVABLE_BACKEND_SETUP.md)** - Complete Lovable setup guide

**For Other Hosting:**
- **[RUN_BACKEND_LOCALLY.md](./RUN_BACKEND_LOCALLY.md)** - Quick reference
- **[LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md](./LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md)** - Complete guide with all options

## Troubleshooting

**CORS Errors?**
- Make sure your hosted frontend URL is in `CORS_ORIGINS`
- No trailing slashes
- Must match exactly

**Connection Issues?**
- Verify backend: `curl http://localhost:8000/health`
- Verify tunnel is running
- Test tunnel URL: `curl https://your-tunnel-url.ngrok-free.app/health`

## Next Steps

1. ✅ Install ngrok or cloudflared
2. ✅ Start backend locally
3. ✅ Start tunnel
4. ✅ Update frontend environment
5. ✅ Test!

