from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.constants import ERR_EMPTY_FILE, ERR_UPLOAD_PDF


async def read_validated_upload(file: UploadFile, allowed_exts: set[str]) -> tuple[bytes, str]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Upload a file")

    ext = Path(file.filename).suffix.lower().lstrip(".")
    if ext not in allowed_exts:
        allowed = ", ".join(sorted(f".{e}" for e in allowed_exts))
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {allowed}")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail=ERR_EMPTY_FILE)

    return data, ext


async def read_validated_pdf(file: UploadFile) -> bytes:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail=ERR_UPLOAD_PDF)

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail=ERR_EMPTY_FILE)

    return pdf_bytes
