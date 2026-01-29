from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from backend.config.firebase_config import db, auth as firebase_auth

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


class TokenPayload(BaseModel):
    token: str


@router.post("/verify")
async def verify_token(payload: TokenPayload):
    if firebase_auth is None:
        raise HTTPException(status_code=501, detail="Firebase Auth not configured on server")
    try:
        decoded = firebase_auth.verify_id_token(payload.token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {e}")

    uid = decoded.get("uid")
    user_doc = db.collection("users").document(uid).get()
    if not user_doc.exists:
        # create a minimal user record
        user_info = {
            "displayName": decoded.get("name"),
            "email": decoded.get("email"),
            "role": "clinician",
            "orgId": None,
            "createdAt": decoded.get("iat")
        }
        db.collection("users").document(uid).set(user_info)
        user = user_info
    else:
        user = user_doc.to_dict()

    return {"uid": uid, "user": user}


@router.get("/user")
async def get_user(token: str):
    if firebase_auth is None:
        raise HTTPException(status_code=501, detail="Firebase Auth not configured on server")
    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    uid = decoded.get("uid")
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return doc.to_dict()
