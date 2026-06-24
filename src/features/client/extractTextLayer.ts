import type { PDFPageProxy } from 'pdfjs-dist'
import type { TextRun } from '@/features/client/editorTypes'

interface TextItemLike {
  str: string
  transform: number[]
  width: number
  height: number
  hasEOL?: boolean
}

const BASELINE_TOLERANCE = 2
const GAP_TOLERANCE = 4

function fontSizeFromTransform(transform: number[]): number {
  return Math.hypot(transform[2], transform[3])
}

function itemBoundsPdf(item: TextItemLike) {
  const [, , , , e, f] = item.transform
  const fontSize = fontSizeFromTransform(item.transform)
  const width = item.width > 0 ? item.width : item.str.length * fontSize * 0.5
  const height = item.height > 0 ? item.height : fontSize

  const x = e
  const yBaseline = f
  const y = yBaseline - height * 0.2

  return { x, y, width, height, fontSize, baseline: yBaseline }
}

function sameBaseline(a: number, b: number): boolean {
  return Math.abs(a - b) <= BASELINE_TOLERANCE
}

function mergeRuns(runs: TextRun[]): TextRun {
  const first = runs[0]
  const minX = Math.min(...runs.map((run) => run.xPdf))
  const minY = Math.min(...runs.map((run) => run.yPdf))
  const maxX = Math.max(...runs.map((run) => run.xPdf + run.width))
  const maxY = Math.max(...runs.map((run) => run.yPdf + run.height))

  return {
    id: first.id,
    pageIndex: first.pageIndex,
    text: runs.map((run) => run.text).join(''),
    xPdf: minX,
    yPdf: minY,
    width: maxX - minX,
    height: maxY - minY,
    fontSize: first.fontSize,
  }
}

export async function extractTextRuns(page: PDFPageProxy, pageIndex: number): Promise<TextRun[]> {
  const textContent = await page.getTextContent()
  const items: TextItemLike[] = []

  for (const item of textContent.items) {
    if (!('str' in item) || typeof item.str !== 'string' || item.str.length === 0) {
      continue
    }
    items.push(item as TextItemLike)
  }

  const rawRuns: TextRun[] = items.map((item, index) => {
    const bounds = itemBoundsPdf(item)
    return {
      id: `run-${pageIndex}-${index}`,
      pageIndex,
      text: item.str,
      xPdf: bounds.x,
      yPdf: bounds.y,
      width: bounds.width,
      height: bounds.height,
      fontSize: bounds.fontSize,
      _baseline: bounds.baseline,
      _endX: bounds.x + bounds.width,
    } as TextRun & { _baseline: number; _endX: number }
  })

  if (rawRuns.length === 0) return []

  const grouped: TextRun[] = []
  let current: (TextRun & { _baseline: number; _endX: number })[] = [rawRuns[0] as TextRun & { _baseline: number; _endX: number }]

  for (let index = 1; index < rawRuns.length; index++) {
    const item = rawRuns[index] as TextRun & { _baseline: number; _endX: number }
    const prev = current[current.length - 1]
    const gap = item.xPdf - prev._endX
    const canMerge =
      sameBaseline(item._baseline, prev._baseline) &&
      gap >= -1 &&
      gap <= GAP_TOLERANCE + prev.fontSize * 0.5

    if (canMerge && !items[index - 1]?.hasEOL) {
      current.push(item)
    } else {
      grouped.push(mergeRuns(current))
      current = [item]
    }
  }

  grouped.push(mergeRuns(current))
  return grouped.filter((run) => run.text.trim().length > 0)
}

export function textRunToScreen(
  run: TextRun,
  pageHeightPts: number,
  scale: number,
): { top: number; left: number; width: number; height: number; fontSize: number } {
  return {
    top: (pageHeightPts - run.yPdf - run.height) * scale,
    left: run.xPdf * scale,
    width: run.width * scale,
    height: run.height * scale,
    fontSize: run.fontSize * scale,
  }
}

export function sampleCanvasColor(
  canvas: HTMLCanvasElement,
  screenRect: { left: number; top: number; width: number; height: number },
): string {
  const ctx = canvas.getContext('2d')
  if (!ctx) return '#ffffff'

  const sampleX = Math.min(
    canvas.width - 1,
    Math.max(0, Math.floor(screenRect.left + screenRect.width / 2)),
  )
  const sampleY = Math.min(
    canvas.height - 1,
    Math.max(0, Math.floor(screenRect.top + screenRect.height / 2)),
  )

  const [r, g, b] = ctx.getImageData(sampleX, sampleY, 1, 1).data
  const toHex = (value: number) => value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
