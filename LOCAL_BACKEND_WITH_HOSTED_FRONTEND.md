# Running Backend Locally with Hosted Frontend

This guide shows you how to run your backend locally and expose it to the internet so your hosted frontend can connect to it.

## Overview

When your frontend is hosted online (e.g., on Cloud Run, Vercel, or Firebase Hosting), it cannot directly access a backend running on `localhost` on your machine. You need to expose your local backend to the internet using a tunnel service.

**What you'll do:**
1. Start your backend locally on port 8000
2. Create a tunnel to expose it to the internet
3. Update your hosted frontend's environment to use the tunnel URL
4. Update backend CORS to allow your hosted frontend domain

---

## Option 1: Using ngrok (Recommended)

### Step 1: Install ngrok

**Windows:**
1. Download from https://ngrok.com/download
2. Extract the `.exe` file to a folder in your PATH (or use it directly)
3. Sign up for a free account at https://dashboard.ngrok.com/signup
4. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
5. Authenticate: `ngrok config add-authtoken YOUR_AUTHTOKEN`

**Mac (Homebrew):**
```bash
brew install ngrok/ngrok/ngrok
ngrok config add-authtoken YOUR_AUTHTOKEN
```

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### Step 2: Start Your Backend Locally

**Terminal 1 - Backend:**
```powershell
cd CSE5914\backend
poetry install  # First time only
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Wait until you see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 3: Create Tunnel with ngrok

**Terminal 2 - Tunnel:**
```powershell
ngrok http 8000
```

You'll see output like:
```
Forwarding  https://abc123xyz.ngrok-free.app -> http://localhost:8000
```

**Copy the HTTPS URL** (e.g., `https://abc123xyz.ngrok-free.app`) - this is your tunnel URL!

**Note:** With a free ngrok account, the URL changes each time you restart ngrok. Consider the paid plan for a static URL.

### Step 4: Update Backend CORS

Your backend needs to allow requests from your hosted frontend. Update the backend's CORS configuration:

**Option A: Using Environment Variable (Recommended for local development)**

Create or update `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app
```

Then restart your backend (it should auto-reload if using --reload flag).

**Option B: Start backend with environment variable:**

```powershell
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app"
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Your hosted frontend URL:** `https://frontend-app-745486781817.us-central1.run.app`

Replace this with your actual hosted frontend URL if different.

### Step 5: Update Hosted Frontend Environment Variables

You need to temporarily update your hosted frontend to point to your tunnel URL.

**Option A: Vercel**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_BACKEND_URL` to your ngrok URL (e.g., `https://abc123xyz.ngrok-free.app`)
4. Redeploy your frontend or wait for automatic redeploy

**Option B: Cloud Run / Firebase Hosting**
You'll need to rebuild and redeploy with the new environment variable, or use a platform-specific method to update environment variables.

**Option C: Quick Test (Browser Only)**
If you just want to test quickly, you can manually override the backend URL in your browser's console:
```javascript
localStorage.setItem('backend_url', 'https://abc123xyz.ngrok-free.app');
```
Then refresh your frontend. (This only works if your frontend code supports this override.)

### Step 6: Test the Connection

1. Visit your hosted frontend: `https://frontend-app-745486781817.us-central1.run.app`
2. Open browser developer tools (F12)
3. Check the Network tab - requests should go to your ngrok URL
4. Check the Console for any CORS errors
5. Test backend health: Visit `https://abc123xyz.ngrok-free.app/health` directly

---

## Option 2: Using Cloudflare Tunnel (cloudflared)

Cloudflare Tunnel is free and provides stable URLs.

### Step 1: Install cloudflared

**Windows:**
Download from https://github.com/cloudflare/cloudflared/releases

**Mac (Homebrew):**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Or use the installer:**
https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

### Step 2: Start Your Backend

Same as ngrok - start backend on port 8000.

### Step 3: Create Tunnel

```powershell
cloudflared tunnel --url http://localhost:8000
```

You'll get a URL like:
```
https://random-name.trycloudflare.com
```

### Step 4-6: Same as ngrok

Follow steps 4-6 from the ngrok section above, using your Cloudflare tunnel URL instead.

---

## Option 3: Using localtunnel

Localtunnel is simple and doesn't require signup.

### Step 1: Install localtunnel

```powershell
npm install -g localtunnel
```

### Step 2: Start Backend

Same as before.

### Step 3: Create Tunnel

```powershell
lt --port 8000
```

You'll get a URL like:
```
https://random-name.loca.lt
```

**Note:** localtunnel shows a warning page on first visit - you need to click through it.

### Step 4-6: Same as ngrok

Follow steps 4-6 from the ngrok section above.

---

## Complete Setup Example (ngrok)

Here's a complete example using ngrok:

### Terminal 1: Backend
```powershell
cd CSE5914\backend

# Set CORS to allow your hosted frontend
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app"

# Start backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2: Tunnel
```powershell
ngrok http 8000
```

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok-free.app`)

### Update Frontend Environment

**If using Vercel:**
1. Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_BACKEND_URL` = `https://abc123.ngrok-free.app`
3. Redeploy

**If using Cloud Run:**
You'll need to rebuild with the new environment variable, or use a config file approach.

### Test

Visit your hosted frontend and verify it connects to your local backend!

---

## Updating Backend CORS for Your Hosted Frontend

Your backend needs to allow your hosted frontend URL. Based on the codebase, your frontend is at:

**`https://frontend-app-745486781817.us-central1.run.app`**

### Method 1: Environment Variable (Local Development)

When running locally, set the CORS_ORIGINS environment variable:

**Windows PowerShell:**
```powershell
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app"
```

**Windows CMD:**
```cmd
set CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app
```

**Mac/Linux:**
```bash
export CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app"
```

Then start your backend.

### Method 2: .env File

Create/update `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app
```

The backend will read this automatically.

---

## Troubleshooting

### CORS Errors

**Problem:** Browser shows CORS errors when frontend tries to connect.

**Solutions:**
1. Verify your hosted frontend URL is in `CORS_ORIGINS`
2. Check the URL matches exactly (no trailing slash)
3. Restart backend after changing CORS_ORIGINS
4. Check browser console for the exact error

**Test CORS directly:**
```powershell
# Replace with your tunnel URL and frontend URL
curl -H "Origin: https://frontend-app-745486781817.us-central1.run.app" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS https://your-tunnel-url.ngrok-free.app/health -v
```

### Tunnel URL Changes

**Problem:** ngrok free tier gives you a new URL each time.

**Solutions:**
1. Use ngrok paid plan for static URL
2. Use Cloudflare Tunnel (free, more stable)
3. Update frontend environment variable each time you restart tunnel
4. Use a domain name with ngrok (requires paid plan)

### Connection Timeout

**Problem:** Frontend can't reach backend through tunnel.

**Solutions:**
1. Verify backend is running on port 8000
2. Verify tunnel is running and forwarding to port 8000
3. Check tunnel URL is correct in frontend environment
4. Test tunnel URL directly in browser: `https://your-tunnel.ngrok-free.app/health`
5. Check firewall isn't blocking connections

### Backend Not Accessible via Tunnel

**Problem:** Tunnel URL shows error or connection refused.

**Solutions:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check backend is bound to `127.0.0.1:8000` (not just `localhost`)
3. Verify tunnel is forwarding to correct port: `ngrok http 8000`
4. Check backend logs for errors

---

## Quick Reference

### Start Backend Locally
```powershell
cd CSE5914\backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Start Tunnel (ngrok)
```powershell
ngrok http 8000
```

### Set CORS for Hosted Frontend
```powershell
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://frontend-app-745486781817.us-central1.run.app"
```

### Test Backend Health
```powershell
# Local
curl http://localhost:8000/health

# Via tunnel (replace with your tunnel URL)
curl https://your-tunnel.ngrok-free.app/health
```

---

## Workflow Summary

1. ✅ **Start backend locally** on port 8000
2. ✅ **Set CORS_ORIGINS** to include your hosted frontend URL
3. ✅ **Start tunnel** (ngrok/cloudflared/localtunnel) pointing to port 8000
4. ✅ **Copy tunnel URL** (e.g., `https://abc123.ngrok-free.app`)
5. ✅ **Update hosted frontend** environment variable `NEXT_PUBLIC_BACKEND_URL` to tunnel URL
6. ✅ **Test connection** from your hosted frontend

---

## Important Notes

- **Tunnel URLs change** (especially with free ngrok) - you'll need to update frontend env vars when they change
- **Keep tunnel running** - if you close the tunnel, your frontend won't be able to reach the backend
- **CORS must match exactly** - including protocol (https), no trailing slashes
- **Backend must allow your frontend domain** in CORS_ORIGINS
- **Both services running** - backend and tunnel must both be running

---

## Next Steps

1. ✅ Set up tunnel service (ngrok recommended)
2. ✅ Start backend locally with correct CORS
3. ✅ Update hosted frontend environment variables
4. ✅ Test the connection
5. ✅ Start developing!

For more information:
- Backend docs: `CSE5914/backend/README.md`
- CORS setup: `CSE5914/backend/CORS_SETUP.md`

