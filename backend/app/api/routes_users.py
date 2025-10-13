from fastapi import APIRouter, HTTPException
from app.services import user_service
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("/users", response_model=User, status_code=201)
async def create_user(user: User):
    return await user_service.create_user(user)

@router.get("/users", response_model=List[User])
async def list_users():
    return await user_service.list_users()

@router.get("/users/{userId}", response_model=User)
async def get_user(userId: str):
    user = await user_service.get_user(userId)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user