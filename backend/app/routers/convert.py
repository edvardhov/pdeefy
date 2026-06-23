import io
from pathlib import Path

import fitz
from docx import Document
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.constants import MIME_DOCX
from app.validation import read_validated_pdf

router = APIRouter(prefix="/api/convert", tags=["convert"])


def _pdf_to_docx_bytes(pdf_bytes: bytes) -> bytes:
    doc = Document()
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

    for page_index in range(len(pdf)):
        page = pdf[page_index]
        text = page.get_text("text").strip()
        if text:
            doc.add_paragraph(text)
        else:
            doc.add_paragraph(f"[Page {page_index + 1} — no extractable text]")
        if page_index < len(pdf) - 1:
            doc.add_page_break()

    pdf.close()
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer.read()


@router.post("/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...)) -> StreamingResponse:
    pdf_bytes = await read_validated_pdf(file)

    try:
        docx_bytes = _pdf_to_docx_bytes(pdf_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {exc}") from exc

    stem = Path(file.filename).stem
    return StreamingResponse(
        io.BytesIO(docx_bytes),
        media_type=MIME_DOCX,
        headers={"Content-Disposition": f'attachment; filename="{stem}.docx"'},
    )
