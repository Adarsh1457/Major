from fastapi import APIRouter, HTTPException, UploadFile, Form
from backend.config.firebase_config import db
import datetime
import uuid

router = APIRouter(prefix="/api/v1/datasets", tags=["Datasets"])


@router.get("")
async def list_datasets(orgId: str = None):
    q = db.collection("datasets")
    if orgId:
        q = q.where("orgId", "==", orgId)
    docs = [d.to_dict() | {"id": d.id} for d in q.stream()]
    return docs


@router.post("/upload")
async def upload_dataset(file: UploadFile, token: str = Form(...)):
    # token verification should be done via middleware/dep; simplified here
    doc_id = str(uuid.uuid4())
    payload = {
        "name": file.filename,
        "orgId": None,
        "uploader": None,
        "status": "uploaded",
        "size": file.spool_max_size if hasattr(file, "spool_max_size") else None,
        "createdAt": datetime.datetime.utcnow()
    }
    db.collection("datasets").document(doc_id).set(payload)
    return {"id": doc_id, **payload}


@router.put("/{id}")
async def update_dataset(id: str, status: str = Form(...)):
    doc_ref = db.collection("datasets").document(id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Dataset not found")
    doc_ref.update({"status": status})
    return {"id": id, "status": status}
