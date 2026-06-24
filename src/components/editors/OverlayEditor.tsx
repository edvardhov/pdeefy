import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Redo2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { getDocument, RenderingCancelledException } from '@/lib/pdfjs'
import type { PDFDocumentProxy } from '@/lib/pdfjs'
import { MIME } from '@/constants/mime'
import type { EditorCapability } from '@/features/types'
import type {
  Annotation,
  ImageAnnotation,
  TextAnnotation,
  TextRun,
} from '@/features/client/editorTypes'
import {
  extractTextRuns,
  sampleCanvasColor,
  textRunToScreen,
} from '@/features/client/extractTextLayer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SignaturePad } from '@/components/editors/SignaturePad'
import { AnnotationItem } from '@/components/editors/AnnotationItem'
import { useEditorHistory } from '@/components/editors/useEditorHistory'
import { getImageDimensions } from '@/lib/imageDimensions'
import { cn } from '@/lib/utils'

interface OverlayEditorProps {
  file: File
  capabilities: EditorCapability[]
  onApply: (annotations: Annotation[]) => void
  processing?: boolean
}

const DEFAULT_TEXT = 'New text'
const DEFAULT_IMAGE_WIDTH = 120
const DEFAULT_IMAGE_HEIGHT = 80
const DEFAULT_SIGNATURE_WIDTH = 150
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2.5
const ZOOM_STEP = 0.15

