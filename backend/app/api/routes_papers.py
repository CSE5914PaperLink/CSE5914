from fastapi import APIRouter, HTTPException
from app.services import paper_service
from app.models.paper import Paper

router = APIRouter()

@router.get("/papers/{paperId}", response_model=Paper)
async def get_paper(paperId: str):
    paper = await paper_service.get_paper(paperId)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper