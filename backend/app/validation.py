from fastapi import HTTPException, UploadFile

from app.constants import ERR_EMPTY_FILE, ERR_UPLOAD_PDF


async def read_validated_pdf(file: UploadFile) -> bytes:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail=ERR_UPLOAD_PDF)

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail=ERR_EMPTY_FILE)

    return pdf_bytes
