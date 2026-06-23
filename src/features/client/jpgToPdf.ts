import { PDFDocument } from 'pdf-lib'

export async function jpgToPdf(files: Uint8Array[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()

  for (const bytes of files) {
    const image = await pdf.embedJpg(bytes)
    const { width, height } = image.scale(1)
    const page = pdf.addPage([width, height])
    page.drawImage(image, { x: 0, y: 0, width, height })
  }

  return pdf.save()
}

export async function pngToPdf(files: Uint8Array[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()

  for (const bytes of files) {
    const image = await pdf.embedPng(bytes)
    const { width, height } = image.scale(1)
    const page = pdf.addPage([width, height])
    page.drawImage(image, { x: 0, y: 0, width, height })
  }

  return pdf.save()
}
