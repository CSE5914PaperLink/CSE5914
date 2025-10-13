from pydantic import BaseModel, Field
from typing import List, Optional

class CodebaseInfo(BaseModel):
    repository_url: Optional[str] = Field(None, description="The URL of the linked GitHub repository.")
    is_linked: bool = Field(False, description="Indicates if a repository is linked and has been synchronized.")

class Paper(BaseModel):
    id: str
    title: str
    authors: List[str]
    year: int
    citation_count: int
    codebase: CodebaseInfo