import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileDropzone } from '@/components/FileDropzone'
import { BackendGateModal } from '@/components/BackendGateModal'
import { ToolResultBanner } from '@/components/ToolResultBanner'
import { ToolResultModal } from '@/components/ToolResultModal'
import { getToolById } from '@/features/registry'
import {
  canPreviewInputFile,
  canRunTool,
  computeToolRunFingerprint,
  deliverToolResult,
  getDefaultParams,
  getMinFilesHintMessage,
  getMinFilesErrorMessage,
  isParamFieldVisible,
  resolveToolFeatures,
  usesResultCache,
} from '@/features/toolFeatures'
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
  const [processing, setProcessing] = useState(false)
  const [showGate, setShowGate] = useState(false)

  const defaultParams = useMemo(() => (tool ? getDefaultParams(tool) : {}), [tool])
  const mergedParams = { ...defaultParams, ...params }

  const inputFingerprint = useMemo(
    () => computeToolRunFingerprint(files, mergedParams),
    [files, mergedParams],
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
    return <Navigate to="/tools" replace />
  }

  const features = resolveToolFeatures(tool)
  const Icon = tool.icon
  const needsBackend = tool.mode === 'backend' && !isBackendConnected
  const canRun = canRunTool(tool, files.length)
  const minFilesHint = getMinFilesHintMessage(tool)

  const handleRun = async () => {
    if (!canRunTool(tool, files.length)) {
      toast.error(getMinFilesErrorMessage(tool))
      return
    }

    if (tool.mode === 'backend' && !isBackendConnected) {
      setShowGate(true)
      return
    }

    setProcessing(true)
    try {
      const runResult = await tool.runner({ files, params: mergedParams, apiUrl })
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
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/tools">
              <ArrowLeft className="mr-1 h-4 w-4" />
              All tools
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-3">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              <p className="text-muted-foreground">{tool.description}</p>
            </div>
          </div>
        </div>
        <BackendGateModal
          open
          onOpenChange={(open) => {
            if (!open) navigate('/tools')
          }}
          toolName={tool.name}
        />
      </>
    )
  }

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/tools">
            <ArrowLeft className="mr-1 h-4 w-4" />
            All tools
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-3">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tool.name}</h1>
            <p className="text-muted-foreground">{tool.description}</p>
          </div>
        </div>
      </div>

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

          if (field.type === 'select') {
            return (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Select
                  value={mergedParams[field.key] ?? field.defaultValue}
                  onValueChange={(value) =>
                    setParams((prev) => ({ ...prev, [field.key]: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          }

          return (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type === 'password' ? 'password' : 'text'}
                placeholder={field.placeholder}
                value={mergedParams[field.key] ?? ''}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
              />
            </div>
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