export function OverlayEditor({ file, capabilities, onApply, processing }: OverlayEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)

  const [pdfLoading, setPdfLoading] = useState(true)
  const [pageRendering, setPageRendering] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [baseScale, setBaseScale] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [pageHeightPts, setPageHeightPts] = useState(842)
  const [pageWidthPts, setPageWidthPts] = useState(595)
  const [textRunsByPage, setTextRunsByPage] = useState<Map<number, TextRun[]>>(new Map())
  const [editedRunIds, setEditedRunIds] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [mode, setMode] = useState<'text' | 'image' | 'signature' | null>(null)
  const [pendingSignature, setPendingSignature] = useState<Uint8Array | null>(null)
  const [pendingImage, setPendingImage] = useState<{ bytes: Uint8Array; mimeType: string } | null>(
    null,
  )

  const [textValue, setTextValue] = useState(DEFAULT_TEXT)
  const [textSize, setTextSize] = useState('14')
  const [textColor, setTextColor] = useState('#111111')
  const [textFont, setTextFont] = useState<'helvetica' | 'times' | 'courier'>('helvetica')

  const { annotations, push, replace, undo, redo, canUndo, canRedo } = useEditorHistory()

  const scale = baseScale * zoom

  const canEditText = capabilities.includes('editText')
  const canAddText = capabilities.includes('addText')
  const canAddImage = capabilities.includes('addImage')
  const canSign = capabilities.includes('signature')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setPdfLoading(true)
      try {
        const data = new Uint8Array(await file.arrayBuffer())
        const pdf = await getDocument({ data }).promise
        if (cancelled) return

        pdfDocRef.current = pdf
        setPageCount(pdf.numPages)
        setCurrentPage(0)
        setEditedRunIds(new Set())
        replace([])
        setPdfLoading(false)

        if (canEditText) {
          const runsMap = new Map<number, TextRun[]>()
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber)
            if (cancelled) return
            runsMap.set(pageNumber - 1, await extractTextRuns(page, pageNumber - 1))
          }
          if (!cancelled) setTextRunsByPage(runsMap)
        }
      } catch {
        if (!cancelled) setPdfLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [file, canEditText, replace])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateWidth = () => {
      setContainerWidth(container.clientWidth)
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(container)
    return () => observer.disconnect()
  }, [pdfLoading, pageCount])

  useEffect(() => {
    let cancelled = false

    async function renderPage() {
      const canvas = canvasRef.current
      const pdf = pdfDocRef.current
      if (pdfLoading || !canvas || !pdf || pageCount === 0 || containerWidth <= 0) {
        setPageRendering(false)
        return
      }

      setPageRendering(true)
      renderTaskRef.current?.cancel()

      try {
        const page = await pdf.getPage(currentPage + 1)
        if (cancelled) return

        const viewport = page.getViewport({ scale: 1 })
        const fitWidth = Math.min(containerWidth - 16, viewport.width)
        if (fitWidth <= 0) return

        const nextBaseScale = fitWidth / viewport.width
        const scaledViewport = page.getViewport({ scale: nextBaseScale * zoom })

        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
        const ctx = canvas.getContext('2d')
        if (!ctx || cancelled) return

        const task = page.render({ canvas, canvasContext: ctx, viewport: scaledViewport })
        renderTaskRef.current = task
        await task.promise

        if (!cancelled) {
          setBaseScale(nextBaseScale)
          setPageHeightPts(viewport.height)
          setPageWidthPts(viewport.width)
        }
      } catch (error) {
        if (!cancelled && !(error instanceof RenderingCancelledException)) {
          console.error('PDF page render failed', error)
        }
      } finally {
        if (!cancelled) setPageRendering(false)
      }
    }

    void renderPage()
    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
    }
  }, [pdfLoading, currentPage, pageCount, zoom, containerWidth])

  const screenToPdf = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const x = (clientX - rect.left) / scale
      const y = pageHeightPts - (clientY - rect.top) / scale
      return { x, y }
    },
    [scale, pageHeightPts],
  )

  const commitAnnotation = useCallback(
    (id: string, patch: Partial<TextAnnotation> | Partial<ImageAnnotation>) => {
      push((prev) =>
        prev.map((annotation) =>
          annotation.id === id ? ({ ...annotation, ...patch } as Annotation) : annotation,
        ),
      )
    },
    [push],
  )

  const deleteAnnotation = useCallback(
    (id: string) => {
      push((prev) => prev.filter((annotation) => annotation.id !== id))
      setSelectedId((current) => (current === id ? null : current))
    },
    [push],
  )

  const addTextAt = (clientX: number, clientY: number) => {
    if (!textValue.trim()) return
    const { x, y } = screenToPdf(clientX, clientY)
    const annotation: TextAnnotation = {
      id: crypto.randomUUID(),
      pageIndex: currentPage,
      type: 'text',
      x,
      y,
      text: textValue,
      fontSize: Number.parseInt(textSize, 10) || 14,
      color: textColor,
      fontFamily: textFont,
      origin: 'new',
      width: Math.max(120, textValue.length * (Number.parseInt(textSize, 10) || 14) * 0.55),
    }
    push((prev) => [...prev, annotation])
    setSelectedId(annotation.id)
    setMode(null)
  }

  const addImageAt = (
    clientX: number,
    clientY: number,
    bytes: Uint8Array,
    mimeType: string,
    options?: {
      targetWidth?: number
      center?: boolean
      pageIndex?: number
      keepPlacing?: boolean
    },
  ) => {
    const pageIndex = options?.pageIndex ?? currentPage
    const { x, y } = screenToPdf(clientX, clientY)
    const imageBytes = new Uint8Array(bytes)
    let width = options?.targetWidth ?? DEFAULT_IMAGE_WIDTH
    let height =
      options?.targetWidth != null ? options.targetWidth * 0.45 : DEFAULT_IMAGE_HEIGHT

    const pdfX = options?.center ? x - width / 2 : x
    const pdfY = options?.center ? y - height / 2 : y
    const id = crypto.randomUUID()

    const annotation: ImageAnnotation = {
      id,
      pageIndex,
      type: 'image',
      x: pdfX,
      y: pdfY,
      width,
      height,
      imageBytes,
      mimeType,
    }

    push((prev) => [...prev, annotation])
    setSelectedId(id)

    if (options?.keepPlacing) {
      setMode('signature')
    } else {
      setMode(null)
      setPendingSignature(null)
      setPendingImage(null)
    }

    if (mimeType === MIME.png || mimeType === MIME.jpeg) {
      void getImageDimensions(imageBytes, mimeType)
        .then((dims) => {
          if (dims.width <= 0 || dims.height <= 0) return
          const nextHeight = (dims.height / dims.width) * width
          commitAnnotation(id, { height: nextHeight })
        })
        .catch(() => {
          // keep default height
        })
    }
  }

  const promoteTextRun = (run: TextRun) => {
    if (editedRunIds.has(run.id)) return

    const canvas = canvasRef.current
    const screen = textRunToScreen(run, pageHeightPts, scale)
    const coverColor = canvas
      ? sampleCanvasColor(canvas, screen)
      : '#ffffff'

    const annotation: TextAnnotation = {
      id: crypto.randomUUID(),
      pageIndex: run.pageIndex,
      type: 'text',
      x: run.xPdf,
      y: run.yPdf + run.height * 0.8,
      text: run.text,
      fontSize: run.fontSize,
      color: '#111111',
      fontFamily: 'helvetica',
      origin: 'existing',
      sourceRunId: run.id,
      width: Math.max(run.width, 40),
      cover: {
        x: run.xPdf - 1,
        y: run.yPdf - 1,
        width: run.width + 2,
        height: run.height + 2,
        color: coverColor,
      },
    }

    push((prev) => [...prev, annotation])
    setEditedRunIds((prev) => new Set(prev).add(run.id))
    setSelectedId(annotation.id)
    setEditingId(annotation.id)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'text') {
      addTextAt(event.clientX, event.clientY)
      return
    }

    if (mode === 'signature' && pendingSignature) {
      addImageAt(event.clientX, event.clientY, pendingSignature, MIME.png, {
        targetWidth: DEFAULT_SIGNATURE_WIDTH,
        center: true,
        pageIndex: currentPage,
        keepPlacing: true,
      })
      return
    }

    if (mode === 'image' && pendingImage) {
      const { bytes, mimeType } = pendingImage
      const pageIndex = currentPage
      setPendingImage(null)
      setMode(null)
      addImageAt(event.clientX, event.clientY, bytes, mimeType, {
        center: true,
        pageIndex,
      })
      return
    }

    setSelectedId(null)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = event.target.files?.[0]
    event.target.value = ''
    if (!uploaded) return

    const bytes = new Uint8Array(await uploaded.arrayBuffer())
    setPendingImage({ bytes, mimeType: uploaded.type || MIME.png })
    setMode('image')
    setSelectedId(null)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault()
        deleteAnnotation(selectedId)
      }

      if (event.key === 'Escape') {
        setSelectedId(null)
        setMode(null)
        setPendingSignature(null)
        setPendingImage(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, undo, redo, deleteAnnotation])

  const pageAnnotations = annotations.filter((annotation) => annotation.pageIndex === currentPage)
  const pageTextRuns = (textRunsByPage.get(currentPage) ?? []).filter(
    (run) => !editedRunIds.has(run.id),
  )

  if (pdfLoading && pageCount === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {canAddText && (
          <Button
            type="button"
            variant={mode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode(mode === 'text' ? null : 'text')}
          >
            <Type className="mr-1 h-4 w-4" />
            Add text
          </Button>
        )}
        {canAddImage && (
          <Button type="button" variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <ImagePlus className="mr-1 h-4 w-4" />
              Add image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleImageUpload(e)} />
            </label>
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" disabled={!canUndo} onClick={undo}>
          <Undo2 className="mr-1 h-4 w-4" />
          Undo
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!canRedo} onClick={redo}>
          <Redo2 className="mr-1 h-4 w-4" />
          Redo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {mode === 'text' && canAddText && (
        <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-4">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="overlay-text">Text</Label>
            <Input id="overlay-text" value={textValue} onChange={(e) => setTextValue(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="overlay-size">Size</Label>
            <Input
              id="overlay-size"
              type="number"
              min={8}
              max={72}
              value={textSize}
              onChange={(e) => setTextSize(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="overlay-color">Color</Label>
            <Input
              id="overlay-color"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="overlay-font">Font</Label>
            <select
              id="overlay-font"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={textFont}
              onChange={(e) => setTextFont(e.target.value as typeof textFont)}
            >
              <option value="helvetica">Helvetica</option>
              <option value="times">Times</option>
              <option value="courier">Courier</option>
            </select>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-4">
            Click on the page to place text. Double-click placed text to edit inline.
          </p>
        </div>
      )}

      {canEditText && (
        <p className="text-xs text-muted-foreground">
          Click existing text on the page to edit it. Replacement fonts are approximated; layout
          does not reflow automatically.
        </p>
      )}

      {canSign && (
        <SignaturePad
          onSave={(bytes) => {
            setPendingSignature(bytes)
            setMode('signature')
            setSelectedId(null)
          }}
          onClear={() => {
            setPendingSignature(null)
            if (mode === 'signature') setMode(null)
          }}
        />
      )}

      {mode === 'signature' && pendingSignature && (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
          Click on the PDF to place your signature — repeat on any page. Press Esc when done.
        </p>
      )}

      {mode === 'image' && pendingImage && (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
          Click on the PDF to place the image. Press Esc to cancel.
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={currentPage <= 0}
          onClick={() => {
            setCurrentPage((page) => page - 1)
            setSelectedId(null)
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage + 1} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={currentPage >= pageCount - 1}
          onClick={() => {
            setCurrentPage((page) => page + 1)
            setSelectedId(null)
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div ref={containerRef} className="relative mx-auto max-w-3xl overflow-auto">
        <div
          className="relative mx-auto"
          style={{ width: pageWidthPts * scale, height: pageHeightPts * scale }}
        >
          <div className="relative">
            {(pageRendering || pdfLoading) && (
              <div className="absolute inset-0 z-[1] flex items-center justify-center rounded border bg-muted/30">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={cn(
                'relative z-0 block max-w-full rounded border bg-white shadow-sm',
                mode === 'text' || mode === 'signature' || mode === 'image'
                  ? 'cursor-crosshair'
                  : 'cursor-default',
              )}
              style={{ width: pageWidthPts * scale, height: pageHeightPts * scale }}
              onClick={handleCanvasClick}
            />
          </div>

          {canEditText &&
            mode !== 'signature' &&
            mode !== 'image' &&
            pageTextRuns.map((run) => {
              const screen = textRunToScreen(run, pageHeightPts, scale)
              return (
                <button
                  key={run.id}
                  type="button"
                  className="absolute z-[1] cursor-text rounded px-0.5 text-left hover:bg-primary/10 hover:outline hover:outline-1 hover:outline-primary/40"
                  style={{
                    top: screen.top,
                    left: screen.left,
                    width: Math.max(screen.width, 8),
                    height: Math.max(screen.height, screen.fontSize),
                    fontSize: screen.fontSize,
                    lineHeight: 1.2,
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    promoteTextRun(run)
                  }}
                >
                  <span className="invisible whitespace-pre">{run.text}</span>
                </button>
              )
            })}

          {pageAnnotations.map((annotation) => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              scale={scale}
              pageHeightPts={pageHeightPts}
              selected={selectedId === annotation.id}
              startEditing={editingId === annotation.id}
              onEditingChange={(editing) => {
                if (!editing && editingId === annotation.id) setEditingId(null)
              }}
              onSelect={setSelectedId}
              onCommit={commitAnnotation}
              onDelete={deleteAnnotation}
            />
          ))}
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={processing || annotations.length === 0}
        onClick={() => onApply(annotations)}
      >
        {processing ? 'Applying…' : 'Apply changes'}
      </Button>
    </div>
  )
}
