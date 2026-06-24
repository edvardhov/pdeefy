import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { FileDropzone } from '@/components/FileDropzone'
import { GridEditor } from '@/components/editors/GridEditor'
import { OverlayEditor } from '@/components/editors/OverlayEditor'
import { ToolResultBanner } from '@/components/ToolResultBanner'
import { ToolResultModal } from '@/components/ToolResultModal'
import { MIME } from '@/constants/mime'
import { applyAnnotationsPdf } from '@/features/client/applyAnnotations'
import { applyOrganizePdf } from '@/features/client/applyOrganize'
import type { Annotation, OrganizePageState } from '@/features/client/editorTypes'
import type { ToolDefinition, ToolRunnerResult } from '@/features/types'
import {
  canPreviewInputFile,
  computeToolRunFingerprint,
  deliverToolResult,
  resolveToolFeatures,
} from '@/features/toolFeatures'
import { useToolResultCache } from '@/hooks/useToolResultCache'
import { buildOutputName } from '@/lib/download'

interface PdfEditorWorkspaceProps {
  tool: ToolDefinition
}

export function PdfEditorWorkspace({ tool }: PdfEditorWorkspaceProps) {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)

  const editorConfig = tool.execution.kind === 'editor' ? tool.execution.editor : null
  const features = resolveToolFeatures(tool)
  const inputFingerprint = useMemo(
    () => computeToolRunFingerprint(files, {}),
    [files],
  )

  const {
    cachedResult,
    hasValidCache,
    cacheResult,
    resultModalOpen,
    setResultModalOpen,
  } = useToolResultCache(inputFingerprint, features.outputDelivery === 'preview')

  if (!editorConfig) {
    return null
  }

  const deliverResult = async (data: Uint8Array) => {
    const name = buildOutputName(files[0]?.name, tool.output.naming)
    const result: ToolRunnerResult = {
      success: true,
      message: tool.output.successMessage ?? `${tool.name} complete`,
      outputs: [{ name, data, mimeType: tool.output.mimeType ?? MIME.pdf }],
    }

    const delivery = await deliverToolResult(tool, result)
    if (delivery === 'cached') {
      cacheResult(result, inputFingerprint)
      if (features.autoOpenResult) setResultModalOpen(true)
    }
  }

  const handleOrganizeApply = async (pages: OrganizePageState[]) => {
    if (!files[0]) return
    setProcessing(true)
    try {
      const bytes = new Uint8Array(await files[0].arrayBuffer())
      const output = await applyOrganizePdf(bytes, pages)
      await deliverResult(output)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Apply failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleAnnotateApply = async (annotations: Annotation[]) => {
    if (!files[0]) return
    setProcessing(true)
    try {
      const bytes = new Uint8Array(await files[0].arrayBuffer())
      const output = await applyAnnotationsPdf(bytes, annotations)
      await deliverResult(output)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Apply failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <FileDropzone
        accept={tool.accepts}
        multiple={false}
        files={files}
        onChange={setFiles}
        canPreviewFile={(file) => canPreviewInputFile(tool, file)}
      />

      {files[0] && !hasValidCache && editorConfig.layout === 'grid' && (
        <GridEditor
          file={files[0]}
          capabilities={editorConfig.capabilities}
          onApply={(pages) => void handleOrganizeApply(pages)}
          processing={processing}
        />
      )}

      {files[0] && !hasValidCache && editorConfig.layout === 'overlay' && (
        <OverlayEditor
          file={files[0]}
          capabilities={editorConfig.capabilities}
          onApply={(annotations) => void handleAnnotateApply(annotations)}
          processing={processing}
        />
      )}

      {hasValidCache && cachedResult?.outputs && (
        <ToolResultBanner
          outputs={cachedResult.outputs}
          downloadZipName={cachedResult.downloadZipName}
          onView={() => setResultModalOpen(true)}
        />
      )}

      {processing && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing…
        </div>
      )}

      {cachedResult?.outputs && (
        <ToolResultModal
          open={resultModalOpen}
          onOpenChange={setResultModalOpen}
          outputs={cachedResult.outputs}
          downloadZipName={cachedResult.downloadZipName}
          toolName={tool.name}
          previewMimeTypes={features.resultPreviewMimeTypes}
        />
      )}
    </div>
  )
}
