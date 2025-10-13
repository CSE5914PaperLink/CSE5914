from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    paper_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)