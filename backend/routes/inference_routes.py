from fastapi import APIRouter, UploadFile, HTTPException, Form
from backend.config.firebase_config import db, bucket
from backend.models.hybrid_model_loader import HybridModel
from backend.models.preprocess_utils import load_audio_from_bytes, extract_features
from backend.config.firebase_config import auth as firebase_auth
import uuid
import datetime

router = APIRouter(prefix="/api/v1/inference", tags=["Inference"])

model = HybridModel()


@router.post("/run")
async def run_inference(
    file: UploadFile, 
    token: str = Form(None),
    lgbm_weight: float = Form(0.5),
    lstm_weight: float = Form(0.5)
):
    print(f"\n>>> [API] RECEIVED INFERENCE REQUEST: {file.filename} ({file.content_type})")
    # Verify token only if Firebase Auth is configured
    uid = "local-dev-user"
    orgId = "local-dev-org"
    
    if firebase_auth and token and token.strip() != "":
        print(f"[DEBUG] Attempting token verification...")
        # Firebase is configured AND token is provided - verify it
        try:
            decoded = firebase_auth.verify_id_token(token)
            uid = decoded["uid"]
            if db:
                user_ref = db.collection("users").document(uid).get().to_dict()
                if user_ref:
                    orgId = user_ref.get("orgId")
        except Exception as e:
            print(f"[ERROR] Token verification failed: {e}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
    else:
        # Dev mode - no authentication required
        print("[INFO] Running in DEV mode without authentication (auth_configured={}, token_present={})".format(firebase_auth is not None, token is not None))

    data = await file.read()
    audio, sr = load_audio_from_bytes(data, sr=44100)
    features = extract_features(audio, sr)

    result = model.predict(features, lgbm_weight=lgbm_weight, lstm_weight=lstm_weight)

    pred_id = str(uuid.uuid4())
    
    if db:
        db.collection("predictions").document(pred_id).set({
            "predictionId": pred_id,
            "orgId": orgId,
            "patientId": None,
            "predictedLabel": result["label"],
            "probability": result["probability"],
            "createdAt": datetime.datetime.utcnow()
        })
    else:
        print(f"[INFO] DB not configured. Skipping Prediction save. Result: {result}")

    # Optionally upload original file to storage
    storage_path = None
    if bucket:
        blob = bucket.blob(f"voices/{orgId}/{pred_id}.wav")
        blob.upload_from_string(data, content_type=file.content_type)
        storage_path = blob.path

    return {"message": "Prediction complete", "result": result, "predictionId": pred_id, "storagePath": storage_path}
