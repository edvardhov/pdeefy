import json
import os
from pathlib import Path

_DEFAULT_VERSION = "0.1.0"


def _read_version() -> str:
    env_version = os.getenv("APP_VERSION", "").strip()
    if env_version:
        return env_version

    for package_json in (
        Path("/app/package.json"),
        Path(__file__).resolve().parents[2] / "package.json",
    ):
        if not package_json.is_file():
            continue
        try:
            return json.loads(package_json.read_text(encoding="utf-8"))["version"]
        except (json.JSONDecodeError, KeyError, OSError):
            continue

    return _DEFAULT_VERSION


API_VERSION = _read_version()
HEALTH_STATUS_OK = "ok"

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://*.github.io",
]

ERR_UPLOAD_PDF = "Upload a PDF file"
ERR_EMPTY_FILE = "Empty file"

MIME_PDF = "application/pdf"
MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
MIME_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
MIME_PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
MIME_ZIP = "application/zip"
MIME_TXT = "text/plain"
MIME_HTML = "text/html"
MIME_JPEG = "image/jpeg"
MIME_PNG = "image/png"

# Allowed extensions for Office -> PDF conversion (LibreOffice)
OFFICE_TO_PDF_EXTS = {
    "docx",
    "doc",
    "odt",
    "rtf",
    "xlsx",
    "xls",
    "ods",
    "csv",
    "pptx",
    "ppt",
    "odp",
}

HTML_TO_PDF_EXTS = {"html", "htm"}

TO_PDF_EXTS = OFFICE_TO_PDF_EXTS | HTML_TO_PDF_EXTS

# Allowed extensions for raster image -> PDF conversion
IMAGE_TO_PDF_EXTS = {"jpg", "jpeg", "png", "webp", "bmp", "gif", "tiff", "tif"}
