const DEFAULT_SVG_WIDTH = 800
const DEFAULT_SVG_HEIGHT = 600

function parseSvgDimensions(svgText: string): { width: number; height: number } {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const svg = doc.documentElement
  if (svg.tagName.toLowerCase() === 'parsererror') {
    throw new Error('Invalid SVG file')
  }

  const viewBox = svg.getAttribute('viewBox')?.trim().split(/\s+/)
  if (viewBox?.length === 4) {
    const width = Number.parseFloat(viewBox[2])
    const height = Number.parseFloat(viewBox[3])
    if (width > 0 && height > 0) {
      return { width, height }
    }
  }

  const width = Number.parseFloat(svg.getAttribute('width') ?? '')
  const height = Number.parseFloat(svg.getAttribute('height') ?? '')
  return {
    width: width > 0 ? width : DEFAULT_SVG_WIDTH,
    height: height > 0 ? height : DEFAULT_SVG_HEIGHT,
  }
}

export function isSvgFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return file.type === 'image/svg+xml' || name.endsWith('.svg')
}

export async function svgToPngBytes(file: File): Promise<Uint8Array> {
  const svgText = await file.text()
  const { width, height } = parseSvgDimensions(svgText)
  const blob = new Blob([svgText], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load SVG image'))
      img.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(width)
    canvas.height = Math.ceil(height)
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to rasterize SVG')
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result)
        else reject(new Error('Failed to convert SVG to PNG'))
      }, 'image/png')
    })

    return new Uint8Array(await pngBlob.arrayBuffer())
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function svgToPngFile(file: File): Promise<File> {
  const pngBytes = await svgToPngBytes(file)
  const pngName = file.name.replace(/\.svg$/i, '.png')
  return new File([new Uint8Array(pngBytes)], pngName, { type: 'image/png' })
}
