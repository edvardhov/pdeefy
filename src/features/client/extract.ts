import { PDFDocument } from 'pdf-lib'
import { flattenRangeIndices, parseRanges } from '@/features/client/pageRanges'

export async function extractPagesPdf(file: Uint8Array, ranges: string): Promise<Uint8Array> {
  const source = await PDFDocument.load(file, { ignoreEncryption: true })
  const pageCount = source.getPageCount()
  const groups = parseRanges(ranges, pageCount)
  const indices = flattenRangeIndices(groups)

  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, indices)
  pages.forEach((page) => output.addPage(page))

  return output.save()
}
