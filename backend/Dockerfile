# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and set up pip cache
RUN pip install --upgrade pip setuptools wheel

# Copy requirements file first (for better Docker layer caching)
COPY requirements.txt ./

# Install Python dependencies with pip cache
# Using --no-cache-dir saves space but is slower, so we'll use cache for faster builds
RUN pip install --timeout=1000 -r requirements.txt

# Copy application code
COPY . .

# Create directory for ChromaDB persistence
RUN mkdir -p /app/chroma && chmod 777 /app/chroma

# Expose port (Cloud Run/App Hosting sets PORT environment variable automatically)
EXPOSE 8080

# Health check with longer start period to allow app to initialize
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Run uvicorn with production settings
# PORT is automatically set by Cloud Run/App Hosting at runtime
CMD exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1

