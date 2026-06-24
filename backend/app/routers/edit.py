import io
import shutil
import subprocess
import tempfile
from pathlib import Path

import fitz
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.constants import MIME_PDF
from app.validation import read_validated_pdf

router = APIRouter(prefix="/api/edit", tags=["edit"])


def _compress_with_ghostscript(input_path: Path, output_path: Path) -> None:
    gs = shutil.which("gs")
    if not gs:
        raise RuntimeError("Ghostscript not found. Install with: brew install ghostscript")

    subprocess.run(
        [
            gs,
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            "-dPDFSETTINGS=/ebook",
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            f"-sOutputFile={output_path}",
            str(input_path),
        ],
        check=True,
        capture_output=True,
    )


def _compress_with_pymupdf(pdf_bytes: bytes) -> bytes:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    buffer = io.BytesIO()
    doc.save(buffer, garbage=4, deflate=True, clean=True)
    doc.close()
    return buffer.getvalue()


@router.post("/compress")
async def compress_pdf(file: UploadFile = File(...)) -> StreamingResponse:
    pdf_bytes = await read_validated_pdf(file)

    try:
        if shutil.which("gs"):
            with tempfile.TemporaryDirectory() as tmp:
                input_path = Path(tmp) / "input.pdf"
                output_path = Path(tmp) / "output.pdf"
                input_path.write_bytes(pdf_bytes)
                _compress_with_ghostscript(input_path, output_path)
                result = output_path.read_bytes()
        else:
            result = _compress_with_pymupdf(pdf_bytes)
    except subprocess.CalledProcessError as exc:
        raise HTTPException(status_code=500, detail=f"Compression failed: {exc.stderr.decode()}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Compression failed: {exc}") from exc

    stem = Path(file.filename).stem
    return StreamingResponse(
        io.BytesIO(result),
        media_type=MIME_PDF,
        headers={"Content-Disposition": f'attachment; filename="compressed_{stem}.pdf"'},
    )


@router.post("/repair")
async def repair_pdf(file: UploadFile = File(...)) -> StreamingResponse:
    pdf_bytes = await read_validated_pdf(file)

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        buffer = io.BytesIO()
        doc.save(buffer, garbage=4, deflate=True, clean=True)
        doc.close()
        result = buffer.getvalue()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Repair failed: {exc}") from exc

    stem = Path(file.filename).stem
    return StreamingResponse(
        io.BytesIO(result),
        media_type=MIME_PDF,
        headers={"Content-Disposition": f'attachment; filename="repaired_{stem}.pdf"'},
    )
