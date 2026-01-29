from typing import Optional
from config.firebase_config import bucket
import io


def upload_bytes(path: str, data: bytes, content_type: str = "application/octet-stream") -> Optional[str]:
    if not bucket:
        return None
    blob = bucket.blob(path)
    blob.upload_from_string(data, content_type=content_type)
    return blob.public_url


def download_bytes(path: str) -> Optional[bytes]:
    if not bucket:
        return None
    blob = bucket.blob(path)
    return blob.download_as_bytes()
