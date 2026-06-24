import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, RotateCw, Trash2 } from 'lucide-react'
import { getDocument } from '@/lib/pdfjs'
import type { EditorCapability } from '@/features/types'
import type { OrganizePageState } from '@/features/client/editorTypes'
import type { RotationAngle } from '@/features/client/rotate'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GridEditorProps {
  file: File
  capabilities: EditorCapability[]
  onApply: (pages: OrganizePageState[]) => void
  processing?: boolean
}

function nextRotation(current: RotationAngle): RotationAngle {
  if (current === 0) return 90
  if (current === 90) return 180
  if (current === 180) return 270
  return 0
}

export function GridEditor({ file, capabilities, onApply, processing }: GridEditorProps) {
  const [pages, setPages] = useState<OrganizePageState[]>([])
  const [loading, setLoading] = useState(true)
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map())
  const dragIndex = useRef<number | null>(null)

  const canReorder = capabilities.includes('reorder')
  const canRotate = capabilities.includes('rotatePage')
  const canDelete = capabilities.includes('deletePage')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = new Uint8Array(await file.arrayBuffer())
        const pdf = await getDocument({ data }).promise
        const count = pdf.numPages
        const initialPages: OrganizePageState[] = Array.from({ length: count }, (_, index) => ({
          id: `page-${index}`,
          sourceIndex: index,
          rotation: 0,
          deleted: false,
        }))

        const thumbMap = new Map<number, string>()
        for (let pageNumber = 1; pageNumber <= count; pageNumber++) {
          const page = await pdf.getPage(pageNumber)
          const viewport = page.getViewport({ scale: 0.25 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          await page.render({ canvas, canvasContext: ctx, viewport }).promise
          thumbMap.set(pageNumber - 1, canvas.toDataURL())
        }

        if (!cancelled) {
          setPages(initialPages)
          setThumbnails(thumbMap)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [file])

  const visiblePages = pages.filter((page) => !page.deleted)

  const handleDragStart = (index: number) => {
    if (!canReorder) return
    dragIndex.current = index
  }

  const handleDrop = (targetIndex: number) => {
    if (!canReorder || dragIndex.current === null) return
    const from = dragIndex.current
    dragIndex.current = null
    if (from === targetIndex) return

    setPages((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
  }

  const rotatePage = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === id ? { ...page, rotation: nextRotation(page.rotation) } : page,
      ),
    )
  }, [])

  const deletePage = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, deleted: true } : page)),
    )
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {canReorder ? 'Drag thumbnails to reorder. ' : ''}
        {canRotate ? 'Rotate or delete pages as needed.' : 'Adjust pages as needed.'}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visiblePages.map((page, index) => (
          <div
            key={page.id}
            draggable={canReorder}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(index)}
            className={cn(
              'rounded-lg border bg-card p-2',
              canReorder && 'cursor-grab active:cursor-grabbing',
            )}
          >
            <div className="relative overflow-hidden rounded border bg-white">
              {thumbnails.get(page.sourceIndex) ? (
                <img
                  src={thumbnails.get(page.sourceIndex)}
                  alt={`Page ${page.sourceIndex + 1}`}
                  className="w-full"
                  style={{ transform: `rotate(${page.rotation}deg)` }}
                />
              ) : (
                <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
                  Page {page.sourceIndex + 1}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="text-xs text-muted-foreground">Page {page.sourceIndex + 1}</span>
              <div className="flex gap-1">
                {canRotate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => rotatePage(page.id)}
                    aria-label="Rotate page"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => deletePage(page.id)}
                    aria-label="Delete page"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={processing || visiblePages.length === 0}
        onClick={() => onApply(pages)}
      >
        {processing ? 'Applying…' : 'Apply changes'}
      </Button>
    </div>
  )
}
