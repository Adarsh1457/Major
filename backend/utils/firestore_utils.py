from typing import Any, Dict, Optional
from config.firebase_config import db


def get_doc(collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
    doc = db.collection(collection).document(doc_id).get()
    if not doc.exists:
        return None
    return doc.to_dict()


def set_doc(collection: str, doc_id: str, payload: Dict[str, Any]):
    db.collection(collection).document(doc_id).set(payload)


def update_doc(collection: str, doc_id: str, payload: Dict[str, Any]):
    db.collection(collection).document(doc_id).update(payload)
