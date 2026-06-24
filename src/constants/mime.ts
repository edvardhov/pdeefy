export const MIME = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  markdown: 'text/markdown',
  plain: 'text/plain',
} as const

export const ACCEPT_MAP = {
  pdf: `${MIME.pdf},.pdf`,
  image: `${MIME.jpeg},${MIME.png},${MIME.svg},.jpg,.jpeg,.png,.svg`,
  text: `${MIME.plain},${MIME.markdown},.txt,.md,.markdown`,
  any: `${MIME.pdf},.pdf,${MIME.jpeg},${MIME.png},${MIME.svg},.jpg,.jpeg,.png,.svg,${MIME.plain},${MIME.markdown},.txt,.md,.markdown`,
} as const

export const EXT_TO_MIME: Record<string, string> = {
  pdf: MIME.pdf,
  docx: MIME.docx,
  xlsx: MIME.xlsx,
  pptx: MIME.pptx,
  jpg: MIME.jpeg,
  jpeg: MIME.jpeg,
  png: MIME.png,
  svg: MIME.svg,
  md: MIME.markdown,
  markdown: MIME.markdown,
  txt: MIME.plain,
}
