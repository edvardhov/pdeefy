import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Annotation, ImageAnnotation, TextAnnotation } from '@/features/client/editorTypes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AnnotationItemProps {
  annotation: Annotation
  scale: number
  pageHeightPts: number
  selected: boolean
  startEditing?: boolean
  onEditingChange?: (editing: boolean) => void
  onSelect: (id: string) => void
  onCommit: (id: string, patch: Partial<TextAnnotation> | Partial<ImageAnnotation>) => void
  onDelete: (id: string) => void
}

function pdfToScreenTopLeft(
  x: number,
  y: number,
  height: number,
  pageHeightPts: number,
  scale: number,
) {
  return {
    left: x * scale,
    top: (pageHeightPts - y - height) * scale,
  }
}

function ImageAnnotationItem({
  annotation,
  scale,
  pageHeightPts,
  selected,
  onSelect,
  onCommit,
  onDelete,
}: Omit<AnnotationItemProps, 'annotation'> & { annotation: ImageAnnotation }) {
  const [draft, setDraft] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null,
  )
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const dragStart = useRef<{ x: number; y: number; annX: number; annY: number } | null>(null)
  const resizeStart = useRef<{ x: number; y: number; width: number; height: number } | null>(null)

  const imageUrlRef = useRef<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(annotation.imageBytes)], { type: annotation.mimeType }),
    )
    imageUrlRef.current = url
    setImageUrl(url)

    return () => {
      URL.revokeObjectURL(url)
      if (imageUrlRef.current === url) {
        imageUrlRef.current = null
      }
    }
  }, [annotation.id])

  const display = {
    x: draft?.x ?? annotation.x,
    y: draft?.y ?? annotation.y,
    width: draft?.width ?? annotation.width,
    height: draft?.height ?? annotation.height,
  }

  const { left, top } = pdfToScreenTopLeft(
    display.x,
    display.y,
    display.height,
    pageHeightPts,
    scale,
  )

  const handlePointerDown = (event: React.PointerEvent) => {
    event.stopPropagation()
    onSelect(annotation.id)
    setDragging(true)
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      annX: display.x,
      annY: display.y,
    }
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (dragging && dragStart.current) {
      const dx = (event.clientX - dragStart.current.x) / scale
      const dy = -(event.clientY - dragStart.current.y) / scale
      setDraft({
        x: dragStart.current.annX + dx,
        y: dragStart.current.annY + dy,
        width: display.width,
        height: display.height,
      })
    }

    if (resizing && resizeStart.current) {
      const dx = (event.clientX - resizeStart.current.x) / scale
      const dy = -(event.clientY - resizeStart.current.y) / scale
      setDraft({
        x: display.x,
        y: display.y,
        width: Math.max(20, resizeStart.current.width + dx),
        height: Math.max(20, resizeStart.current.height + dy),
      })
    }
  }

  const handlePointerUp = (event: React.PointerEvent) => {
    if (draft) {
      onCommit(annotation.id, {
        x: draft.x,
        y: draft.y,
        width: draft.width,
        height: draft.height,
      })
      setDraft(null)
    }
    setDragging(false)
    setResizing(false)
    dragStart.current = null
    resizeStart.current = null
    ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)
  }

  const handleResizeDown = (event: React.PointerEvent) => {
    event.stopPropagation()
    setResizing(true)
    resizeStart.current = {
      x: event.clientX,
      y: event.clientY,
      width: display.width,
      height: display.height,
    }
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }

  return (
    <div
      className={cn(
        'absolute z-10 touch-none select-none pointer-events-auto',
        selected && 'ring-2 ring-primary ring-offset-1',
      )}
      style={{
        left,
        top,
        width: display.width * scale,
        height: display.height * scale,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <img
        src={imageUrl ?? undefined}
        alt=""
        className="h-full w-full object-contain"
        draggable={false}
      />
      {selected && (
        <>
          <span
            className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-sm bg-primary"
            onPointerDown={handleResizeDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(annotation.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  )
}

function TextAnnotationItem({
  annotation,
  scale,
  pageHeightPts,
  selected,
  startEditing,
  onEditingChange,
  onSelect,
  onCommit,
  onDelete,
}: Omit<AnnotationItemProps, 'annotation'> & { annotation: TextAnnotation }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<{ x: number; y: number; width?: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const dragStart = useRef<{ x: number; y: number; annX: number; annY: number } | null>(null)
  const resizeStart = useRef<{ x: number; y: number; width: number } | null>(null)
  const editRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (startEditing) {
      setEditing(true)
    }
  }, [startEditing])

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      const range = document.createRange()
      range.selectNodeContents(editRef.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [editing])

  const display = {
    x: draft?.x ?? annotation.x,
    y: draft?.y ?? annotation.y,
    width: draft?.width ?? annotation.width ?? Math.max(80, annotation.text.length * annotation.fontSize * 0.55),
  }

  const textHeight = annotation.fontSize * 1.2
  const { left, top } = pdfToScreenTopLeft(display.x, display.y, textHeight, pageHeightPts, scale)
  const boxWidth = display.width * scale

  const handlePointerDown = (event: React.PointerEvent) => {
    if (editing) return
    event.stopPropagation()
    onSelect(annotation.id)
    setDragging(true)
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      annX: display.x,
      annY: display.y,
    }
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (dragging && dragStart.current) {
      const dx = (event.clientX - dragStart.current.x) / scale
      const dy = -(event.clientY - dragStart.current.y) / scale
      setDraft({
        x: dragStart.current.annX + dx,
        y: dragStart.current.annY + dy,
        width: display.width,
      })
    }

    if (resizing && resizeStart.current) {
      const dx = (event.clientX - resizeStart.current.x) / scale
      setDraft({
        x: display.x,
        y: display.y,
        width: Math.max(40, resizeStart.current.width + dx),
      })
    }
  }

  const handlePointerUp = (event: React.PointerEvent) => {
    if (draft) {
      onCommit(annotation.id, draft)
      setDraft(null)
    }
    setDragging(false)
    setResizing(false)
    dragStart.current = null
    resizeStart.current = null
    ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)
  }

  const handleResizeDown = (event: React.PointerEvent) => {
    event.stopPropagation()
    setResizing(true)
    resizeStart.current = {
      x: event.clientX,
      y: event.clientY,
      width: display.width,
    }
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }

  const commitTextEdit = () => {
    if (!editRef.current) return
    const nextText = editRef.current.innerText.trim()
    if (nextText) {
      onCommit(annotation.id, { text: nextText })
    }
    setEditing(false)
    onEditingChange?.(false)
  }

  return (
    <>
      {annotation.cover && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: annotation.cover.x * scale,
            top: (pageHeightPts - annotation.cover.y - annotation.cover.height) * scale,
            width: annotation.cover.width * scale,
            height: annotation.cover.height * scale,
            backgroundColor: annotation.cover.color,
          }}
        />
      )}
      <div
        className={cn(
          'absolute z-10 touch-none pointer-events-auto',
          selected && 'ring-2 ring-primary ring-offset-1',
          !editing && 'cursor-move select-none',
        )}
      style={{
        left,
        top,
        width: boxWidth,
        minHeight: textHeight * scale,
        fontSize: annotation.fontSize * scale,
        color: annotation.color,
        fontFamily:
          annotation.fontFamily === 'times'
            ? 'Times New Roman, serif'
            : annotation.fontFamily === 'courier'
              ? 'Courier New, monospace'
              : 'Helvetica, Arial, sans-serif',
        textAlign: annotation.align ?? 'left',
        lineHeight: 1.2,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={(event) => {
        event.stopPropagation()
        setEditing(true)
        onEditingChange?.(true)
      }}
    >
      {editing ? (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[1em] outline-none"
          onBlur={commitTextEdit}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              commitTextEdit()
            }
            if (event.key === 'Escape') {
              setEditing(false)
              onEditingChange?.(false)
            }
          }}
        >
          {annotation.text}
        </div>
      ) : (
        <span className="whitespace-pre-wrap break-words">{annotation.text}</span>
      )}
      {selected && !editing && (
        <>
          <span
            className="absolute -bottom-1 -right-1 h-3 w-3 cursor-e-resize rounded-sm bg-primary"
            onPointerDown={handleResizeDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(annotation.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
      </div>
    </>
  )
}

export function AnnotationItem(props: AnnotationItemProps) {
  if (props.annotation.type === 'image') {
    return <ImageAnnotationItem {...props} annotation={props.annotation} />
  }
  return <TextAnnotationItem {...props} annotation={props.annotation} />
}
