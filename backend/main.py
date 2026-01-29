from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import auth_routes, inference_routes, patient_routes, dataset_routes, report_routes
import logging

app = FastAPI(title="Voice-Based Parkinson's Detection Backend")

# Permissive CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    response = JSONResponse(content="OK")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global exception caught: {exc}", exc_info=True)
    response = JSONResponse(
        status_code=500,
        content={"detail": str(exc), "message": "Internal Server Error"},
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# Include routers
app.include_router(auth_routes.router)
app.include_router(inference_routes.router)
app.include_router(patient_routes.router)
app.include_router(dataset_routes.router)
app.include_router(report_routes.router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
