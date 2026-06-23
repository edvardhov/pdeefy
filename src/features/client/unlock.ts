import { decryptPDF } from 'cryptpdf'

export async function unlockPdf(file: Uint8Array, password: string): Promise<Uint8Array> {
  if (!password.trim()) {
    throw new Error('Password is required')
  }

  return decryptPDF(file, password)
}
