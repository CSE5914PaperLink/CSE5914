from app.core.firebase_client import db
from app.models.user import User
from typing import List

async def create_user(user: User):
    await db.collection('users').document(user.id).set(user.dict())
    return user

async def get_user(user_id: str):
    doc_ref = db.collection('users').document(user_id)
    doc = await doc_ref.get()
    if doc.exists:
        return User(**doc.to_dict())
    return None

async def list_users() -> List[User]:
    users = []
    docs = await db.collection('users').get()
    for doc in docs:
        users.append(User(**doc.to_dict()))
    return users