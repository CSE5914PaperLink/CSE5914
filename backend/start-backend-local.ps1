# PowerShell script to start backend locally with CORS configured for hosted frontend
# This allows your hosted frontend to connect to your local backend via a tunnel

Write-Host "🚀 Starting Backend Locally..." -ForegroundColor Cyan

# Set your hosted frontend URL here
$HOSTED_FRONTEND_URL = "https://frontend-app-745486781817.us-central1.run.app"

# Set CORS origins to allow localhost (for local testing) and hosted frontend
$CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000,$HOSTED_FRONTEND_URL"

Write-Host "📋 CORS configured for:" -ForegroundColor Yellow
Write-Host "   - http://localhost:3000" -ForegroundColor Gray
Write-Host "   - http://127.0.0.1:3000" -ForegroundColor Gray
Write-Host "   - $HOSTED_FRONTEND_URL" -ForegroundColor Gray
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "pyproject.toml")) {
    Write-Host "❌ Error: pyproject.toml not found. Please run this script from the backend directory." -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Gray
    exit 1
}

# Check if poetry is installed
try {
    $poetryVersion = poetry --version 2>&1
    Write-Host "✅ Poetry found: $poetryVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Poetry not found. Please install Poetry first." -ForegroundColor Red
    Write-Host "   Install: (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -" -ForegroundColor Gray
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "poetry.lock")) {
    Write-Host "⚠️  Dependencies not installed. Installing..." -ForegroundColor Yellow
    poetry install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Set environment variable for CORS
$env:CORS_ORIGINS = $CORS_ORIGINS

Write-Host "🔧 Starting backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Write-Host "📝 Note: To expose this backend to your hosted frontend, you'll need a tunnel (e.g., ngrok)" -ForegroundColor Yellow
Write-Host "   See: CSE5914/LOCAL_BACKEND_WITH_HOSTED_FRONTEND.md" -ForegroundColor Yellow
Write-Host ""

# Start the backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

