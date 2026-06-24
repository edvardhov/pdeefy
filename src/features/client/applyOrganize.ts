import { PDFDocument, degrees } from 'pdf-lib'
import type { OrganizePageState } from '@/features/client/editorTypes'

export async function applyOrganizePdf(
  file: Uint8Array,
  pages: OrganizePageState[],
): Promise<Uint8Array> {
  const source = await PDFDocument.load(file, { ignoreEncryption: true })
  const output = await PDFDocument.create()
  const activePages = pages.filter((page) => !page.deleted)

  for (const state of activePages) {
    const [copied] = await output.copyPages(source, [state.sourceIndex])
    if (state.rotation !== 0) {
      copied.setRotation(degrees(state.rotation))
    }
    output.addPage(copied)
  }

  if (output.getPageCount() === 0) {
    throw new Error('No pages remaining')
  }

  return output.save()
}
