from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_arxiv import router as arxiv_router
from app.api.routes_gemini import router as gemini_router
from app.api.routes_health import router as health_router
from app.api.routes_library import router as library_router
from app.api.routes_openalex import router as openalex_router
from app.api.routes_docling import router as docling_router
from app.api.routes_compare import router as compare_router
from app.core.config import settings

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register health routes
app.include_router(health_router)
app.include_router(openalex_router)
app.include_router(arxiv_router)
app.include_router(gemini_router)
app.include_router(library_router)
app.include_router(docling_router)
app.include_router(compare_router)


# Temporary test endpoints
@app.get("/")
def root():
    return {"message": "Hello, world!"}


@app.get("/debug")
def get_debug():
    return {"debug": settings.debug}
