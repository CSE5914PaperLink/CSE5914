# Running Backend Without Poetry

## Quick Command

```bash
cd CSE5914/backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Setup (First Time)

If you don't have dependencies installed yet:

### Option 1: Using Virtual Environment (Recommended)

```bash
# Navigate to backend directory
cd CSE5914/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the app
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Option 2: Install Globally (Not Recommended)

```bash
cd CSE5914/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Command Breakdown

- `uvicorn` - ASGI server
- `app.main:app` - Module path to FastAPI app instance
- `--reload` - Auto-reload on code changes (development only)
- `--host 127.0.0.1` - Bind to localhost
- `--port 8000` - Run on port 8000

## Access Points

After starting, you can access:
- **API Root**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Environment Variables

Create `backend/.env` file:

```env
GEMINI_API_KEY=your_key_here
DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Troubleshooting

**Module not found error?**
- Make sure you're in the `backend` directory
- Activate your virtual environment if using one
- Install dependencies: `pip install -r requirements.txt`

**Port already in use?**
- Change port: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8001`
- Or kill the process using port 8000

**Import errors?**
- Verify all dependencies are installed
- Check that you're using Python 3.11+

