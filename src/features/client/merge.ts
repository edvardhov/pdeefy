import { PDFDocument } from 'pdf-lib'

export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()

  for (const bytes of files) {
    const source = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const pages = await merged.copyPages(source, source.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
  }

  return merged.save()
}
