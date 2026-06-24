import { EXT_TO_MIME, MIME } from '@/constants/mime'
import type { OutputNamingDerive, OutputNamingFixed, OutputZipNaming } from '@/features/types'

export function bytesToPdfFile(data: Uint8Array, filename: string): File {
  const copy = new Uint8Array(data)
  return new File([copy], filename, { type: MIME.pdf })
}

export async function downloadToolOutputs(
  outputs: DownloadItem[],
  zipName?: string,
): Promise<void> {
  if (outputs.length === 0) return

  if (outputs.length === 1) {
    downloadBytes(outputs[0].data, outputs[0].name)
    return
  }

  await downloadMultiple(outputs, zipName ?? 'output.zip')
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadBytes(data: Uint8Array, filename: string, mimeType = MIME.pdf) {
  const copy = new Uint8Array(data)
  downloadBlob(new Blob([copy], { type: mimeType }), filename)
}

export interface DownloadItem {
  name: string
  data: Uint8Array
}

export async function downloadMultiple(items: DownloadItem[], zipName: string) {
  const { downloadZip } = await import('client-zip')

  if (items.length === 1) {
    downloadBytes(items[0].data, items[0].name)
    return
  }

  const zipBlob = await downloadZip(
    items.map((item) => ({
      name: item.name,
      input: item.data,
    })),
  ).blob()

  downloadBlob(zipBlob, zipName)
}

export function baseName(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? filename : filename.slice(0, dot)
}

export function resolveMimeForExt(filename: string, fallback = MIME.pdf): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return fallback
  const ext = filename.slice(dot + 1).toLowerCase()
  return EXT_TO_MIME[ext] ?? fallback
}

export function buildOutputName(
  sourceFilename: string | undefined,
  naming: OutputNamingFixed | OutputNamingDerive,
): string {
  if (naming.strategy === 'fixed') return naming.name

  const base = sourceFilename ? baseName(sourceFilename) : 'output'
  const ext =
    naming.ext ??
    (sourceFilename?.includes('.') ? sourceFilename.slice(sourceFilename.lastIndexOf('.') + 1) : 'pdf')

  return `${naming.prefix ?? ''}${base}${naming.suffix ?? ''}.${ext}`
}

export function buildZipName(
  sourceFilename: string | undefined,
  zipNaming?: OutputZipNaming,
): string | undefined {
  if (!zipNaming) return undefined
  const base = sourceFilename ? baseName(sourceFilename) : 'output'
  return `${zipNaming.prefix ?? ''}${base}${zipNaming.suffix ?? '_output.zip'}`
}
