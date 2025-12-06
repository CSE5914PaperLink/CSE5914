# Connecting Local Backend to Lovable Frontend

This guide shows you how to run your backend locally and connect it to your frontend hosted on Lovable.

## Overview

- ✅ **Backend**: Run locally on your machine
- ✅ **Frontend**: Hosted on Lovable platform
- 🔗 **Connection**: Use a tunnel (ngrok/cloudflared) to expose local backend to the internet

---

## Quick Start

### Step 1: Start Your Backend Locally

```powershell
cd CSE5914\backend
.\start-backend-local.ps1
```

Or manually:
```powershell
cd CSE5914\backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend will run at: **http://localhost:8000**

### Step 2: Expose Backend to Internet (Tunnel)

Install and start ngrok:

```powershell
# Install ngrok (one-time)
# Download from: https://ngrok.com/download
# Sign up and get authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN

# Start tunnel
ngrok http 8000
```

You'll get a URL like: `https://abc123.ngrok-free.app`

**Copy this URL!** You'll need it for Lovable configuration.

### Step 3: Get Your Lovable Frontend URL

1. Go to your Lovable project dashboard
2. Find your deployed frontend URL (e.g., `https://your-app.lovable.app` or similar)
3. Copy the exact URL

### Step 4: Configure Backend CORS

Your backend needs to allow requests from your Lovable frontend.

**Option A: Use the helper script** (recommended)

The `start-backend-local.ps1` script can be updated. For now, set CORS manually:

```powershell
# Replace with your actual Lovable frontend URL
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://your-app.lovable.app"
```

**Option B: Update .env file**

Create/update `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://your-app.lovable.app
```

**Important:** Replace `https://your-app.lovable.app` with your actual Lovable frontend URL!

### Step 5: Configure Lovable Environment Variables

In your Lovable project, set these environment variables:

1. **Go to Lovable Dashboard** → Your Project → Settings → Environment Variables
2. **Add/Update:**
   - `BACKEND_URL` = `https://abc123.ngrok-free.app` (your tunnel URL)
   - `NEXT_PUBLIC_BACKEND_URL` = `https://abc123.ngrok-free.app` (your tunnel URL)

3. **Redeploy your frontend** in Lovable (if needed, to pick up the new environment variables)

### Step 6: Test the Connection

1. Visit your Lovable frontend URL
2. Open browser developer tools (F12)
3. Check the Network tab - requests should go to your ngrok URL
4. Check Console for any CORS errors
5. Test backend: Visit `https://abc123.ngrok-free.app/health` directly

---

## Detailed Setup

### Prerequisites

- Python 3.11+ with Poetry installed
- ngrok account (free is fine) or cloudflared
- Lovable project with your frontend deployed

### Step-by-Step Instructions

#### 1. Backend Setup

**Install dependencies (first time only):**
```powershell
cd CSE5914\backend
poetry install
```

**Create `.env` file:**
```powershell
# Create backend/.env
echo "GEMINI_API_KEY=your_gemini_api_key" > .env
echo "DEBUG=true" >> .env
```

**Start backend:**
```powershell
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Tunnel Setup (ngrok)

**Install ngrok:**
- Download from: https://ngrok.com/download
- Extract to a folder in your PATH
- Sign up at: https://dashboard.ngrok.com/signup
- Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

**Configure ngrok:**
```powershell
ngrok config add-authtoken YOUR_AUTHTOKEN
```

**Start tunnel:**
```powershell
ngrok http 8000
```

**Copy the HTTPS URL** - it will look like:
```
Forwarding  https://abc123xyz.ngrok-free.app -> http://localhost:8000
```

#### 3. Configure Backend CORS

Your backend needs to allow your Lovable frontend. Get your Lovable frontend URL first, then:

**Set environment variable:**
```powershell
# Replace with your actual Lovable URL
$LOVABLE_URL = "https://your-app.lovable.app"
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,$LOVABLE_URL"
```

**Or update backend/.env:**
```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://your-app.lovable.app
```

**Restart backend** after changing CORS_ORIGINS.

#### 4. Configure Lovable

**In Lovable Dashboard:**

1. Go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add/update:
   ```
   BACKEND_URL=https://your-ngrok-url.ngrok-free.app
   NEXT_PUBLIC_BACKEND_URL=https://your-ngrok-url.ngrok-free.app
   ```
4. Save and redeploy if necessary

**Note:** Lovable may require you to redeploy for environment variables to take effect.

#### 5. Test Connection

**Test backend locally:**
```powershell
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

**Test backend via tunnel:**
```powershell
curl https://your-ngrok-url.ngrok-free.app/health
# Should return: {"status":"ok"}
```

**Test from Lovable frontend:**
1. Open your Lovable frontend in browser
2. Open Developer Tools (F12)
3. Check Network tab - requests should go to ngrok URL
4. Check Console for errors
5. Try using features that call the backend

---

## Environment Variables for Lovable

