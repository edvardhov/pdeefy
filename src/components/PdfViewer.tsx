import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type { PDFDocumentProxy } from '@/lib/pdfjs'
import { getDocument, RenderingCancelledException } from '@/lib/pdfjs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FullscreenDialogContent } from '@/components/FullscreenDialogContent'

const MIN_SCALE = 0.5
const MAX_SCALE = 2
const MAX_AUTO_FIT_SCALE = 1
const DEFAULT_SCALE = 1
const SCALE_STEP = 0.25
const PAGE_ROOT_MARGIN = '120px 0px'

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))
}

function pageElementId(pageNumber: number) {
  return `pdf-page-${pageNumber}`
}

interface PdfPageViewProps {
  doc: PDFDocumentProxy
  pageNumber: number
  scale: number
  scrollRoot: HTMLDivElement | null
}

function PdfPageView({ doc, pageNumber, scale, scrollRoot }: PdfPageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
  const hasRenderedRef = useRef(false)
  const [rendering, setRendering] = useState(false)

  useEffect(() => {
    hasRenderedRef.current = false
  }, [scale, doc, pageNumber])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !canvasRef.current) return
    const canvasEl: HTMLCanvasElement = canvasRef.current

    let cancelled = false

    async function renderPage() {
      if (cancelled || hasRenderedRef.current) return

      setRendering(true)
      renderTaskRef.current?.cancel()

      try {
        const page = await doc.getPage(pageNumber)
        if (cancelled) return

        const viewport = page.getViewport({ scale })
        canvasEl.width = viewport.width
        canvasEl.height = viewport.height

        const ctx = canvasEl.getContext('2d')
        if (!ctx || cancelled) return

        const task = page.render({ canvas: canvasEl, canvasContext: ctx, viewport })
        renderTaskRef.current = task
        await task.promise

        if (!cancelled) {
          hasRenderedRef.current = true
          setRendering(false)
        }
      } catch (error) {
        if (
          !cancelled &&
          !(error instanceof RenderingCancelledException)
        ) {
          setRendering(false)
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void renderPage()
        }
      },
      { root: scrollRoot, rootMargin: PAGE_ROOT_MARGIN },
    )

    observer.observe(container)

    return () => {
      cancelled = true
      observer.disconnect()
      renderTaskRef.current?.cancel()
    }
  }, [doc, pageNumber, scale, scrollRoot])

  return (
    <div
      ref={containerRef}
      id={pageElementId(pageNumber)}
      data-page={pageNumber}
      className="relative mx-auto w-fit scroll-mt-3"
    >
      {rendering && (
        <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-muted/40">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="max-w-full rounded-sm border border-border/60 bg-white shadow-md"
        aria-label={`Page ${pageNumber}`}
      />
    </div>
  )
}

interface PdfViewerCoreProps {
  file: File
  className?: string
  scrollClassName?: string
  onLoaded?: (pageCount: number) => void
}

export function PdfViewerCore({
  file,
  className,
  scrollClassName,
  onLoaded,
}: PdfViewerCoreProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [scaleMode, setScaleMode] = useState<'fit' | 'custom'>('fit')
  const [customScale, setCustomScale] = useState(DEFAULT_SCALE)
  const [fitScale, setFitScale] = useState(DEFAULT_SCALE)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const onLoadedRef = useRef(onLoaded)
  onLoadedRef.current = onLoaded

  const effectiveScale =
    scaleMode === 'fit' ? fitScale : clampScale(customScale)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setDoc(null)
    setNumPages(0)
    setCurrentPage(1)
    setPageInput('1')
    setScaleMode('fit')
    setCustomScale(DEFAULT_SCALE)
    setFitScale(DEFAULT_SCALE)

    async function load() {
      try {
        const data = new Uint8Array(await file.arrayBuffer())
        const pdf = await getDocument({ data }).promise
        if (cancelled) return

        setDoc(pdf)
        setNumPages(pdf.numPages)
        setStatus('ready')
        onLoadedRef.current?.(pdf.numPages)
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [file])

  const updateFitScale = useCallback(async () => {
    if (!doc || !scrollRef.current) return

    const page = await doc.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    const width = scrollRef.current.clientWidth - 32
    if (width <= 0 || viewport.width <= 0) return

    const fitToWidth = width / viewport.width
    setFitScale(clampScale(Math.min(fitToWidth, MAX_AUTO_FIT_SCALE)))
  }, [doc])

  useEffect(() => {
    if (!doc || !scrollRoot) return

    void updateFitScale()

    const observer = new ResizeObserver(() => {
      void updateFitScale()
    })
    observer.observe(scrollRoot)

    return () => observer.disconnect()
  }, [doc, scrollRoot, updateFitScale])

  useEffect(() => {
    const root = scrollRef.current
    if (!root || numPages === 0) return

    const pages = Array.from(root.querySelectorAll<HTMLElement>('[data-page]'))
    if (pages.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length === 0) return

        const page = Number(visible[0].target.getAttribute('data-page'))
        if (!Number.isNaN(page)) {
          setCurrentPage(page)
          setPageInput(String(page))
        }
      },
      { root, threshold: [0.25, 0.5, 0.75] },
    )

    pages.forEach((page) => observer.observe(page))

    return () => observer.disconnect()
  }, [numPages, doc, effectiveScale])

  const scrollToPage = useCallback((page: number) => {
    const target = Math.min(Math.max(page, 1), numPages)
    scrollRef.current
      ?.querySelector<HTMLElement>(`#${pageElementId(target)}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrentPage(target)
    setPageInput(String(target))
  }, [numPages])

  const zoomIn = () => {
    const next = clampScale(
      (scaleMode === 'fit' ? fitScale : customScale) + SCALE_STEP,
    )
    setScaleMode('custom')
    setCustomScale(next)
  }

  const zoomOut = () => {
    const next = clampScale(
      (scaleMode === 'fit' ? fitScale : customScale) - SCALE_STEP,
    )
    setScaleMode('custom')
    setCustomScale(next)
  }

  const handlePageSubmit = (event: FormEvent) => {
    event.preventDefault()
    const parsed = Number.parseInt(pageInput, 10)
    if (!Number.isNaN(parsed)) scrollToPage(parsed)
  }

  const handlePageInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const parsed = Number.parseInt(pageInput, 10)
      if (!Number.isNaN(parsed)) scrollToPage(parsed)
    }
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={zoomOut}
          disabled={status !== 'ready' || effectiveScale <= MIN_SCALE}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 min-w-16 px-2 text-xs tabular-nums"
          onClick={() => setScaleMode('fit')}
          disabled={status !== 'ready'}
        >
          {Math.round(effectiveScale * 100)}%
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={zoomIn}
          disabled={status !== 'ready' || effectiveScale >= MAX_SCALE}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => scrollToPage(currentPage - 1)}
          disabled={status !== 'ready' || currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <form onSubmit={handlePageSubmit} className="flex items-center gap-1 text-xs">
          <Input
            type="number"
            min={1}
            max={numPages || 1}
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            onKeyDown={handlePageInputKeyDown}
            className="h-8 w-14 px-2 text-center text-xs tabular-nums"
            disabled={status !== 'ready'}
            aria-label="Current page"
          />
          <span className="text-muted-foreground tabular-nums">/ {numPages || '—'}</span>
        </form>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => scrollToPage(currentPage + 1)}
          disabled={status !== 'ready' || currentPage >= numPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className={cn('flex min-h-0 flex-col overflow-hidden', className)}>
      {toolbar}

      <div
        ref={(node) => {
          scrollRef.current = node
          setScrollRoot((prev) => (prev === node ? prev : node))
        }}
        className={cn(
          'min-h-[420px] flex-1 overflow-y-auto bg-muted/20 px-4 py-4',
          scrollClassName,
        )}
      >
        {status === 'loading' && (
          <div className="flex h-full min-h-[360px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
          </div>
        )}

        {status === 'error' && (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <FileText className="h-10 w-10" aria-hidden />
            <p className="text-sm">Could not open this PDF for preview.</p>
          </div>
        )}

        {status === 'ready' && doc && (
          <div className="mx-auto flex w-full max-w-full flex-col items-center gap-4">
            {Array.from({ length: numPages }, (_, index) => (
              <PdfPageView
                key={`${file.name}-${index + 1}-${effectiveScale}`}
                doc={doc}
                pageNumber={index + 1}
                scale={effectiveScale}
                scrollRoot={scrollRoot}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface PdfPreviewModalProps {
  file: File | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PdfPreviewModal({ file, open, onOpenChange }: PdfPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FullscreenDialogContent showCloseButton>
        <DialogHeader className="border-b px-4 py-3 text-left">
          <DialogTitle className="truncate pr-8">{file?.name ?? 'Preview'}</DialogTitle>
        </DialogHeader>
        {open && file && (
          <PdfViewerCore
            file={file}
            className="min-h-0 flex-1"
            scrollClassName="max-h-none"
          />
        )}
      </FullscreenDialogContent>
    </Dialog>
  )
}
