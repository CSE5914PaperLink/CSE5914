# Environment Variables Setup Guide

This guide explains how to set up your `.env` file for the backend.

## Quick Start

1. **Create your `.env` file** in the `backend/` directory
2. **Copy the template below** and fill in your actual values
3. **Never commit** your `.env` file to version control (it's already in `.gitignore`)

## Environment Variables Template

Create a file named `.env` in the `backend/` directory with the following content:

```env
# ===========================================
# API Keys
# ===========================================

# Google Gemini API Key (Required for Gemini chat endpoints)
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# Nomic API Key (Optional - for remote embeddings)
# If not set, will use local inference mode
# Get from: https://atlas.nomic.ai/
NOMIC_API_KEY=your-nomic-api-key-here

# GitHub API Token (Optional - for higher rate limits when fetching GitHub repos)
# Get from: https://github.com/settings/tokens
GITHUB_API_TOKEN=your-github-token-here

# ===========================================
# Server Configuration
# ===========================================

# Enable debug mode (true/false)
# Shows detailed error messages and verbose logging
DEBUG=false

# Server port (default: 8080)
# Cloud Run will override this with PORT environment variable
PORT=8000

# ===========================================
# CORS Configuration
# ===========================================

# Comma-separated list of allowed origins for CORS
# Example: http://localhost:3000,http://127.0.0.1:3000,https://your-frontend.com
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ===========================================
# ChromaDB Configuration
# ===========================================

# Path where ChromaDB stores persistent data
# Relative to backend directory
CHROMA_PERSIST_PATH=./chroma

# ChromaDB collection name
CHROMA_COLLECTION_NAME=documents
```

## Variable Descriptions

### Required Variables

- **GEMINI_API_KEY**: Required for Gemini chat endpoints. Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### Optional Variables

- **NOMIC_API_KEY**: Optional. If set, Nomic embeddings will use remote API mode. If not set, local inference mode will be used (no API key needed). Get your key from [Nomic Atlas](https://atlas.nomic.ai/).

- **GITHUB_API_TOKEN**: Optional. Used for higher rate limits when fetching GitHub repositories. Get your token from [GitHub Settings](https://github.com/settings/tokens).

- **DEBUG**: Set to `true` for development (shows detailed error messages) or `false` for production.

- **PORT**: Server port. Defaults to `8000` for local development. Cloud Run will override this automatically.

- **CORS_ORIGINS**: Comma-separated list of allowed frontend URLs. Add your production frontend URL when deploying.

- **CHROMA_PERSIST_PATH**: Where ChromaDB stores data. Defaults to `./chroma`.

- **CHROMA_COLLECTION_NAME**: ChromaDB collection name. Defaults to `documents`.

## Nomic API Key Usage

The backend supports two modes for Nomic embeddings:

1. **Local Inference Mode (Default)**: 
   - No API key needed
   - Runs embeddings locally on your machine
   - Slower but no API costs

2. **Remote API Mode**:
   - Requires `NOMIC_API_KEY` to be set
   - Faster, uses Nomic's API
   - May incur API costs

The backend automatically detects which mode to use based on whether `NOMIC_API_KEY` is set in your `.env` file.

## Creating the .env File

### On Windows (PowerShell):

```powershell
# Navigate to backend directory
cd backend

# Create .env file (you can also use a text editor)
New-Item -Path .env -ItemType File -Force

# Then open it in your editor and paste the template above
```

### On Linux/Mac:

```bash
# Navigate to backend directory
cd backend

# Create .env file
touch .env

# Then open it in your editor and paste the template above
# Or use this command to create it with basic content:
cat > .env << 'EOF'
GEMINI_API_KEY=
NOMIC_API_KEY=
GITHUB_API_TOKEN=
DEBUG=false
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CHROMA_PERSIST_PATH=./chroma
CHROMA_COLLECTION_NAME=documents
EOF
```

## Verification

After creating your `.env` file:

1. Make sure you've filled in at least `GEMINI_API_KEY`
2. Start your backend: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`
3. Check the `/health` endpoint to verify everything is working

## Security Notes

- ⚠️ **Never commit your `.env` file** - it contains sensitive API keys
- ✅ The `.env` file is already in `.gitignore` 
- ✅ Use environment variables in production deployments (Cloud Run, etc.)
- ✅ Use secrets management services for production (Google Cloud Secrets Manager, etc.)

