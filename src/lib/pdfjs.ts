import { GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

export { getDocument, RenderingCancelledException } from 'pdfjs-dist'
export type { PDFDocumentProxy } from 'pdfjs-dist'
