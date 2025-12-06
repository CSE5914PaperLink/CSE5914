# PowerShell script for Windows users
# Quick setup script for local development

Write-Host "🔧 Setting up local frontend development environment" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path .env.local) {
    Write-Host "⚠️  .env.local already exists. Backing up to .env.local.backup" -ForegroundColor Yellow
    Copy-Item .env.local .env.local.backup
}

# Create .env.local from example
if (Test-Path .env.local.example) {
    Copy-Item .env.local.example .env.local
    Write-Host "✅ Created .env.local from .env.local.example" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local.example not found. Creating basic .env.local..." -ForegroundColor Yellow
    @"
# Backend API URL (hosted)
BACKEND_URL=https://backend-api-wirfpvv3kq-uc.a.run.app
NEXT_PUBLIC_BACKEND_URL=https://backend-api-wirfpvv3kq-uc.a.run.app

# Firebase Configuration - UPDATE THESE!
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
"@ | Out-File -FilePath .env.local -Encoding utf8
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local and add your Firebase configuration"
Write-Host "2. Update backend CORS (if needed):"
Write-Host "   gcloud run services update backend-api --region us-central1 --set-env-vars CORS_ORIGINS=`"https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000`""
Write-Host "3. Install dependencies: npm install"
Write-Host "4. Run dev server: npm run dev"
Write-Host ""
Write-Host "✅ Setup complete! Edit .env.local with your Firebase config." -ForegroundColor Green


