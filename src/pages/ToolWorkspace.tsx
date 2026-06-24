import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FileDropzone } from '@/components/FileDropzone'
import { BackendGateModal } from '@/components/BackendGateModal'
import { ParamFieldInput } from '@/components/ParamFieldInput'
import { PdfEditorWorkspace } from '@/components/editors/PdfEditorWorkspace'
import { ToolPageHeader } from '@/components/ToolPageHeader'
import { ToolResultBanner } from '@/components/ToolResultBanner'
import { ToolResultModal } from '@/components/ToolResultModal'
import { ROUTES } from '@/constants/routes'
import { getToolById } from '@/features/registry'
import { resolveRunner } from '@/features/runnerEngine'
import {
  canPreviewInputFile,
  canRunTool,
  computeToolRunFingerprint,
  deliverToolResult,
  getDefaultParams,
  getMinFilesHintMessage,
  getMinFilesErrorMessage,
  getRequiredParamsErrorMessage,
  isParamFieldVisible,
  resolveToolFeatures,
  usesResultCache,
} from '@/features/toolFeatures'
import { getToolMode, isEditorTool } from '@/features/types'
import { useToolResultCache } from '@/hooks/useToolResultCache'
import { useAppStore } from '@/store/appStore'

export function ToolWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tool = id ? getToolById(id) : undefined
  const apiUrl = useAppStore((s) => s.apiUrl)
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)

  const [files, setFiles] = useState<File[]>([])
  const [params, setParams] = useState<Record<string, string>>({})
  const [auxFiles, setAuxFiles] = useState<Record<string, File>>({})
  const [processing, setProcessing] = useState(false)
  const [showGate, setShowGate] = useState(false)

  const defaultParams = useMemo(() => (tool ? getDefaultParams(tool) : {}), [tool])
  const mergedParams = useMemo(
    () => ({ ...defaultParams, ...params }),
    [defaultParams, params],
  )

  const inputFingerprint = useMemo(
    () => computeToolRunFingerprint(files, mergedParams, auxFiles),
    [files, mergedParams, auxFiles],
  )

  const resultCacheEnabled = tool ? usesResultCache(tool) : false
  const {
    cachedResult,
    hasValidCache,
    cacheResult,
    resultModalOpen,
    setResultModalOpen,
  } = useToolResultCache(inputFingerprint, resultCacheEnabled)

  if (!tool) {
    return <Navigate to={ROUTES.tools} replace />
  }

  const features = resolveToolFeatures(tool)
  const mode = getToolMode(tool)
  const needsBackend = mode === 'backend' && !isBackendConnected
  const canRun = canRunTool(tool, files.length, mergedParams, auxFiles)
  const minFilesHint = getMinFilesHintMessage(tool)

  const handleRun = async () => {
    if (!canRunTool(tool, files.length, mergedParams, auxFiles)) {
      if (files.length < features.minFiles) {
        toast.error(getMinFilesErrorMessage(tool))
      } else {
        toast.error(getRequiredParamsErrorMessage(tool, mergedParams, auxFiles))
      }
      return
    }

    if (mode === 'backend' && !isBackendConnected) {
      setShowGate(true)
      return
    }

    setProcessing(true)
    try {
      const runner = resolveRunner(tool)
      const runResult = await runner({ files, params: mergedParams, apiUrl, auxFiles })
      const delivery = await deliverToolResult(tool, runResult)

      if (delivery === 'cached') {
        cacheResult(runResult, inputFingerprint)
        if (features.autoOpenResult) setResultModalOpen(true)
      }
    } finally {
      setProcessing(false)
    }
  }

  if (needsBackend) {
    return (
      <>
        <ToolPageHeader icon={tool.icon} name={tool.name} description={tool.description} />
        <BackendGateModal
          open
          onOpenChange={(open) => {
            if (!open) navigate(ROUTES.tools)
          }}
          toolName={tool.name}
        />
      </>
    )
  }

  if (isEditorTool(tool)) {
    return (
      <>
        <ToolPageHeader icon={tool.icon} name={tool.name} description={tool.description} />
        <PdfEditorWorkspace tool={tool} />
      </>
    )
  }

  return (
    <>
      <ToolPageHeader icon={tool.icon} name={tool.name} description={tool.description} />

      <div className="mx-auto max-w-xl space-y-6">
        <FileDropzone
          accept={tool.accepts}
          multiple={tool.multiple}
          files={files}
          onChange={setFiles}
          canPreviewFile={(file) => canPreviewInputFile(tool, file)}
        />

        {tool.paramFields?.map((field) => {
          if (!isParamFieldVisible(field, mergedParams)) return null

          return (
            <ParamFieldInput
              key={field.key}
              field={field}
              value={mergedParams[field.key] ?? ''}
              onChange={(value) =>
                setParams((prev) => ({ ...prev, [field.key]: value }))
              }
              onFileChange={
                field.type === 'file'
                  ? (file) =>
                      setAuxFiles((prev) => {
                        const next = { ...prev }
                        if (file) next[field.key] = file
                        else delete next[field.key]
                        return next
                      })
                  : undefined
              }
            />
          )
        })}

        {hasValidCache && cachedResult?.outputs ? (
          <ToolResultBanner
            outputs={cachedResult.outputs}
            downloadZipName={cachedResult.downloadZipName}
            onView={() => setResultModalOpen(true)}
          />
        ) : (
          <Button
            className="w-full"
            size="lg"
            onClick={handleRun}
            disabled={processing || !canRun}
          >
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {processing ? 'Processing…' : `Run ${tool.name}`}
          </Button>
        )}

        {!canRun && files.length > 0 && minFilesHint && (
          <p className="text-center text-sm text-muted-foreground">{minFilesHint}</p>
        )}
      </div>

      <BackendGateModal open={showGate} onOpenChange={setShowGate} toolName={tool.name} />

      {resultCacheEnabled && cachedResult?.outputs && (
        <ToolResultModal
          open={resultModalOpen}
          onOpenChange={setResultModalOpen}
          outputs={cachedResult.outputs}
          downloadZipName={cachedResult.downloadZipName}
          toolName={tool.name}
          previewMimeTypes={features.resultPreviewMimeTypes}
        />
      )}
    </>
  )
}
