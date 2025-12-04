#!/bin/bash
# Script to mount Cloud Storage bucket for ChromaDB
# Requires GCS_BUCKET environment variable and service account with storage access

set -e

if [ -z "$GCS_BUCKET" ]; then
    echo "Warning: GCS_BUCKET not set, using local storage"
    mkdir -p /app/chroma
    export CHROMA_PERSIST_PATH=/app/chroma
else
    echo "Mounting Cloud Storage bucket: $GCS_BUCKET"
    gcsfuse --implicit-dirs --file-mode=0666 --dir-mode=0777 \
        $GCS_BUCKET /mnt/chroma
    export CHROMA_PERSIST_PATH=/mnt/chroma
fi

# Export for Python to use
export CHROMA_PERSIST_PATH

