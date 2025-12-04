# Quick Fix Script for Firebase App Hosting Permission Error
# Run this script in PowerShell
# Project: PaperLink (paper-477421)

$PROJECT_ID = "paper-477421"

Write-Host "Setting project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

Write-Host "`nEnabling required APIs..." -ForegroundColor Yellow
gcloud services enable firebaseapphosting.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

Write-Host "`nWaiting 30 seconds for APIs to propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`nVerifying APIs are enabled..." -ForegroundColor Yellow
gcloud services list --enabled --project=$PROJECT_ID --filter="name:firebaseapphosting.googleapis.com OR name:run.googleapis.com"

Write-Host "`n✅ APIs should now be enabled!" -ForegroundColor Green
Write-Host "Try deploying again with: firebase deploy --only apphosting:backend" -ForegroundColor Cyan

Write-Host "`n⚠️  If you still get permission errors:" -ForegroundColor Yellow
Write-Host "1. Check that billing is enabled for the project" -ForegroundColor White
Write-Host "2. Verify you have 'Editor' or 'Owner' role on the project" -ForegroundColor White
Write-Host "3. Wait a few more minutes and try again" -ForegroundColor White

