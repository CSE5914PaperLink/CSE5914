# Running Backend Locally - Guide Index

This document helps you find the right guide for running your backend locally and connecting it to your frontend.

## Which Guide Should I Use?

### Using Lovable for Frontend?
👉 **Start here: [LOVABLE_QUICK_START.md](./LOVABLE_QUICK_START.md)**

### Using Other Hosting (Cloud Run, Vercel, etc.)?
👉 **Start here: [RUN_BACKEND_LOCALLY.md](./RUN_BACKEND_LOCALLY.md)**

### Want Complete Details?
👉 **Read: [LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md](./LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md)**

---

## Quick Overview

### The Problem
Your frontend is hosted online, but you want to run your backend locally for development. Online frontends can't access `localhost` on your machine.

### The Solution
Use a tunnel service (like ngrok or Cloudflare Tunnel) to expose your local backend to the internet, then configure your frontend to use the tunnel URL.

### The Steps
1. Start backend locally on port 8000
2. Create tunnel to expose backend to internet
3. Update frontend environment variables to use tunnel URL
4. Configure backend CORS to allow your frontend domain

---

## All Available Guides

### Quick Start Guides
- **[LOVABLE_QUICK_START.md](./LOVABLE_QUICK_START.md)** - 3-step guide for Lovable users
- **[HOW_TO_RUN_BACKEND_LOCALLY.md](./HOW_TO_RUN_BACKEND_LOCALLY.md)** - General quick start

### Complete Guides
- **[LOVABLE_BACKEND_SETUP.md](./LOVABLE_BACKEND_SETUP.md)** - Complete guide for Lovable
- **[LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md](./LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md)** - Complete guide for any hosting platform

### Reference Guides
- **[RUN_BACKEND_LOCALLY.md](./RUN_BACKEND_LOCALLY.md)** - Quick reference with commands
- **[backend/CORS_SETUP.md](./backend/CORS_SETUP.md)** - CORS configuration details

### For Running Both Locally
- **[LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)** - Run both backend and frontend locally

---

## Helper Scripts

Located in `backend/` directory:

- **`start-backend-local.ps1`** - Start backend with CORS for Cloud Run frontend
- **`start-backend-for-lovable.ps1`** - Start backend with CORS for Lovable frontend (prompts for URL)

---

## Common Commands

### Start Backend
```powershell
cd CSE5914\backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Start Tunnel (ngrok)
```powershell
ngrok http 8000
```

### Test Backend
```powershell
curl http://localhost:8000/health
curl https://your-tunnel-url.ngrok-free.app/health
```

---

## Need Help?

1. **CORS Errors?** Check that your frontend URL is in `CORS_ORIGINS`
2. **Connection Issues?** Verify backend and tunnel are both running
3. **URL Changed?** Update frontend environment variables and redeploy

See the detailed guides above for troubleshooting steps.

---

## What You'll Need

- Python 3.11+ with Poetry
- ngrok account (free) or Cloudflare Tunnel
- Your frontend hosting platform account (Lovable, Vercel, etc.)
- Your frontend URL

---

**Ready to start?** Pick the guide that matches your frontend hosting platform above!

