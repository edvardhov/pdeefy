import { useEffect, useMemo, useState } from 'react'
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
import { ToolResultModal } from '@/components/ToolResultModal'
import { getToolById } from '@/features/registry'
import type { ToolOutputFile } from '@/features/types'
import { useAppStore } from '@/store/appStore'

interface ToolResultState {
  outputs: ToolOutputFile[]
  downloadZipName?: string
}

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
  const [result, setResult] = useState<ToolResultState | null>(null)

  const defaultParams = useMemo(() => {
    const defaults: Record<string, string> = {}
    tool?.paramFields?.forEach((field) => {
      if (field.defaultValue) defaults[field.key] = field.defaultValue
    })
    return defaults
  }, [tool])

  const mergedParams = { ...defaultParams, ...params }

  useEffect(() => {
    setResult(null)
  }, [files])

  if (!tool) {
    return <Navigate to="/tools" replace />
  }

  const Icon = tool.icon
  const showRanges = mergedParams.mode === 'pages'
  const needsBackend = tool.mode === 'backend' && !isBackendConnected
  const minFiles = tool.minFiles ?? 1
  const canRun = files.length >= minFiles
  const showPdfPreview = tool.preview && tool.accepts === 'pdf'

  const handleRun = async () => {
    if (files.length < minFiles) {
      toast.error(
        minFiles === 2
          ? 'Add at least two PDFs to merge'
          : 'Please add at least one file',
      )
      return
    }

    if (tool.mode === 'backend' && !isBackendConnected) {
      setShowGate(true)
      return
    }

    setProcessing(true)
    try {
      const runResult = await tool.runner({ files, params: mergedParams, apiUrl })
      if (runResult.success && runResult.outputs?.length) {
        setResult({
          outputs: runResult.outputs,
          downloadZipName: runResult.downloadZipName,
        })
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
          showPdfPreview={showPdfPreview}
        />

        {tool.paramFields?.map((field) => {
          if (field.key === 'ranges' && !showRanges) return null

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

        <Button
          className="w-full"
          size="lg"
          onClick={handleRun}
          disabled={processing || !canRun}
        >
          {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {processing ? 'Processing…' : `Run ${tool.name}`}
        </Button>

        {!canRun && files.length > 0 && minFiles > 1 && (
          <p className="text-center text-sm text-muted-foreground">
            Add at least {minFiles} PDFs to continue
          </p>
        )}
      </div>

      <BackendGateModal open={showGate} onOpenChange={setShowGate} toolName={tool.name} />

      <ToolResultModal
        open={result !== null}
        onOpenChange={(open) => {
          if (!open) setResult(null)
        }}
        outputs={result?.outputs ?? []}
        downloadZipName={result?.downloadZipName}
        toolName={tool.name}
      />
    </>
  )
}
