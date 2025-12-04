#!/bin/bash

# PaperLink Deployment Script
# This script helps deploy backend and frontend in the correct order

set -e  # Exit on error

echo "🚀 PaperLink Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Install with: npm install -g firebase-tools${NC}"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Firebase. Run: firebase login${NC}"
    exit 1
fi

# Function to deploy backend
deploy_backend() {
    echo -e "${GREEN}📦 Deploying Backend...${NC}"
    cd backend
    
    echo "Generating Data Connect SDK..."
    firebase dataconnect:sdk:generate || echo -e "${YELLOW}⚠️  Data Connect SDK generation failed (may not be critical)${NC}"
    
    echo "Deploying to Firebase App Hosting..."
    firebase deploy --only apphosting:backend
    
    echo -e "${GREEN}✅ Backend deployed!${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Save the backend URL from the output above${NC}"
    echo -e "${YELLOW}   You'll need it for frontend deployment${NC}"
    
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${GREEN}📦 Deploying Frontend...${NC}"
    
    # Check if BACKEND_URL is set
    if [ -z "$BACKEND_URL" ]; then
        echo -e "${YELLOW}⚠️  BACKEND_URL not set. Please set it before deploying frontend:${NC}"
        echo -e "${YELLOW}   export BACKEND_URL=https://your-backend-url.run.app${NC}"
        read -p "Enter backend URL: " BACKEND_URL
    fi
    
    cd frontend
    
    echo "Generating Data Connect SDK..."
    firebase dataconnect:sdk:generate || echo -e "${YELLOW}⚠️  Data Connect SDK generation failed (may not be critical)${NC}"
    
    echo "Installing dependencies..."
    npm install
    
    echo "Building frontend..."
    BACKEND_URL=$BACKEND_URL npm run build
    
    echo "Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    echo -e "${GREEN}✅ Frontend deployed!${NC}"
    
    cd ..
}

# Main deployment flow
main() {
    echo "Select deployment option:"
    echo "1) Deploy Backend only"
    echo "2) Deploy Frontend only"
    echo "3) Deploy Both (Backend first, then Frontend)"
    echo ""
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            echo ""
            echo "Waiting 30 seconds for backend to be fully ready..."
            sleep 30
            deploy_frontend
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
}

main

