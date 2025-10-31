from fastapi import FastAPI

from app.api.routes_arxiv import router as arxiv_router
from app.api.routes_gemini import router as gemini_router
from app.api.routes_health import router as health_router
from app.api.routes_openalex import router as openalex_router
from app.core.config import settings

app = FastAPI()

# Register health routes
app.include_router(health_router)
app.include_router(openalex_router)
app.include_router(arxiv_router)
app.include_router(gemini_router)


# Temporary test endpoints
@app.get("/")
def root():
    return {"message": "Hello, world!"}


@app.get("/debug")
def get_debug():
    return {"debug": settings.debug}
