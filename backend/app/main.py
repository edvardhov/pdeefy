from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import convert, edit, health, ocr

app = FastAPI(title="pdeefy API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "https://*.github.io",
    ],
    allow_origin_regex=r"https://.*\.github\.io",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(convert.router)
app.include_router(ocr.router)
app.include_router(edit.router)
