import { useState } from 'react'
import { CheckCircle2, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ToolOutputFile } from '@/features/types'
import { downloadToolOutputs } from '@/lib/download'

interface ToolResultBannerProps {
  outputs: ToolOutputFile[]
  downloadZipName?: string
  onView: () => void
}

export function ToolResultBanner({
  outputs,
  downloadZipName,
  onView,
}: ToolResultBannerProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
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

  const fileLabel =
    outputs.length === 1
      ? outputs[0].name
      : `${outputs.length} files ready`

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
      <div className="flex gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">Result ready</p>
          <p className="truncate text-xs text-muted-foreground">{fileLabel}</p>
          <p className="text-xs text-muted-foreground">
            Preview or download below. Change files or settings to process again.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" className="flex-1" onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View result
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => void handleDownload()}
          disabled={downloading}
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? 'Downloading…' : 'Download'}
        </Button>
      </div>
    </div>
  )
}
