# Quick Start: Local Backend with Lovable Frontend

## 3 Simple Steps

### 1. Start Backend

```powershell
cd CSE5914\backend
.\start-backend-local.ps1
```

Backend runs at: **http://localhost:8000**

### 2. Start Tunnel

```powershell
# Install ngrok first: https://ngrok.com/download
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### 3. Configure Lovable

**In Lovable Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Set:
   - `BACKEND_URL` = `https://abc123.ngrok-free.app` (your tunnel URL)
   - `NEXT_PUBLIC_BACKEND_URL` = `https://abc123.ngrok-free.app` (same)

**Set Backend CORS:**
```powershell
# Replace with your actual Lovable frontend URL
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://your-app.lovable.app"
```

Then restart your backend.

## That's It!

Your Lovable frontend will now connect to your local backend through the tunnel.

---

## Full Guide

See **[LOVABLE_BACKEND_SETUP.md](./LOVABLE_BACKEND_SETUP.md)** for detailed instructions and troubleshooting.

## Quick Test

```powershell
# Test local backend
curl http://localhost:8000/health

# Test tunnel URL
curl https://your-ngrok-url.ngrok-free.app/health
```

Both should return: `{"status":"ok"}`

