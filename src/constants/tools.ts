export const POPULAR_TOOL_IDS = [
  'merge',
  'split',
  'rotate',
  'jpg-to-pdf',
  'password-protect',
  'pdf-to-word',
  'ocr',
] as const

export const FEATURED_TOOL_IDS = [
  'merge',
  'split',
  'rotate',
  'jpg-to-pdf',
  'pdf-to-word',
  'ocr',
] as const

/**
 * Search synonyms/aliases keyed by tool id. These augment the tool name,
 * description, and category so users find tools by intent rather than exact
 * wording (e.g. "combine" -> Merge, "shrink" -> Compress, "docx" -> Word).
 */
export const SEARCH_KEYWORDS: Record<string, string[]> = {
  merge: ['combine', 'join', 'concat', 'concatenate', 'bind', 'append'],
  split: ['divide', 'separate', 'cut', 'halve', 'break'],
  extract: ['pull', 'grab', 'pick', 'select pages', 'export pages'],
  'delete-pages': ['remove', 'trim', 'drop', 'erase', 'remove pages'],
  organize: ['reorder', 'rearrange', 'arrange', 'sort', 'manage', 'reorganize'],
  rotate: ['turn', 'orient', 'landscape', 'portrait', 'sideways'],
  'fill-sign': ['sign', 'signature', 'esign', 'e-sign', 'fill', 'form', 'autograph', 'initials'],
  'add-text': ['text', 'annotate', 'write', 'type', 'edit text', 'caption'],
  'add-images': ['image', 'picture', 'photo', 'stamp', 'logo', 'insert image'],
  watermark: ['stamp', 'overlay', 'brand', 'confidential', 'draft'],
  'password-protect': ['encrypt', 'secure', 'lock', 'password', 'protect', 'encryption'],
  unlock: ['decrypt', 'remove password', 'unprotect', 'unsecure'],
  flatten: ['freeze', 'finalize', 'flatten form', 'lock fields'],
  'jpg-to-pdf': ['image to pdf', 'jpeg', 'jpg', 'png', 'svg', 'photo to pdf', 'picture to pdf'],
  'raster-to-pdf': ['webp', 'bmp', 'gif', 'tiff', 'tif', 'image to pdf'],
  'markdown-to-pdf': ['markdown', 'md', 'text to pdf', 'plain text'],
  'word-to-pdf': ['docx', 'doc', 'odt', 'rtf', 'microsoft word', 'document to pdf'],
  'excel-to-pdf': ['xlsx', 'xls', 'ods', 'csv', 'spreadsheet', 'sheet'],
  'powerpoint-to-pdf': ['pptx', 'ppt', 'odp', 'slides', 'presentation', 'deck'],
  'html-to-pdf': ['html', 'webpage', 'web page', 'website', 'url'],
  'pdf-to-word': ['docx', 'word', 'editable', 'doc'],
  'pdf-to-excel': ['xlsx', 'excel', 'spreadsheet', 'table', 'sheet'],
  'pdf-to-ppt': ['pptx', 'powerpoint', 'slides', 'presentation', 'deck'],
  'pdf-to-jpg': ['jpeg', 'jpg', 'image', 'photo'],
  'pdf-to-png': ['png', 'image', 'transparent'],
  'pdf-to-text': ['txt', 'plain text', 'extract text'],
  'pdf-to-html': ['html', 'webpage', 'web page'],
  ocr: ['scan', 'scanned', 'recognize', 'recognition', 'searchable', 'text recognition'],
  compress: ['reduce', 'shrink', 'optimize', 'smaller', 'size', 'minify', 'reduce size'],
  repair: ['fix', 'recover', 'corrupt', 'corrupted', 'broken', 'restore'],
}
