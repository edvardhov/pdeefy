import { PDFDocument } from 'pdf-lib'
import { parsePageList } from '@/features/client/pageRanges'

export async function deletePagesPdf(file: Uint8Array, pagesSpec: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true })
  const pageCount = pdf.getPageCount()
  const toDelete = parsePageList(pagesSpec, pageCount)

  for (const pageNum of [...toDelete].sort((a, b) => b - a)) {
    pdf.removePage(pageNum - 1)
  }

  if (pdf.getPageCount() === 0) {
    throw new Error('Cannot delete all pages')
  }

  return pdf.save()
}
