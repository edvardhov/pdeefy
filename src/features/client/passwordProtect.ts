import { encryptPDF } from '@pdfsmaller/pdf-encrypt'

export async function passwordProtectPdf(
  file: Uint8Array,
  userPassword: string,
  ownerPassword?: string,
): Promise<Uint8Array> {
  if (!userPassword.trim()) {
    throw new Error('Password is required')
  }

  return encryptPDF(file, userPassword, {
    ownerPassword: ownerPassword?.trim() || userPassword,
  })
}
