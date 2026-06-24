import type { ParamField, ToolDefinition, ToolRunnerResult } from '@/features/types'
import { MIME, matchesAcceptKind } from '@/constants/mime'
import { downloadToolOutputs } from '@/lib/download'
import { toast } from 'sonner'

export interface ResolvedToolFeatures {
  minFiles: number
  minFilesMessage?: string
  inputPreview: boolean
  outputDelivery: 'download' | 'preview'
  autoOpenResult: boolean
  resultPreviewMimeTypes: string[]
}

const DEFAULT_FEATURES: ResolvedToolFeatures = {
  minFiles: 1,
  inputPreview: false,
  outputDelivery: 'download',
  autoOpenResult: true,
  resultPreviewMimeTypes: [MIME.pdf],
}

export function resolveToolFeatures(tool: ToolDefinition): ResolvedToolFeatures {
  return {
    ...DEFAULT_FEATURES,
    ...tool.features,
    outputDelivery: tool.output.delivery,
    resultPreviewMimeTypes:
      tool.features?.resultPreviewMimeTypes ??
      (tool.output.mimeType ? [tool.output.mimeType] : DEFAULT_FEATURES.resultPreviewMimeTypes),
  }
}

export function computeToolRunFingerprint(
  files: File[],
  params: Record<string, string>,
  auxFiles: Record<string, File> = {},
): string {
  const filePart = files
    .map((file) => `${file.name}:${file.size}:${file.lastModified}`)
    .join('|')
  const auxPart = Object.keys(auxFiles)
    .sort()
    .map((key) => {
      const file = auxFiles[key]
      return `${key}:${file.name}:${file.size}:${file.lastModified}`
    })
    .join('|')
  const paramPart = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key] ?? ''}`)
    .join('&')
  return `${filePart}::${auxPart}::${paramPart}`
}

export function getMinFiles(tool: ToolDefinition): number {
  return resolveToolFeatures(tool).minFiles
}

export function areRequiredParamsValid(
  tool: ToolDefinition,
  params: Record<string, string>,
  auxFiles: Record<string, File> = {},
): boolean {
  for (const field of tool.paramFields ?? []) {
    if (!isParamFieldVisible(field, params)) continue
    if (!field.required) continue
    if (field.type === 'file') {
      if (!auxFiles[field.key]) return false
      continue
    }
    if (!params[field.key]?.trim()) return false
  }
  return true
}

export function canRunTool(
  tool: ToolDefinition,
  fileCount: number,
  params: Record<string, string> = {},
  auxFiles: Record<string, File> = {},
): boolean {
  if (fileCount < getMinFiles(tool)) return false
  return areRequiredParamsValid(tool, params, auxFiles)
}

export function getMinFilesErrorMessage(tool: ToolDefinition): string {
  const { minFiles, minFilesMessage } = resolveToolFeatures(tool)
  if (minFilesMessage) return minFilesMessage
  if (minFiles === 1) return 'Please add at least one file'
  return `Add at least ${minFiles} files to continue`
}

export function getRequiredParamsErrorMessage(
  tool: ToolDefinition,
  params: Record<string, string>,
  auxFiles: Record<string, File> = {},
): string {
  for (const field of tool.paramFields ?? []) {
    if (!isParamFieldVisible(field, params)) continue
    if (!field.required) continue
    if (field.type === 'file' && !auxFiles[field.key]) {
      return `${field.label} is required`
    }
    if (field.type !== 'file' && !params[field.key]?.trim()) {
      return `${field.label} is required`
    }
  }
  return 'Please complete all required fields'
}

export function getMinFilesHintMessage(tool: ToolDefinition): string | null {
  const minFiles = getMinFiles(tool)
  if (minFiles <= 1) return null
  return `Add at least ${minFiles} files to continue`
}

export function canPreviewInputFile(tool: ToolDefinition, file: File): boolean {
  if (!resolveToolFeatures(tool).inputPreview) return false
  return matchesAcceptKind(file, tool.accepts)
}

export function canPreviewOutputMime(mimeType: string, tool: ToolDefinition): boolean {
  return resolveToolFeatures(tool).resultPreviewMimeTypes.includes(mimeType)
}

export function isParamFieldVisible(
  field: ParamField,
  params: Record<string, string>,
): boolean {
  if (!field.showWhen) return true
  return Object.entries(field.showWhen).every(
    ([key, value]) => (params[key] ?? '') === value,
  )
}

export function usesResultCache(tool: ToolDefinition): boolean {
  return resolveToolFeatures(tool).outputDelivery === 'preview'
}

export async function deliverToolResult(
  tool: ToolDefinition,
  result: ToolRunnerResult,
): Promise<'cached' | 'downloaded' | 'none'> {
  if (!result.success || !result.outputs?.length) return 'none'

  const features = resolveToolFeatures(tool)

  if (features.outputDelivery === 'preview') {
    return 'cached'
  }

  await downloadToolOutputs(result.outputs, result.downloadZipName)
  toast.success(result.message ?? `${tool.name} complete`)
  return 'downloaded'
}

export function getDefaultParams(tool: ToolDefinition): Record<string, string> {
  const defaults: Record<string, string> = {}
  tool.paramFields?.forEach((field) => {
    if (field.defaultValue) defaults[field.key] = field.defaultValue
  })
  return defaults
}
