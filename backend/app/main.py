
from fastapi import FastAPI

from app.api.routes_health import router as health_router
from app.api.routes_papers import router as paper_router
from app.api.routes_users import router as user_router
from app.core.config import settings

app = FastAPI()

# Register health routes
app.include_router(health_router)

# Register paper routes
app.include_router(paper_router)

# Register user routes
app.include_router(user_router)


@app.get("/")
def root():
    return {"message": "Hello, world!"}


@app.get("/debug")
def get_debug():
    return {"debug": settings.debug}
