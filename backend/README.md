# pdeefy Backend

Local FastAPI server for heavy PDF processing (OCR, Office conversion, deep compression).

## Docker

From the repository root:

```bash
docker compose up -d
```

The backend runs at `http://localhost:8000`. Tesseract OCR and Ghostscript are pre-installed in the image — no `brew install` required.

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

| Method | Path                       | Description          |
| ------ | -------------------------- | -------------------- |
| GET    | `/api/health`              | Health check         |
| POST   | `/api/convert/pdf-to-word` | PDF → DOCX           |
| POST   | `/api/convert/pdf-to-excel`| PDF → XLSX           |
| POST   | `/api/convert/pdf-to-ppt`  | PDF → PPTX           |
| POST   | `/api/ocr`                 | OCR scanned PDF      |
| POST   | `/api/edit/compress`       | Deep PDF compression |
| POST   | `/api/edit/repair`         | Repair corrupted PDF |
