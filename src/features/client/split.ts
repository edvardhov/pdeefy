import { PDFDocument } from 'pdf-lib'
import { parseRanges } from '@/features/client/pageRanges'

export type SplitMode = 'half' | 'pages'

export interface SplitParams {
  mode: SplitMode
  ranges?: string
}

export interface SplitOutput {
  name: string
  data: Uint8Array
}

async function extractPages(sourceBytes: Uint8Array, pageIndices: number[]): Promise<Uint8Array> {
  const source = await PDFDocument.load(sourceBytes, { ignoreEncryption: true })
  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, pageIndices)
  pages.forEach((page) => output.addPage(page))
  return output.save()
}

export async function splitPdf(
  file: Uint8Array,
  params: SplitParams,
  baseFilename = 'document',
): Promise<SplitOutput[]> {
  const source = await PDFDocument.load(file, { ignoreEncryption: true })
  const pageCount = source.getPageCount()

  if (pageCount === 0) {
    throw new Error('PDF has no pages')
  }

  if (params.mode === 'half') {
    const midpoint = Math.ceil(pageCount / 2)
    const firstIndices = Array.from({ length: midpoint }, (_, i) => i)
    const secondIndices = Array.from({ length: pageCount - midpoint }, (_, i) => midpoint + i)

    const outputs: SplitOutput[] = [
      {
        name: `${baseFilename}_part1.pdf`,
        data: await extractPages(file, firstIndices),
      },
    ]

    if (secondIndices.length > 0) {
      outputs.push({
        name: `${baseFilename}_part2.pdf`,
        data: await extractPages(file, secondIndices),
      })
    }

    return outputs
  }

  const ranges = parseRanges(params.ranges ?? '', pageCount)
  const outputs: SplitOutput[] = []

  for (let i = 0; i < ranges.length; i++) {
    outputs.push({
      name: `${baseFilename}_split${i + 1}.pdf`,
      data: await extractPages(file, ranges[i]),
    })
  }

  return outputs
}
