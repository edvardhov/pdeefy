export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadBytes(data: Uint8Array, filename: string, mimeType = 'application/pdf') {
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
