import type { LucideIcon } from 'lucide-react'
import type { ToolCategory } from '@/constants/categories'
import type { WorkerOp } from '@/workers/types'

export type { ToolCategory }
export type ToolMode = 'client' | 'backend'
export type AcceptedKind = 'pdf' | 'image' | 'text' | 'any'
export type ToolOutputDelivery = 'download' | 'preview'

export type EditorCapability =
  | 'reorder'
  | 'rotatePage'
  | 'deletePage'
  | 'editText'
  | 'addText'
  | 'addImage'
  | 'signature'

export interface EditorConfig {
  layout: 'grid' | 'overlay'
  capabilities: EditorCapability[]
}

export interface OutputNamingFixed {
  strategy: 'fixed'
  name: string
}

export interface OutputNamingDerive {
  strategy: 'derive'
  prefix?: string
  suffix?: string
  ext?: string
}

export interface OutputZipNaming {
  prefix?: string
  suffix?: string
}

export interface OutputConfig {
  naming: OutputNamingFixed | OutputNamingDerive
  mimeType?: string
  delivery: ToolOutputDelivery
  zipName?: OutputZipNaming
  successMessage?: string
}

export type ToolExecution =
  | { kind: 'worker'; op: WorkerOp; multiOutput?: boolean }
  | { kind: 'backend'; endpoint: string }
  | { kind: 'editor'; editor: EditorConfig }

/** Per-tool capability flags — configure any combination in the registry */
export interface ToolFeatures {
  minFiles?: number
  minFilesMessage?: string
  inputPreview?: boolean
  autoOpenResult?: boolean
  resultPreviewMimeTypes?: string[]
}

export interface ToolContext {
  files: File[]
  params: Record<string, string>
  apiUrl: string
  /** Files attached to param fields of type `file`, keyed by field key */
  auxFiles?: Record<string, File>
}

export interface ToolOutputFile {
  name: string
  data: Uint8Array
  mimeType?: string
}

export interface ToolRunnerResult {
  success: boolean
  message?: string
  outputs?: ToolOutputFile[]
  downloadZipName?: string
}

export interface ToolDefinition {
  id: string
  name: string
  description: string
  category: ToolCategory
  icon: LucideIcon
  accepts: AcceptedKind
  multiple?: boolean
  execution: ToolExecution
  output: OutputConfig
  features?: ToolFeatures
  paramFields?: ParamField[]
}

export interface ParamField {
  key: string
  label: string
  type: 'text' | 'password' | 'number' | 'select' | 'textarea' | 'color' | 'checkbox' | 'file'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  defaultValue?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  showWhen?: Record<string, string>
  /** HTML accept attribute for `file` fields, e.g. `image/*` */
  accept?: string
}

export function getToolMode(tool: ToolDefinition): ToolMode {
  return tool.execution.kind === 'backend' ? 'backend' : 'client'
}

export function isEditorTool(tool: ToolDefinition): boolean {
  return tool.execution.kind === 'editor'
}

export { CATEGORY_ORDER } from '@/constants/categories'
