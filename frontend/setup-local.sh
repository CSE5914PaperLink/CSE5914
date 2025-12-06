#!/bin/bash
# Quick setup script for local development
# This configures the frontend to connect to the hosted backend

set -e

echo "🔧 Setting up local frontend development environment"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local from example
if [ -f .env.local.example ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local from .env.local.example"
else
    echo "❌ .env.local.example not found. Creating basic .env.local..."
    cat > .env.local << EOF
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
EOF
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and add your Firebase configuration"
echo "2. Update backend CORS (if needed):"
echo "   gcloud run services update backend-api --region us-central1 --set-env-vars CORS_ORIGINS=\"https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000\""
echo "3. Install dependencies: npm install"
echo "4. Run dev server: npm run dev"
echo ""
echo "✅ Setup complete! Edit .env.local with your Firebase config."


