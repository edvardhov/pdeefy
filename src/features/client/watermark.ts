import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  type PDFImage,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib'

export type WatermarkMode = 'text' | 'image'
export type WatermarkLayout = 'single' | 'tile'

export interface WatermarkOptions {
  mode: WatermarkMode
  layout?: WatermarkLayout
  text?: string
  fontSize?: number
  opacity?: number
  imageBytes?: Uint8Array
  imageMime?: string
  imageFilename?: string
  /** Fraction of page width (0–1) */
  imageScale?: number
}

function clampOpacity(opacity: number) {
  return Math.min(1, Math.max(0, opacity))
}

async function embedImage(pdf: PDFDocument, bytes: Uint8Array, mime?: string, filename?: string) {
  const isPng =
    mime === 'image/png' ||
    filename?.toLowerCase().endsWith('.png') ||
    (bytes[0] === 0x89 && bytes[1] === 0x50)

  if (isPng) {
    return pdf.embedPng(bytes)
  }

  return pdf.embedJpg(bytes)
}

interface TileMetrics {
  cellWidth: number
  cellHeight: number
}

function forEachTilePosition(
  pageWidth: number,
  pageHeight: number,
  { cellWidth, cellHeight }: TileMetrics,
  drawAt: (x: number, y: number) => void,
) {
  const stepX = cellWidth * 1.4
  const stepY = cellHeight * 1.4
  const bleed = Math.max(pageWidth, pageHeight) * 0.35

  let row = 0
  for (let y = -bleed; y <= pageHeight + bleed; y += stepY, row++) {
    const rowOffset = row % 2 === 1 ? stepX / 2 : 0
    for (let x = -bleed + rowOffset; x <= pageWidth + bleed; x += stepX) {
      drawAt(x, y)
    }
  }
}

function drawTiledText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  fontSize: number,
  opacity: number,
  color: RGB,
) {
  const { width, height } = page.getSize()
  const textWidth = font.widthOfTextAtSize(text, fontSize)
  const metrics: TileMetrics = {
    cellWidth: textWidth + fontSize * 0.6,
    cellHeight: fontSize * 1.8,
  }

  forEachTilePosition(width, height, metrics, (x, y) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color,
      opacity,
      rotate: degrees(45),
    })
  })
}

function drawSingleText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  fontSize: number,
  opacity: number,
  color: RGB,
) {
  const { width, height } = page.getSize()
  page.drawText(text, {
    x: width / 4,
    y: height / 2,
    size: fontSize,
    font,
    color,
    opacity,
    rotate: degrees(45),
  })
}

function drawTiledImage(
  page: PDFPage,
  image: PDFImage,
  drawWidth: number,
  drawHeight: number,
  opacity: number,
) {
  const { width, height } = page.getSize()
  const metrics: TileMetrics = {
    cellWidth: drawWidth * 1.1,
    cellHeight: drawHeight * 1.1,
  }

  forEachTilePosition(width, height, metrics, (x, y) => {
    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
      opacity,
      rotate: degrees(45),
    })
  })
}

function drawSingleImage(
  page: PDFPage,
  image: PDFImage,
  drawWidth: number,
  drawHeight: number,
  opacity: number,
) {
  const { width: pageWidth, height: pageHeight } = page.getSize()
  page.drawImage(image, {
    x: (pageWidth - drawWidth) / 2,
    y: (pageHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
    opacity,
    rotate: degrees(45),
  })
}

export async function watermarkPdf(
  file: Uint8Array,
  options: WatermarkOptions,
): Promise<Uint8Array> {
  const opacity = clampOpacity(options.opacity ?? 0.3)
  const layout: WatermarkLayout = options.layout === 'single' ? 'single' : 'tile'
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true })

  if (options.mode === 'image') {
    if (!options.imageBytes?.length) {
      throw new Error('Watermark image is required')
    }

    const image = await embedImage(
      pdf,
      options.imageBytes,
      options.imageMime,
      options.imageFilename,
    )
    const imageScale = Math.min(1, Math.max(0.1, options.imageScale ?? 0.35))
    const embeddedSize = image.scale(1)

    for (const page of pdf.getPages()) {
      const { width: pageWidth } = page.getSize()
      const drawWidth = pageWidth * imageScale
      const drawHeight = (drawWidth / embeddedSize.width) * embeddedSize.height

      if (layout === 'tile') {
        drawTiledImage(page, image, drawWidth, drawHeight, opacity)
      } else {
        drawSingleImage(page, image, drawWidth, drawHeight, opacity)
      }
    }

    return pdf.save()
  }

  const text = options.text?.trim()
  if (!text) {
    throw new Error('Watermark text is required')
  }

  const font = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fontSize = options.fontSize ?? 48
  const color = rgb(0.55, 0.55, 0.55)

  for (const page of pdf.getPages()) {
    if (layout === 'tile') {
      drawTiledText(page, text, font, fontSize, opacity, color)
    } else {
      drawSingleText(page, text, font, fontSize, opacity, color)
    }
  }

  return pdf.save()
}
