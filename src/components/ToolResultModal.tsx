import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { PdfViewerCore } from '@/components/PdfViewer'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ToolOutputFile } from '@/features/types'
import { bytesToPdfFile, downloadToolOutputs } from '@/lib/download'
import { cn } from '@/lib/utils'

interface ToolResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  outputs: ToolOutputFile[]
  downloadZipName?: string
  toolName?: string
}

export function ToolResultModal({
  open,
  onOpenChange,
  outputs,
  downloadZipName,
  toolName,
}: ToolResultModalProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    setActiveIndex((index) => Math.max(0, Math.min(index, outputs.length - 1)))
  }, [outputs.length])

  useEffect(() => {
    if (!open) setActiveIndex(0)
  }, [open])

  const safeIndex = Math.min(activeIndex, Math.max(outputs.length - 1, 0))
  const activeOutput = outputs[safeIndex]

  const previewFile = useMemo(
    () => (activeOutput ? bytesToPdfFile(activeOutput.data, activeOutput.name) : null),
    [activeOutput],
  )

  const handleDownload = async () => {
    if (outputs.length === 0) return

    setDownloading(true)
    try {
      await downloadToolOutputs(outputs, downloadZipName)
      toast.success('Download started')
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const downloadLabel =
    outputs.length > 1 ? `Download all (${outputs.length})` : 'Download'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[92vh] max-h-[92vh] w-[96vw] max-w-[96vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[96vw]"
        showCloseButton
      >
        <DialogHeader className="border-b px-4 py-3 text-left">
          <DialogTitle>{toolName ? `${toolName} complete` : 'Result ready'}</DialogTitle>
          <DialogDescription>
            Preview the output, then download if it looks correct.
          </DialogDescription>
        </DialogHeader>

        {outputs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b px-4 py-2">
            {outputs.map((output, index) => (
              <button
                key={`${output.name}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'shrink-0 rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  safeIndex === index
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50',
                )}
              >
                {output.name}
              </button>
            ))}
          </div>
        )}

        {open && previewFile && (
          <PdfViewerCore
            file={previewFile}
            className="min-h-0 flex-1"
            scrollClassName="max-h-none"
          />
        )}

        <DialogFooter className="border-t px-4 py-3 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
          <Button type="button" onClick={() => void handleDownload()} disabled={downloading}>
            <Download className="mr-2 h-4 w-4" />
            {downloading ? 'Downloading…' : downloadLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
