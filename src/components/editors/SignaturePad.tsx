import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SignaturePadProps {
  onSave: (pngBytes: Uint8Array) => void
  onClear?: () => void
}

function trimCanvas(source: HTMLCanvasElement): HTMLCanvasElement | null {
  const ctx = source.getContext('2d')
  if (!ctx) return null

  const { width, height } = source
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  let hasInk = false

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > 8) {
        hasInk = true
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (!hasInk) return null

  const pad = 8
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)

  const trimmedWidth = maxX - minX + 1
  const trimmedHeight = maxY - minY + 1
  const trimmed = document.createElement('canvas')
  trimmed.width = trimmedWidth
  trimmed.height = trimmedHeight

  const trimmedCtx = trimmed.getContext('2d')
  if (!trimmedCtx) return null

  trimmedCtx.drawImage(source, minX, minY, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight)
  return trimmed
}

export function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [hasInk, setHasInk] = useState(false)

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = container.clientWidth
    const displayHeight = 140

    canvas.width = Math.floor(displayWidth * dpr)
    canvas.height = Math.floor(displayHeight * dpr)
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111111'
  }, [])

  useEffect(() => {
    syncCanvasSize()
  }, [syncCanvasSize])

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const startDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const point = getPoint(event)
    if (!canvas || !ctx || !point) return

    event.preventDefault()
    canvas.setPointerCapture(event.pointerId)
    drawingRef.current = true
    lastPointRef.current = point
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const point = getPoint(event)
    const last = lastPointRef.current
    if (!canvas || !ctx || !point || !last) return

    event.preventDefault()
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPointRef.current = point
    setHasInk(true)
  }

  const endDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    lastPointRef.current = null
    canvasRef.current?.releasePointerCapture(event.pointerId)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    onClear?.()
  }

  const save = async () => {
    const canvas = canvasRef.current
    if (!canvas || !hasInk) return

    const trimmed = trimCanvas(canvas)
    if (!trimmed) return

    const blob = await new Promise<Blob | null>((resolve) => {
      trimmed.toBlob(resolve, 'image/png')
    })
    if (!blob) return

    onSave(new Uint8Array(await blob.arrayBuffer()))
  }

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3">
      <p className="text-sm font-medium">Draw signature</p>
      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none rounded border bg-white"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onPointerCancel={endDraw}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Draw above, click &quot;Place signature&quot;, then click the PDF as many times as needed.
        Use Clear to start over.
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear} disabled={!hasInk}>
          <Eraser className="mr-1 h-4 w-4" />
          Clear
        </Button>
        <Button type="button" size="sm" onClick={() => void save()} disabled={!hasInk}>
          Place signature
        </Button>
      </div>
    </div>
  )
}
