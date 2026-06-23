import { useCallback, useRef, useState } from 'react'
import { Upload, X, FileText, ImageIcon, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PdfPreviewModal } from '@/components/PdfViewer'
import { ACCEPT_MAP, MIME } from '@/constants/mime'
import { FILE_LIMITS } from '@/constants/files'
import type { AcceptedKind } from '@/features/types'

interface FileDropzoneProps {
  accept: AcceptedKind
  multiple?: boolean
  files: File[]
  onChange: (files: File[]) => void
  canPreviewFile?: (file: File) => boolean
  className?: string
}

function validateFile(file: File, accept: AcceptedKind): string | null {
  if (file.size > FILE_LIMITS.maxBytes) {
    return `${file.name} exceeds ${FILE_LIMITS.maxLabel} limit`
  }

  if (accept === 'pdf' && file.type !== MIME.pdf) {
    return `${file.name} is not a PDF`
  }

  if (accept === 'image' && !file.type.startsWith('image/')) {
    return `${file.name} is not an image`
  }

  if (
    accept === 'any' &&
    file.type !== MIME.pdf &&
    !file.type.startsWith('image/')
  ) {
    return `${file.name} is not a supported file type`
  }

  return null
}

export function FileDropzone({
  accept,
  multiple = false,
  files,
  onChange,
  canPreviewFile,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming)
      const valid: File[] = []

      for (const file of list) {
        const validationError = validateFile(file, accept)
        if (validationError) {
          setError(validationError)
          return
        }
        valid.push(file)
      }

      setError(null)
      onChange(multiple ? [...files, ...valid] : valid.slice(0, 1))
    },
    [accept, files, multiple, onChange],
  )

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files)
          }
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors',
          dragOver
            ? 'border-primary bg-punch-red-900/50 dark:bg-punch-red-300/10'
            : 'border-muted-foreground/25 hover:border-punch-red-600 hover:bg-muted/50',
        )}
      >
        <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">Drop files here or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {accept === 'pdf' && 'PDF files only · max 100 MB'}
          {accept === 'image' && 'JPG/PNG images · max 100 MB'}
          {accept === 'any' && 'PDF or image files · max 100 MB'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MAP[accept]}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
            >
              <div className="flex items-center gap-2 truncate">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {canPreviewFile?.(file) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    aria-label={`Preview ${file.name}`}
                    onClick={() => setPreviewFile(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PdfPreviewModal
        file={previewFile}
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null)
        }}
      />
    </div>
  )
}
