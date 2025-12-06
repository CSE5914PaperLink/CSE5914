# PowerShell script to start backend locally with CORS configured for Lovable frontend
# This allows your Lovable-hosted frontend to connect to your local backend via a tunnel

Write-Host "🚀 Starting Backend Locally for Lovable..." -ForegroundColor Cyan
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

# Get Lovable frontend URL
Write-Host "📋 Configuration for Lovable Frontend" -ForegroundColor Yellow
Write-Host ""
$LOVABLE_URL = Read-Host "Enter your Lovable frontend URL (e.g., https://your-app.lovable.app)"

if ([string]::IsNullOrWhiteSpace($LOVABLE_URL)) {
    Write-Host "⚠️  No Lovable URL provided. Using default CORS (localhost only)." -ForegroundColor Yellow
    $LOVABLE_URL = ""
}

# Set CORS origins
$CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
if (-not [string]::IsNullOrWhiteSpace($LOVABLE_URL)) {
    # Remove trailing slash if present
    $LOVABLE_URL = $LOVABLE_URL.TrimEnd('/')
    $CORS_ORIGINS = "$CORS_ORIGINS,$LOVABLE_URL"
}

Write-Host ""
Write-Host "📋 CORS configured for:" -ForegroundColor Yellow
Write-Host "   - http://localhost:3000" -ForegroundColor Gray
Write-Host "   - http://127.0.0.1:3000" -ForegroundColor Gray
if (-not [string]::IsNullOrWhiteSpace($LOVABLE_URL)) {
    Write-Host "   - $LOVABLE_URL" -ForegroundColor Gray
}
Write-Host ""

# Set environment variable for CORS
$env:CORS_ORIGINS = $CORS_ORIGINS

Write-Host "🔧 Starting backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Start a tunnel (e.g., 'ngrok http 8000')" -ForegroundColor Gray
Write-Host "   2. Copy the tunnel URL (e.g., https://abc123.ngrok-free.app)" -ForegroundColor Gray
Write-Host "   3. Set in Lovable: BACKEND_URL and NEXT_PUBLIC_BACKEND_URL = tunnel URL" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 See: CSE5914/LOVABLE_BACKEND_SETUP.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

# Start the backend
poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

