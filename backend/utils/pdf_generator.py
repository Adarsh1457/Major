from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from backend.config.firebase_config import bucket
import io


def generate_report(prediction_data: dict, patient_data: dict) -> str:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    c.setFont("Helvetica", 12)
    c.drawString(100, 750, "Parkinson’s Detection Report")
    c.drawString(100, 700, f"Patient: {patient_data.get('firstName', '')} {patient_data.get('lastName', '')}")
    c.drawString(100, 670, f"Prediction: {prediction_data.get('predictedLabel', '')}")
    c.drawString(100, 640, f"Confidence: {prediction_data.get('probability', 0):.2f}")
    c.save()

    pdf_bytes = buffer.getvalue()
    if bucket:
        blob = bucket.blob(f"reports/{patient_data.get('orgId', 'unknown')}/{patient_data.get('id', 'unknown')}/report_{prediction_data.get('predictionId', 'pred')}.pdf")
        blob.upload_from_string(pdf_bytes, content_type='application/pdf')
        return blob.public_url

    # fallback: write to local temp if no bucket
    with open("report_fallback.pdf", "wb") as f:
        f.write(pdf_bytes)
    return "report_fallback.pdf"
