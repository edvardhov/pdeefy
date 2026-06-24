import io
from pathlib import Path

import fitz
from docx import Document
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from pptx import Presentation
from pptx.util import Inches

from app.constants import MIME_DOCX, MIME_PPTX, MIME_XLSX
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


def _pdf_to_xlsx_bytes(pdf_bytes: bytes) -> bytes:
    workbook = Workbook()
    workbook.remove(workbook.active)
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

    for page_index in range(len(pdf)):
        page = pdf[page_index]
        sheet = workbook.create_sheet(title=f"Page {page_index + 1}"[:31])
        tables = page.find_tables()

        if not tables.tables:
            sheet.cell(row=1, column=1, value=page.get_text("text").strip() or f"[Page {page_index + 1}]")
            continue

        row_offset = 1
        for table in tables:
            for row in table.extract():
                for col_index, value in enumerate(row, start=1):
                    sheet.cell(row=row_offset, column=col_index, value=value)
                row_offset += 1
            row_offset += 1

    pdf.close()
    buffer = io.BytesIO()
    workbook.save(buffer)
    buffer.seek(0)
    return buffer.read()


def _pdf_to_pptx_bytes(pdf_bytes: bytes) -> bytes:
    presentation = Presentation()
    blank_layout = presentation.slide_layouts[6]
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

    for page_index in range(len(pdf)):
        page = pdf[page_index]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        image_bytes = pix.tobytes("png")

        slide = presentation.slides.add_slide(blank_layout)
        image_stream = io.BytesIO(image_bytes)
        slide.shapes.add_picture(
            image_stream,
            Inches(0),
            Inches(0),
            width=presentation.slide_width,
            height=presentation.slide_height,
        )

    pdf.close()
    buffer = io.BytesIO()
    presentation.save(buffer)
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


@router.post("/pdf-to-excel")
async def pdf_to_excel(file: UploadFile = File(...)) -> StreamingResponse:
    pdf_bytes = await read_validated_pdf(file)

    try:
        xlsx_bytes = _pdf_to_xlsx_bytes(pdf_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {exc}") from exc

    stem = Path(file.filename).stem
    return StreamingResponse(
        io.BytesIO(xlsx_bytes),
        media_type=MIME_XLSX,
        headers={"Content-Disposition": f'attachment; filename="{stem}.xlsx"'},
    )


@router.post("/pdf-to-ppt")
async def pdf_to_ppt(file: UploadFile = File(...)) -> StreamingResponse:
    pdf_bytes = await read_validated_pdf(file)

    try:
        pptx_bytes = _pdf_to_pptx_bytes(pdf_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {exc}") from exc

    stem = Path(file.filename).stem
    return StreamingResponse(
        io.BytesIO(pptx_bytes),
        media_type=MIME_PPTX,
        headers={"Content-Disposition": f'attachment; filename="{stem}.pptx"'},
    )
