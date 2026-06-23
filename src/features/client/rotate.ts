import { PDFDocument, degrees } from 'pdf-lib'

export type RotationAngle = 90 | 180 | 270

export async function rotatePdf(file: Uint8Array, angle: RotationAngle): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(file, { ignoreEncryption: true })
  const rotation = degrees(angle)

  for (const page of pdf.getPages()) {
    page.setRotation(rotation)
  }

  return pdf.save()
}
