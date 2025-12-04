# PowerShell script to deploy frontend
# Usage: .\deploy-now.ps1

Write-Host "🚀 Deploying Frontend to Google Cloud Run" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase env vars are set
if (-not $env:FIREBASE_API_KEY -or -not $env:FIREBASE_PROJECT_ID) {
    Write-Host "❌ Firebase environment variables not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set the following environment variables:" -ForegroundColor Yellow
    Write-Host "  `$env:FIREBASE_API_KEY = 'your-api-key'"
    Write-Host "  `$env:FIREBASE_AUTH_DOMAIN = 'your-project.firebaseapp.com'"
    Write-Host "  `$env:FIREBASE_PROJECT_ID = 'your-project-id'"
    Write-Host "  `$env:FIREBASE_STORAGE_BUCKET = 'your-project.appspot.com'"
    Write-Host "  `$env:FIREBASE_MESSAGING_SENDER_ID = '123456789'"
    Write-Host "  `$env:FIREBASE_APP_ID = '1:123456789:web:abc123'"
    Write-Host "  `$env:BACKEND_URL = 'https://backend-api-wirfpvv3kq-uc.a.run.app'"
    Write-Host ""
    Write-Host "Or read from .env.local:" -ForegroundColor Yellow
    Write-Host "  Get-Content .env.local | ForEach-Object { if (`$_ -match '^([^#][^=]+)=(.*)$') { [Environment]::SetEnvironmentVariable(`$matches[1], `$matches[2], 'Process') } }"
    exit 1
}

# Set defaults
$REGION = "us-central1"
$REPOSITORY = "frontend-repo"
$SERVICE_NAME = "frontend-app"
$BACKEND_URL = if ($env:BACKEND_URL) { $env:BACKEND_URL } else { "https://backend-api-wirfpvv3kq-uc.a.run.app" }

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Region: $REGION"
Write-Host "  Repository: $REPOSITORY"
Write-Host "  Service: $SERVICE_NAME"
Write-Host "  Backend URL: $BACKEND_URL"
Write-Host ""

# Create Artifact Registry if needed
Write-Host "📦 Checking Artifact Registry..." -ForegroundColor Cyan
$repoExists = gcloud artifacts repositories describe $REPOSITORY --location=$REGION 2>$null
if (-not $repoExists) {
    Write-Host "Creating Artifact Registry repository..." -ForegroundColor Yellow
    gcloud artifacts repositories create $REPOSITORY `
        --repository-format=docker `
        --location=$REGION `
        --description="Frontend Next.js Docker repository"
} else {
    Write-Host "✅ Repository exists" -ForegroundColor Green
}

# Deploy
Write-Host ""
Write-Host "🔨 Building and deploying (this will take 5-15 minutes)..." -ForegroundColor Cyan
Write-Host ""

gcloud builds submit --config=cloudbuild.yaml `
    --substitutions=_REGION=$REGION,_REPOSITORY=$REPOSITORY,_SERVICE_NAME=$SERVICE_NAME,_BACKEND_URL=$BACKEND_URL,_FIREBASE_API_KEY=$env:FIREBASE_API_KEY,_FIREBASE_AUTH_DOMAIN=$env:FIREBASE_AUTH_DOMAIN,_FIREBASE_PROJECT_ID=$env:FIREBASE_PROJECT_ID,_FIREBASE_STORAGE_BUCKET=$env:FIREBASE_STORAGE_BUCKET,_FIREBASE_MESSAGING_SENDER_ID=$env:FIREBASE_MESSAGING_SENDER_ID,_FIREBASE_APP_ID=$env:FIREBASE_APP_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

# Get frontend URL
Write-Host ""
Write-Host "📝 Getting frontend URL..." -ForegroundColor Cyan
$FRONTEND_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Frontend URL: $FRONTEND_URL" -ForegroundColor Cyan
Write-Host ""

# Update backend CORS
Write-Host "🔧 Updating backend CORS..." -ForegroundColor Cyan
$CURRENT_CORS = gcloud run services describe backend-api --region $REGION --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGINS')].value)" 2>$null

if ($CURRENT_CORS) {
    $NEW_CORS = "$CURRENT_CORS,$FRONTEND_URL"
} else {
    $NEW_CORS = "https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000,$FRONTEND_URL"
}

gcloud run services update backend-api `
    --region $REGION `
    --update-env-vars CORS_ORIGINS=$NEW_CORS

Write-Host ""
Write-Host "✅ All done!" -ForegroundColor Green
Write-Host "🌐 Your frontend is live at: $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "🔗 Backend CORS updated to allow: $FRONTEND_URL" -ForegroundColor Green

