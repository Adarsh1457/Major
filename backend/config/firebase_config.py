import os
import logging

# firebase_admin is optional for local dev; import defensively
try:
    from firebase_admin import credentials, firestore, storage, auth
    import firebase_admin
except Exception:
    credentials = None
    firestore = None
    storage = None
    auth = None
    firebase_admin = None

_initialized = False

def init_firebase():
    global _initialized
    if _initialized:
        return

    if firebase_admin is None:
        logging.warning("firebase_admin not installed; skipping Firebase initialization")
        return

    cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json")
    if not os.path.exists(cred_path):
        logging.warning("Firebase service account key not found at %s. Firebase not initialized.", cred_path)
        return

    cred = credentials.Certificate(cred_path)
    try:
        firebase_admin.initialize_app(cred, {
            "storageBucket": os.environ.get("FIREBASE_STORAGE_BUCKET", "your-project-id.appspot.com")
        })
        _initialized = True
    except Exception as e:
        logging.exception("Failed to initialize Firebase Admin SDK: %s", e)


init_firebase()

db = None
bucket = None
if firebase_admin and hasattr(firebase_admin, "_apps") and firebase_admin._apps:
    try:
        db = firestore.client()
        bucket = storage.bucket()
    except Exception:
        logging.exception("Failed to create Firestore or Storage client; leaving as None")
