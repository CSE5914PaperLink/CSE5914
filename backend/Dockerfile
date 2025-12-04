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

# Expose port (Cloud Run uses PORT environment variable)
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Run uvicorn with production settings
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 1

