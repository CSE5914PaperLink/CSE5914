#!/usr/bin/env python3
"""
Startup script for Cloud Run / Firebase App Hosting
Reads PORT from environment variable and starts uvicorn
"""
import os
import uvicorn

if __name__ == "__main__":
    # Get port from environment variable (Cloud Run sets this to 8080)
    port = int(os.environ.get("PORT", 8080))
    
    # Start the FastAPI app
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

