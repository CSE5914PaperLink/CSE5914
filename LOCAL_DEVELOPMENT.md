# Local Development Guide

This guide helps you run both the backend and frontend locally on your machine.

> **Note:** If your frontend is hosted online and you want to connect it to a local backend, see [LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md](./LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md) instead.

## Quick Start

### 1. Start the Backend

Open a terminal and run:

```powershell
cd CSE5914\backend
poetry install  # First time only
poetry shell    # Activate virtual environment
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or without activating the shell:

```powershell
cd CSE5914\backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at: **http://localhost:8000**

### 2. Start the Frontend

Open a **new terminal** and run:

```powershell
cd CSE5914\frontend
npm install  # First time only
npm run dev
```

The frontend will be available at: **http://localhost:3000**

That's it! Your frontend will automatically connect to your local backend.

---

## Detailed Setup

### Prerequisites

- **Python 3.11+** (Python 3.13 recommended)
- **Poetry** - Python dependency manager
- **Node.js 20+** - For the frontend
- **npm** or **yarn** - Package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```powershell
   cd CSE5914\backend
   ```

2. **Install Poetry** (if not already installed):
   ```powershell
   (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
   ```
   
   Add Poetry to PATH if needed (usually `%APPDATA%\Python\Scripts`)

3. **Install dependencies:**
   ```powershell
   poetry install
   ```

4. **Create `.env` file** (optional, for API keys):
   ```powershell
   # Create .env file in backend directory
   echo "GEMINI_API_KEY=your_key_here" > .env
   echo "DEBUG=true" >> .env
   ```
   
   Edit `.env` to add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DEBUG=true
   ```

5. **Start the backend server:**
   ```powershell
   poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   You should see:
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   INFO:     Started reloader process
   INFO:     Started server process
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   ```

6. **Verify backend is running:**
   - Visit http://localhost:8000 in your browser
   - You should see: `{"message":"Hello, world!"}`
   - Visit http://localhost:8000/docs for Swagger UI

### Frontend Setup

1. **Navigate to frontend directory:**
   ```powershell
   cd CSE5914\frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Create `.env.local` file** (optional, defaults to localhost:8000):
   ```powershell
   # Create .env.local file in frontend directory
   echo "BACKEND_URL=http://localhost:8000" > .env.local
   echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" >> .env.local
   ```
   
   If you want to use the local backend, your `.env.local` should have:
   ```env
   BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```
   
   **Note:** The frontend defaults to `http://localhost:8000` if these variables are not set, so you can skip this step if running locally.

4. **Start the frontend server:**
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   ▲ Next.js 16.0.1
   - Local:        http://localhost:3000
   ```

5. **Verify frontend is running:**
   - Visit http://localhost:3000 in your browser
   - You should see your application

---

## Configuration

### Backend Configuration

**Port:** The backend runs on port **8000** by default.

**CORS:** The backend is already configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

**Environment Variables:**
- `GEMINI_API_KEY` - Required for Gemini/LLM features
- `DEBUG` - Set to `true` for verbose logging (development only)
- `CORS_ORIGINS` - Comma-separated list of allowed origins (defaults to localhost:3000)

### Frontend Configuration

**Port:** The frontend runs on port **3000** by default.

**Backend URL:**
- Server-side (API routes): Uses `BACKEND_URL` environment variable
- Client-side (browser): Uses `NEXT_PUBLIC_BACKEND_URL` environment variable
- **Default:** `http://localhost:8000` (if not set)

**Environment Variables:**
- `BACKEND_URL` - Backend URL for server-side API routes
- `NEXT_PUBLIC_BACKEND_URL` - Backend URL for client-side requests
- `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration (required for authentication)

---

## Using Helper Scripts

We've provided helper scripts to make starting both services easier:

### Windows (PowerShell)

**Start both services:**
```powershell
.\start-local-dev.ps1
```

**Start backend only:**
```powershell
.\start-backend.ps1
```

**Start frontend only:**
```powershell
.\start-frontend.ps1
```

### Mac/Linux

**Start both services:**
```bash
./start-local-dev.sh
```

**Start backend only:**
```bash
./start-backend.sh
```

**Start frontend only:**
```bash
./start-frontend.sh
```

---

## Testing the Setup

### 1. Test Backend Directly

```powershell
# Test root endpoint
curl http://localhost:8000

# Should return: {"message":"Hello, world!"}

# Test health endpoint
curl http://localhost:8000/health

# Should return: {"status":"ok"}
```

### 2. Test Frontend Connection

1. Open http://localhost:3000 in your browser
2. Open browser developer tools (F12)
3. Check the Console tab for any errors
4. Try using features that call the backend (e.g., search, chat)
5. Check the Network tab to see if requests are going to `localhost:8000`

### 3. Test CORS

If you see CORS errors in the browser console:
- Verify backend is running on port 8000
- Check that CORS_ORIGINS includes `http://localhost:3000`
- Restart the backend server

---

## Troubleshooting

### Backend Won't Start

**Port already in use:**
```powershell
# Windows: Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Poetry not found:**
- Make sure Poetry is installed and in your PATH
- Try: `poetry --version`

**Python version mismatch:**
- Check Python version: `python --version`
- Should be 3.11+ (3.13 recommended)

### Frontend Won't Start

**Port 3000 already in use:**
```powershell
# Windows: Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

**Node modules missing:**
```powershell
cd CSE5914\frontend
rm -r node_modules
npm install
```

### Connection Issues

**CORS Errors:**
- Verify backend is running on `http://localhost:8000`
- Check that frontend is running on `http://localhost:3000`
- Backend CORS is pre-configured for localhost:3000
- Restart both services

**Backend not reachable:**
- Verify backend is running: visit http://localhost:8000
- Check backend logs for errors
- Verify no firewall is blocking port 8000

**Environment variables not working:**
- Restart the frontend dev server after changing `.env.local`
- Make sure file is named exactly `.env.local` (not `.env.local.txt`)
- Check file location (should be in `frontend/` directory)

---

## Development Workflow

1. **Start backend first** (takes a moment to start):
   ```powershell
   cd CSE5914\backend
   poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Start frontend** (in a new terminal):
   ```powershell
   cd CSE5914\frontend
   npm run dev
   ```

3. **Make changes:**
   - Backend changes: Server auto-reloads (--reload flag)
   - Frontend changes: Next.js hot-reloads automatically

4. **View your changes:**
   - Frontend: http://localhost:3000
   - Backend API docs: http://localhost:8000/docs

---

## Switching Between Local and Hosted Backend

### Use Local Backend (Default)

Create/update `frontend/.env.local`:
```env
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Or simply delete/rename `.env.local` to use defaults.

### Use Hosted Backend

Create/update `frontend/.env.local`:
```env
BACKEND_URL=https://your-backend-url.run.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.run.app
```

Remember to update backend CORS to allow your local frontend!

---

## Quick Reference

**Backend:**
- URL: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

**Frontend:**
- URL: http://localhost:3000
- Default backend: http://localhost:8000

**Commands:**
```powershell
# Backend
cd CSE5914\backend
poetry install
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend
cd CSE5914\frontend
npm install
npm run dev
```

---

## Next Steps

1. ✅ Start backend on port 8000
2. ✅ Start frontend on port 3000
3. ✅ Verify connection in browser
4. ✅ Start developing!

For more information:
- Backend docs: `CSE5914/backend/README.md`
- Frontend docs: `CSE5914/frontend/README.md`

