from fastapi import FastAPI

from app.api.routes_health import router as health_router
from app.core.config import settings

app = FastAPI()

# Register health routes
app.include_router(health_router)


@app.get("/")
def root():
    return {"message": "Hello, world!"}


@app.get("/debug")
def get_debug():
    return {"debug": settings.debug}
