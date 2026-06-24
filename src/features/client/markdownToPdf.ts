import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 50
const LINE_HEIGHT = 16
const CODE_LINE_HEIGHT = 14

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument['embedFont']>>, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

export async function markdownToPdf(textContent: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const mono = await pdf.embedFont(StandardFonts.Courier)

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN
  const maxWidth = PAGE_WIDTH - MARGIN * 2
  let inCodeBlock = false

  const newPageIfNeeded = (height: number) => {
    if (y - height < MARGIN) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      y = PAGE_HEIGHT - MARGIN
    }
  }

  const drawLine = (line: string, size: number, font: typeof regular, color = rgb(0, 0, 0)) => {
    newPageIfNeeded(LINE_HEIGHT)
    page.drawText(line, { x: MARGIN, y: y - size, size, font, color })
    y -= LINE_HEIGHT
  }

  for (const rawLine of textContent.split('\n')) {
    const line = rawLine.trimEnd()

    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      const wrapped = wrapText(line || ' ', mono, 10, maxWidth)
      for (const codeLine of wrapped) {
        newPageIfNeeded(CODE_LINE_HEIGHT)
        page.drawText(codeLine, {
          x: MARGIN,
          y: y - 10,
          size: 10,
          font: mono,
          color: rgb(0.15, 0.15, 0.15),
        })
        y -= CODE_LINE_HEIGHT
      }
      continue
    }

    if (!line.trim()) {
      y -= LINE_HEIGHT / 2
      continue
    }

    if (line.startsWith('# ')) {
      const wrapped = wrapText(line.slice(2), bold, 22, maxWidth)
      for (const headingLine of wrapped) {
        newPageIfNeeded(28)
        page.drawText(headingLine, { x: MARGIN, y: y - 22, size: 22, font: bold })
        y -= 28
      }
      continue
    }

    if (line.startsWith('## ')) {
      const wrapped = wrapText(line.slice(3), bold, 16, maxWidth)
      for (const headingLine of wrapped) {
        newPageIfNeeded(22)
        page.drawText(headingLine, { x: MARGIN, y: y - 16, size: 16, font: bold })
        y -= 22
      }
      continue
    }

    if (line.startsWith('- ')) {
      const wrapped = wrapText(line.slice(2), regular, 12, maxWidth - 16)
      for (let i = 0; i < wrapped.length; i++) {
        const prefix = i === 0 ? '• ' : '  '
        drawLine(`${prefix}${wrapped[i]}`, 12, regular)
      }
      continue
    }

    const wrapped = wrapText(line, regular, 12, maxWidth)
    for (const bodyLine of wrapped) {
      drawLine(bodyLine, 12, regular)
    }
  }

  return pdf.save()
}
