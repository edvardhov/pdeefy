export async function getImageDimensions(
  bytes: Uint8Array,
  mimeType: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: mimeType }))
    const image = new Image()
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(url)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to read image dimensions'))
    }
    image.src = url
  })
}
