<#
Helper PowerShell script to create a virtual environment, install dependencies and run the dev server.

Usage:
  From project root (Windows PowerShell):
    .\run_dev.ps1            # create venv if missing, install deps and run uvicorn
    .\run_dev.ps1 -Recreate  # recreate venv from scratch
#>

param(
    [switch]$Recreate
)

$venvPath = ".venv"

if ($Recreate -and (Test-Path $venvPath)) {
    Write-Host "Recreating virtual environment..."
    Remove-Item -Recurse -Force $venvPath
}

if (!(Test-Path $venvPath)) {
    Write-Host "Creating virtual environment at $venvPath"
    python -m venv $venvPath
}

Write-Host "Activating virtual environment"
. .\$venvPath\Scripts\Activate.ps1

Write-Host "Upgrading pip and installing requirements"
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

Write-Host "Starting uvicorn (backend.main:app) on port 8000"
uvicorn backend.main:app --reload --port 8000
