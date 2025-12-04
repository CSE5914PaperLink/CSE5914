#!/bin/bash
# Startup script for Cloud Run / Firebase App Hosting
# Reads PORT from environment variable (Cloud Run sets this to 8080)

# Get port from environment variable, default to 8080
PORT=${PORT:-8080}

# Start uvicorn server
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT

