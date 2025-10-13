from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FileNode(BaseModel):
    name: str
    path: str
    type: str
    children: Optional[List['FileNode']] = None

class Codebase(BaseModel):
    repository_url: Optional[str] = Field(None, description="The URL of the linked GitHub repository.")
    is_linked: bool = Field(False, description="Indicates if a repository is linked and has been synchronized.")
    file_tree: Optional[List[FileNode]] = Field(None, description="The hierarchical file structure of the repository.")
    last_synced_at: Optional[datetime] = Field(None, description="The timestamp of the last successful synchronization.")