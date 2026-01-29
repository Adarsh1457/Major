from fastapi import APIRouter, HTTPException, Form
from backend.config.firebase_config import db, bucket
from backend.utils.pdf_generator import generate_report
import datetime

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])


@router.post("/generate")
async def generate(predictionId: str = Form(...), patientId: str = Form(...), token: str = Form(...)):
    # Simplified: fetch prediction and patient data
    pred_doc = db.collection("predictions").document(predictionId).get()
    if not pred_doc.exists:
        raise HTTPException(status_code=404, detail="Prediction not found")
    prediction = pred_doc.to_dict()

    patient_doc = db.collection("patients").document(patientId).get()
    if not patient_doc.exists:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = patient_doc.to_dict()

    report_url = generate_report(prediction, patient)

    report_id = str(predictionId) + "_report"
    db.collection("reports").document(report_id).set({
        "patientId": patientId,
        "predictionId": predictionId,
        "reportPath": report_url,
        "generatedBy": None,
        "createdAt": datetime.datetime.utcnow()
    })

    return {"reportId": report_id, "reportUrl": report_url}


@router.get("/{id}")
async def get_report(id: str):
    doc = db.collection("reports").document(id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Report not found")
    return doc.to_dict()


@router.get("")
async def list_reports(patientId: str = None):
    q = db.collection("reports")
    if patientId:
        q = q.where("patientId", "==", patientId)
    docs = [d.to_dict() | {"id": d.id} for d in q.stream()]
    return docs
