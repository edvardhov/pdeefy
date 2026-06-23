from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.constants import API_VERSION, CORS_ORIGINS
from app.routers import convert, edit, health, ocr

app = FastAPI(title="pdeefy API", version=API_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.github\.io",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(convert.router)
app.include_router(ocr.router)
app.include_router(edit.router)
