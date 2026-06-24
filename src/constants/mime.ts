export const MIME = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation',
  html: 'text/html',
  zip: 'application/zip',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  bmp: 'image/bmp',
  gif: 'image/gif',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
  markdown: 'text/markdown',
  plain: 'text/plain',
} as const

const DOCUMENT_ACCEPT = `${MIME.docx},${MIME.doc},${MIME.odt},${MIME.rtf},.docx,.doc,.odt,.rtf`
const SPREADSHEET_ACCEPT = `${MIME.xlsx},${MIME.xls},${MIME.ods},${MIME.csv},.xlsx,.xls,.ods,.csv`
const PRESENTATION_ACCEPT = `${MIME.pptx},${MIME.ppt},${MIME.odp},.pptx,.ppt,.odp`
const HTML_ACCEPT = `${MIME.html},.html,.htm`
const RASTER_ACCEPT = `${MIME.webp},${MIME.bmp},${MIME.gif},${MIME.tiff},.webp,.bmp,.gif,.tiff,.tif`

export const ACCEPT_MAP = {
  pdf: `${MIME.pdf},.pdf`,
  image: `${MIME.jpeg},${MIME.png},${MIME.svg},.jpg,.jpeg,.png,.svg`,
  raster: RASTER_ACCEPT,
  text: `${MIME.plain},${MIME.markdown},.txt,.md,.markdown`,
  document: DOCUMENT_ACCEPT,
  spreadsheet: SPREADSHEET_ACCEPT,
  presentation: PRESENTATION_ACCEPT,
  html: HTML_ACCEPT,
  any: `${MIME.pdf},.pdf,${MIME.jpeg},${MIME.png},${MIME.svg},.jpg,.jpeg,.png,.svg,${MIME.plain},${MIME.markdown},.txt,.md,.markdown,${DOCUMENT_ACCEPT},${SPREADSHEET_ACCEPT},${PRESENTATION_ACCEPT},${HTML_ACCEPT},${RASTER_ACCEPT}`,
} as const

export const EXT_TO_MIME: Record<string, string> = {
  pdf: MIME.pdf,
  docx: MIME.docx,
  doc: MIME.doc,
  odt: MIME.odt,
  rtf: MIME.rtf,
  xlsx: MIME.xlsx,
  xls: MIME.xls,
  ods: MIME.ods,
  csv: MIME.csv,
  pptx: MIME.pptx,
  ppt: MIME.ppt,
  odp: MIME.odp,
  html: MIME.html,
  htm: MIME.html,
  zip: MIME.zip,
  jpg: MIME.jpeg,
  jpeg: MIME.jpeg,
  png: MIME.png,
  webp: MIME.webp,
  bmp: MIME.bmp,
  gif: MIME.gif,
  tiff: MIME.tiff,
  tif: MIME.tiff,
  svg: MIME.svg,
  md: MIME.markdown,
  markdown: MIME.markdown,
  txt: MIME.plain,
}

const DOCUMENT_EXTS = /\.(docx|doc|odt|rtf)$/i
const SPREADSHEET_EXTS = /\.(xlsx|xls|ods|csv)$/i
const PRESENTATION_EXTS = /\.(pptx|ppt|odp)$/i
const HTML_EXTS = /\.(html|htm)$/i
const RASTER_EXTS = /\.(webp|bmp|gif|tiff|tif)$/i

export function matchesAcceptKind(file: File, accept: keyof typeof ACCEPT_MAP): boolean {
  if (accept === 'pdf') return file.type === MIME.pdf || /\.pdf$/i.test(file.name)
  if (accept === 'image') {
    return (
      file.type === MIME.jpeg ||
      file.type === MIME.png ||
      file.type === MIME.svg ||
      /\.(jpg|jpeg|png|svg)$/i.test(file.name)
    )
  }
  if (accept === 'raster') {
    return (
      file.type === MIME.webp ||
      file.type === MIME.bmp ||
      file.type === MIME.gif ||
      file.type === MIME.tiff ||
      RASTER_EXTS.test(file.name)
    )
  }
  if (accept === 'text') {
    return (
      file.type === MIME.plain ||
      file.type === MIME.markdown ||
      /\.(md|markdown|txt)$/i.test(file.name)
    )
  }
  if (accept === 'document') {
    return (
      file.type === MIME.docx ||
      file.type === MIME.doc ||
      file.type === MIME.odt ||
      file.type === MIME.rtf ||
      DOCUMENT_EXTS.test(file.name)
    )
  }
  if (accept === 'spreadsheet') {
    return (
      file.type === MIME.xlsx ||
      file.type === MIME.xls ||
      file.type === MIME.ods ||
      file.type === MIME.csv ||
      SPREADSHEET_EXTS.test(file.name)
    )
  }
  if (accept === 'presentation') {
    return (
      file.type === MIME.pptx ||
      file.type === MIME.ppt ||
      file.type === MIME.odp ||
      PRESENTATION_EXTS.test(file.name)
    )
  }
  if (accept === 'html') {
    return file.type === MIME.html || HTML_EXTS.test(file.name)
  }
  if (accept === 'any') {
    return (
      matchesAcceptKind(file, 'pdf') ||
      matchesAcceptKind(file, 'image') ||
      matchesAcceptKind(file, 'raster') ||
      matchesAcceptKind(file, 'text') ||
      matchesAcceptKind(file, 'document') ||
      matchesAcceptKind(file, 'spreadsheet') ||
      matchesAcceptKind(file, 'presentation') ||
      matchesAcceptKind(file, 'html')
    )
  }
  return false
}

export const ACCEPT_HINTS: Record<keyof typeof ACCEPT_MAP, string> = {
  pdf: 'PDF files only · max 100 MB',
  image: 'JPG/PNG/SVG images · max 100 MB',
  raster: 'WEBP/BMP/GIF/TIFF images · max 100 MB',
  text: 'Markdown or text files · max 100 MB',
  document: 'Word documents (DOCX/DOC/ODT/RTF) · max 100 MB',
  spreadsheet: 'Spreadsheets (XLSX/XLS/ODS/CSV) · max 100 MB',
  presentation: 'Presentations (PPTX/PPT/ODP) · max 100 MB',
  html: 'HTML files · max 100 MB',
  any: 'Supported PDF, Office, image, or text files · max 100 MB',
}
