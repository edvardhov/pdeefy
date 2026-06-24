import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'
import { MIME } from '@/constants/mime'
import type { Annotation, TextAnnotation, TextFontFamily } from '@/features/client/editorTypes'

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized

  const int = Number.parseInt(value, 16)
  const r = ((int >> 16) & 255) / 255
  const g = ((int >> 8) & 255) / 255
  const b = (int & 255) / 255
  return rgb(r, g, b)
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    const width = font.widthOfTextAtSize(candidate, fontSize)
    if (width <= maxWidth || !current) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

async function embedFonts(pdf: PDFDocument) {
  const [helvetica, times, courier] = await Promise.all([
    pdf.embedFont(StandardFonts.Helvetica),
    pdf.embedFont(StandardFonts.TimesRoman),
    pdf.embedFont(StandardFonts.Courier),
  ])
  return { helvetica, times, courier }
}

function resolveFont(
  fonts: Awaited<ReturnType<typeof embedFonts>>,
  family: TextFontFamily | undefined,
): PDFFont {
  switch (family) {
    case 'times':
      return fonts.times
    case 'courier':
      return fonts.courier
    default:
      return fonts.helvetica
  }
}

function drawTextAnnotation(
  page: ReturnType<PDFDocument['getPage']>,
  annotation: TextAnnotation,
  font: PDFFont,
) {
  if (annotation.cover) {
    page.drawRectangle({
      x: annotation.cover.x,
      y: annotation.cover.y,
      width: annotation.cover.width,
      height: annotation.cover.height,
      color: hexToRgb(annotation.cover.color),
      borderWidth: 0,
    })
  }

  const lineHeight = annotation.fontSize * 1.2
  const lines =
    annotation.width && annotation.width > 0
      ? wrapText(annotation.text, font, annotation.fontSize, annotation.width)
      : annotation.text.split('\n')

  lines.forEach((line, index) => {
    let x = annotation.x
    const lineWidth = font.widthOfTextAtSize(line, annotation.fontSize)

    if (annotation.width && annotation.align === 'center') {
      x = annotation.x + (annotation.width - lineWidth) / 2
    } else if (annotation.width && annotation.align === 'right') {
      x = annotation.x + annotation.width - lineWidth
    }

    page.drawText(line, {
      x,
      y: annotation.y - index * lineHeight,
      size: annotation.fontSize,
      font,
      color: hexToRgb(annotation.color),
    })
  })
}

export async function applyAnnotationsPdf(
  file: Uint8Array,
  annotations: Annotation[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true })
  const fonts = await embedFonts(pdf)

  for (const annotation of annotations) {
    const page = pdf.getPage(annotation.pageIndex)

    if (annotation.type === 'text') {
      const font = resolveFont(fonts, annotation.fontFamily)
      drawTextAnnotation(page, annotation, font)
      continue
    }

    const image =
      annotation.mimeType === MIME.png
        ? await pdf.embedPng(annotation.imageBytes)
        : await pdf.embedJpg(annotation.imageBytes)

    page.drawImage(image, {
      x: annotation.x,
      y: annotation.y,
      width: annotation.width,
      height: annotation.height,
    })
  }

  return pdf.save()
}
