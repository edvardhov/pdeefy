import io
from pathlib import Path

import fitz
import pytesseract
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from app.constants import MIME_PDF
from app.validation import read_validated_pdf

router = APIRouter(prefix="/api/ocr", tags=["ocr"])


def _ocr_pdf(pdf_bytes: bytes, language: str = "eng") -> bytes:
    source = fitz.open(stream=pdf_bytes, filetype="pdf")
    output = fitz.open()

    for page_index in range(len(source)):
        page = source[page_index]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        image = Image.open(io.BytesIO(pix.tobytes("png")))
        text = pytesseract.image_to_pdf_or_hocr(image, extension="pdf", lang=language)
        ocr_page_doc = fitz.open("pdf", text)
        output.insert_pdf(ocr_page_doc)
        ocr_page_doc.close()

    result = output.tobytes()
    source.close()
    output.close()
    return result


@router.post("")
async def run_ocr(
    file: UploadFile = File(...),
    language: str = Form(default="eng"),
) -> StreamingResponse:
    pdf_bytes = await read_validated_pdf(file)

    try:
        result = _ocr_pdf(pdf_bytes, language=language)
    except pytesseract.TesseractNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail="Tesseract is not installed. Install with: brew install tesseract",
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OCR failed: {exc}") from exc

    stem = Path(file.filename).stem
    return StreamingResponse(
        io.BytesIO(result),
        media_type=MIME_PDF,
        headers={"Content-Disposition": f'attachment; filename="ocr_{stem}.pdf"'},
    )
