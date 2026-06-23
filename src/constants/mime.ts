export const MIME = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpeg: 'image/jpeg',
  png: 'image/png',
} as const

export const ACCEPT_MAP = {
  pdf: `${MIME.pdf},.pdf`,
  image: `${MIME.jpeg},${MIME.png},.jpg,.jpeg,.png`,
  any: `${MIME.pdf},.pdf,${MIME.jpeg},${MIME.png},.jpg,.jpeg,.png`,
} as const
