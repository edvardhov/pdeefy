import { PDFDocument } from 'pdf-lib'

export async function flattenPdf(file: Uint8Array): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true })
  pdf.getForm().flatten()
  return pdf.save()
}
