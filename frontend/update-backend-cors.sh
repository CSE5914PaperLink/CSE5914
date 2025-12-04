#!/bin/bash
# Script to update backend CORS to allow localhost:3000
# Usage: ./update-backend-cors.sh

set -e

REGION=${REGION:-us-central1}
SERVICE_NAME=${SERVICE_NAME:-backend-api}

echo "🔧 Updating backend CORS to allow localhost:3000"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Get current CORS origins
CURRENT_ORIGINS=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(spec.template.spec.containers[0].env[?(@.name=='CORS_ORIGINS')].value)" 2>/dev/null || echo "")

if [ -z "$CURRENT_ORIGINS" ]; then
    echo "No existing CORS_ORIGINS found. Setting new value..."
    NEW_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://backend-api-wirfpvv3kq-uc.a.run.app"
else
    echo "Current CORS origins: $CURRENT_ORIGINS"
    
    # Check if localhost:3000 is already in the list
    if [[ "$CURRENT_ORIGINS" == *"localhost:3000"* ]]; then
        echo "✅ localhost:3000 is already allowed"
        exit 0
    fi
    
    # Add localhost to existing origins
    NEW_ORIGINS="$CURRENT_ORIGINS,http://localhost:3000,http://127.0.0.1:3000"
fi

echo "Updating CORS_ORIGINS to: $NEW_ORIGINS"
echo ""

# Update the service (using --update-env-vars to preserve other env vars)
gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --update-env-vars CORS_ORIGINS="$NEW_ORIGINS"

echo ""
echo "✅ Backend CORS updated successfully!"
echo "You can now connect from http://localhost:3000"

