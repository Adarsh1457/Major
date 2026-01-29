from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.config.firebase_config import db
import datetime

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])


class Patient(BaseModel):
    firstName: str
    lastName: str
    dob: Optional[str]
    gender: Optional[str]
    orgId: Optional[str]


@router.post("")
async def create_patient(patient: Patient):
    doc_ref = db.collection("patients").document()
    payload = patient.dict()
    payload.update({"createdAt": datetime.datetime.utcnow(), "createdBy": None})
    doc_ref.set(payload)
    return {"id": doc_ref.id, **payload}


@router.get("")
async def list_patients(orgId: str = None):
    q = db.collection("patients")
    if orgId:
        q = q.where("orgId", "==", orgId)
    docs = [d.to_dict() | {"id": d.id} for d in q.stream()]
    return docs


@router.get("/{id}")
async def get_patient(id: str):
    doc = db.collection("patients").document(id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Patient not found")
    return doc.to_dict()


@router.put("/{id}")
async def update_patient(id: str, patient: Patient):
    doc_ref = db.collection("patients").document(id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Patient not found")
    doc_ref.update(patient.dict(exclude_none=True))
    return {"id": id, **patient.dict()}
