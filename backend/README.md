# Voice-Based Parkinson's Detection Backend

This backend provides FastAPI endpoints for voice sample upload, hybrid ML/DL inference (LightGBM + LSTM + attention), Firestore data storage, Firebase Storage for files, and PDF report generation for clinicians.

Quick start (local):

1. Create and activate a Python 3.10+ virtual environment.
2. Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

3. Set environment variable for Firebase service account (or place `serviceAccountKey.json` in project root):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'
```

4. Run the app:

```powershell
uvicorn backend.main:app --reload --port 8000
```

Using a virtual environment (recommended)

The repository includes helper steps and a PowerShell script to create and run a venv. From the project root you can run:

```powershell
# create & activate venv, install requirements, run dev server
.\run_dev.ps1
```

If you prefer to run commands manually in PowerShell:

```powershell
python -m venv .venv
. \.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Notes:
- Many modules include safe fallbacks if model files or Firebase credentials are missing so you can develop locally.
- Extend the `models/` folder to load your trained models and add additional preprocessing.
