<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/app-logo-dark.svg">
  <img alt="Pdeefy" src="public/app-logo-light.svg" height="72">
</picture>

Open-source, web-based PDF tool suite with a **dual-mode architecture**:

- **Live Demo Mode** (GitHub Pages) — lightweight tools run entirely in your browser via Web Workers and `pdf-lib`.
- **Local Power Mode** (localhost backend) — unlocks OCR, PDF-to-Office conversion, and deep compression via a local FastAPI server.

## Features

### Always available (client-side)

- Merge, Split, Rotate PDF
- JPG/PNG to PDF
- Password Protect
- *(More tools registered — coming soon)*

### Backend required

- PDF to Word (DOCX)
- OCR (Tesseract)
- Deep Compress (Ghostscript / PyMuPDF fallback)

## Quick start (frontend)

```bash
npm install
npm run dev
```

Open [http://localhost:5173/pdeefy/](http://localhost:5173/pdeefy/)

## Local Power Mode (backend)

See [backend/README.md](backend/README.md).

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The frontend auto-detects the backend at `http://localhost:8000/api/health`. Change the URL in **Settings**.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite, React 19, TypeScript, Tailwind CSS v4, Shadcn/ui |
| PDF (client) | pdf-lib, Web Workers |
| Backend | FastAPI, PyMuPDF, python-docx, pytesseract |

## Brand assets

| Asset | Light | Dark |
|-------|-------|------|
| Full logo (wordmark) | [`app-logo-light.svg`](public/app-logo-light.svg) | [`app-logo-dark.svg`](public/app-logo-dark.svg) |
| Icon mark | [`app-icon-light.svg`](public/app-icon-light.svg) | [`app-icon-dark.svg`](public/app-icon-dark.svg) |

The app shows the full logo on `md` screens and up, and the square icon mark on smaller viewports. Both swap automatically with the active theme.

## Deploy

GitHub Pages deploys automatically from `main` via `.github/workflows/deploy.yml`. Set repository Pages source to **GitHub Actions**.

## License

MIT
