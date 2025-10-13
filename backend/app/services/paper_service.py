from app.core.firebase_client import db
from app.models.paper import Paper

async def get_paper(paper_id: str):
    doc_ref = db.collection('papers').document(paper_id)
    doc = await doc_ref.get()
    if doc.exists:
        return Paper(**doc.to_dict())
    return None