### Frontend Environment Variables (Set in Lovable)

| Variable | Value | Description |
|----------|-------|-------------|
| `BACKEND_URL` | `https://your-ngrok-url.ngrok-free.app` | Backend URL for server-side API routes |
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-ngrok-url.ngrok-free.app` | Backend URL for client-side requests |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (your Firebase key) | Firebase configuration |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (your Firebase domain) | Firebase configuration |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (your project ID) | Firebase configuration |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (your bucket) | Firebase configuration |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (your sender ID) | Firebase configuration |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (your app ID) | Firebase configuration |

### Backend Environment Variables (Local)

Set in `backend/.env`:

| Variable | Value | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | (your API key) | Required for Gemini/LLM features |
| `DEBUG` | `true` | Enable debug logging |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000,https://your-app.lovable.app` | Allowed frontend origins |

---

## Troubleshooting

### CORS Errors

**Problem:** Browser shows CORS errors when Lovable frontend tries to connect.

**Solutions:**
1. **Verify Lovable URL is in CORS_ORIGINS:**
   - Check exact URL (no trailing slash)
   - Must match exactly (including https://)
   - Check backend logs: `Allowed CORS origins: [...]`

2. **Check backend is running:**
   ```powershell
   curl http://localhost:8000/health
   ```

3. **Restart backend** after changing CORS_ORIGINS

### Connection Timeout

**Problem:** Lovable frontend can't reach backend.

**Solutions:**
1. **Verify tunnel is running:**
   - Check ngrok is still running
   - Verify URL is correct
   - Test tunnel URL directly: `curl https://your-ngrok-url.ngrok-free.app/health`

2. **Check backend is running:**
   ```powershell
   curl http://localhost:8000/health
   ```

3. **Verify environment variables in Lovable:**
   - Check `NEXT_PUBLIC_BACKEND_URL` is set correctly
   - Redeploy Lovable frontend if needed

### ngrok URL Changed

**Problem:** ngrok free tier gives you a new URL each time you restart.

**Solutions:**
1. **Update Lovable environment variables** with new ngrok URL
2. **Redeploy Lovable frontend** to pick up new URL
3. **Consider ngrok paid plan** for static URL
4. **Use Cloudflare Tunnel** (free, more stable URLs)

### Backend Not Accessible

**Problem:** Tunnel URL shows error or connection refused.

**Solutions:**
1. **Verify backend is running:**
   ```powershell
   curl http://localhost:8000/health
   ```

2. **Check backend is bound correctly:**
   - Should be: `--host 127.0.0.1 --port 8000`
   - Not just `localhost` (use 127.0.0.1)

3. **Verify tunnel is forwarding to correct port:**
   ```powershell
   ngrok http 8000
   ```

---

## Alternative: Cloudflare Tunnel

If ngrok isn't working well, try Cloudflare Tunnel (free, more stable):

### Setup Cloudflare Tunnel

1. **Install cloudflared:**
   - Download from: https://github.com/cloudflare/cloudflared/releases
   - Or use installer: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

2. **Start tunnel:**
   ```powershell
   cloudflared tunnel --url http://localhost:8000
   ```

3. **Use the Cloudflare URL** instead of ngrok URL in Lovable

---

## Workflow Summary

1. ✅ **Start backend locally** on port 8000
2. ✅ **Start tunnel** (ngrok/cloudflared) pointing to port 8000
3. ✅ **Get tunnel URL** (e.g., `https://abc123.ngrok-free.app`)
4. ✅ **Get Lovable frontend URL** from Lovable dashboard
5. ✅ **Set CORS_ORIGINS** to include Lovable frontend URL
6. ✅ **Set environment variables in Lovable:**
   - `BACKEND_URL` = tunnel URL
   - `NEXT_PUBLIC_BACKEND_URL` = tunnel URL
7. ✅ **Test connection** from Lovable frontend

---

## Important Notes

- **Tunnel URLs change** (especially with free ngrok) - you'll need to update Lovable env vars when they change
- **Keep tunnel running** - if you close the tunnel, Lovable frontend won't be able to reach backend
- **CORS must match exactly** - including protocol (https://), no trailing slashes
- **Backend must allow your Lovable domain** in CORS_ORIGINS
- **Both services running** - backend and tunnel must both be running

---

## Quick Reference

```powershell
# Terminal 1: Start Backend
cd CSE5914\backend
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://your-app.lovable.app"
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Start Tunnel
ngrok http 8000

# Test Backend
curl http://localhost:8000/health
curl https://your-ngrok-url.ngrok-free.app/health
```

---

## Next Steps

1. ✅ Set up ngrok or cloudflared
2. ✅ Start backend locally with correct CORS
3. ✅ Get your Lovable frontend URL
4. ✅ Configure environment variables in Lovable
5. ✅ Test the connection
6. ✅ Start developing!

For more information:
- General local backend guide: `LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md`
- Backend docs: `backend/README.md`

