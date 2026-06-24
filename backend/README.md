# pdeefy Backend

Local FastAPI server for heavy PDF processing (OCR, Office conversion, deep compression).

## Docker

From the repository root:

```bash
docker compose up -d
```

The backend runs at `http://localhost:8000`. Tesseract OCR, Ghostscript, and LibreOffice (Writer/Calc/Impress) are pre-installed in the image — no `brew install` required.

Health check: `GET http://localhost:8000/api/health`

Backend only (if you run the frontend separately):

```bash
docker compose up -d backend
```

## Manual setup

### Requirements

- **Python 3.11+**
- **Tesseract OCR** — `brew install tesseract` (macOS)
- **Ghostscript** (optional, for deep compression) — `brew install ghostscript`
- **LibreOffice** (for Office → PDF) — `brew install --cask libreoffice` (macOS) or `apt install libreoffice-writer libreoffice-calc libreoffice-impress` (Debian/Ubuntu)
- **WeasyPrint** (for HTML → PDF) — installed via `pip`; on macOS also needs `brew install pango` (WeasyPrint system deps)

### Setup

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Run

```bash
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/api/health`

## Endpoints

| Method | Path                         | Description                              |
| ------ | ---------------------------- | ---------------------------------------- |
| GET    | `/api/health`                | Health check                             |
| POST   | `/api/convert/to-pdf`        | Office → PDF (LibreOffice); HTML → PDF (WeasyPrint) |
| POST   | `/api/convert/image-to-pdf`  | Raster image → PDF (Pillow)              |
| POST   | `/api/convert/pdf-to-images` | PDF → JPG/PNG pages (zip, `format` form) |
| POST   | `/api/convert/pdf-to-text`   | PDF → plain text                         |
| POST   | `/api/convert/pdf-to-html`   | PDF → HTML                               |
| POST   | `/api/convert/pdf-to-word`   | PDF → DOCX (text extraction)             |
| POST   | `/api/convert/pdf-to-excel`  | PDF → XLSX (text/tables)                 |
| POST   | `/api/convert/pdf-to-ppt`    | PDF → PPTX (page images)                 |
| POST   | `/api/ocr`                   | OCR scanned PDF                          |
| POST   | `/api/edit/compress`         | Deep PDF compression                     |
| POST   | `/api/edit/repair`           | Repair corrupted PDF                     |

### Office → PDF supported formats

`.docx`, `.doc`, `.odt`, `.rtf`, `.xlsx`, `.xls`, `.ods`, `.csv`, `.pptx`, `.ppt`, `.odp`, `.html`, `.htm`

### Image → PDF supported formats

`.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`, `.gif`, `.tiff`, `.tif`
