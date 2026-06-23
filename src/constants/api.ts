export const API = {
  DEFAULT_URL: 'http://localhost:8000',
  DEFAULT_HOST: 'localhost:8000',
  HEALTH_TIMEOUT_MS: 3_000,
  HEALTH_POLL_MS: 30_000,
  HEALTH_STATUS_OK: 'ok',
  paths: {
    health: '/api/health',
    pdfToWord: '/api/convert/pdf-to-word',
    ocr: '/api/ocr',
    compress: '/api/edit/compress',
  },
} as const
