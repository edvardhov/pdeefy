<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/app-logo-dark.svg">
    <img alt="Pdeefy" src="public/app-logo-light.svg" width="340">
  </picture>
</p>

<p align="center">
  <strong>PDF tools that stay in your browser.</strong><br>
  Merge, split, convert, and protect documents — fast, private, and open source.
</p>

<p align="center">
  <a href="https://edvardhov.github.io/pdeefy/"><strong>Try the live demo →</strong></a>
</p>

<p align="center">
  <a href="https://github.com/edvardhov/pdeefy/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://edvardhov.github.io/pdeefy/"><img src="https://img.shields.io/badge/demo-GitHub%20Pages-ef233c" alt="Live demo"></a>
  <img src="https://img.shields.io/badge/tools-22%2B-space%20indigo" alt="22+ tools">
  <img src="https://img.shields.io/badge/client--side-no%20uploads-success" alt="No uploads for core tools">
</p>

---

## Why Pdeefy

| | |
|---|---|
| **Private by default** | Core tools run entirely in the browser via Web Workers — your files never leave your machine in Live Demo Mode. |
| **Dual-mode** | Use the hosted demo instantly, or connect a local FastAPI backend for OCR, Office export, and deep compression. |
| **Modern stack** | React 19, TypeScript, Tailwind v4, and `pdf-lib` — built to extend, not to lock you in. |

## Dual-mode architecture

```mermaid
flowchart TB
  subgraph demo ["Live Demo Mode · GitHub Pages"]
    A[Browser] --> B[Web Workers + pdf-lib]
    B --> C[Merge · Split · Rotate · Protect · …]
  end

  subgraph power ["Local Power Mode · localhost"]
    A --> D[FastAPI backend]
    D --> E[OCR · PDF→Office · Deep compress]
  end
```

| Mode | Where it runs | Best for |
|------|---------------|----------|
| **Live Demo** | GitHub Pages, 100% client-side | Everyday PDF edits, no install |
| **Local Power** | Your machine + [FastAPI backend](backend/README.md) | OCR, DOCX/XLSX export, Ghostscript compression |

## Features

<details open>
<summary><strong>Always available</strong> — no backend, no upload</summary>

<br>

- Merge, split, extract, delete & reorder pages
- Rotate, flatten, fill & sign, add text & images
- Password protect & unlock
- JPG / PNG → PDF, Markdown → PDF
- Watermark *(and more in the registry)*

</details>

<details>
<summary><strong>Local Power Mode</strong> — requires the backend</summary>

<br>

- PDF → Word (DOCX)
- PDF → Excel / PowerPoint
- OCR (Tesseract)
- Deep compress (Ghostscript / PyMuPDF)

</details>

## Quick start

### Frontend (Live Demo locally)

```bash
git clone https://github.com/edvardhov/pdeefy.git
cd pdeefy
npm install
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/)

### Backend (optional — Local Power Mode)

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The app auto-detects the backend at `http://localhost:8000/api/health`. Override the URL in **Settings** if needed.

Full backend setup: [backend/README.md](backend/README.md)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite · React 19 · TypeScript · Tailwind CSS v4 · Shadcn/ui |
| PDF (client) | pdf-lib · Web Workers · pdfjs-dist |
| Backend | FastAPI · PyMuPDF · python-docx · pytesseract |

## Deploy

Pushes to `main` deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Set the repository **Pages** source to **GitHub Actions**.

## Brand assets

Logo SVGs (light / dark icon + wordmark lockups) live in [`public/`](public/). The app uses the full lockup on large screens and the square icon on mobile, swapping with the active theme.

## License

[MIT](LICENSE) · © [Edvard Hovhannisyan](https://github.com/edvardhov)
