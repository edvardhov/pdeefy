import type { LucideIcon } from 'lucide-react'

export type ToolMode = 'client' | 'backend'

export type ToolCategory =
  | 'Organize'
  | 'Edit & Sign'
  | 'Security'
  | 'Convert To PDF'
  | 'Convert From PDF'
  | 'Optimize & OCR'

export type AcceptedKind = 'pdf' | 'image' | 'any'

export type ToolOutputDelivery = 'download' | 'preview'

/** Per-tool capability flags — configure any combination in the registry */
export interface ToolFeatures {
  /** Minimum uploaded files required to run (default: 1) */
  minFiles?: number
  /** Custom message when below minFiles */
  minFilesMessage?: string
  /** Eye-icon preview on uploaded files before run */
  inputPreview?: boolean
  /** Deliver outputs via immediate download or cached preview modal (default: download) */
  outputDelivery?: ToolOutputDelivery
  /** Auto-open result modal after run when outputDelivery is preview (default: true) */
  autoOpenResult?: boolean
  /** MIME types supported in the result preview viewer */
  resultPreviewMimeTypes?: string[]
}

export interface ToolContext {
  files: File[]
  params: Record<string, string>
  apiUrl: string
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
  mode: ToolMode
  icon: LucideIcon
  accepts: AcceptedKind
  multiple?: boolean
  features?: ToolFeatures
  runner: (ctx: ToolContext) => Promise<ToolRunnerResult>
  paramFields?: ParamField[]
}

export interface ParamField {
  key: string
  label: string
  type: 'text' | 'password' | 'select' | 'textarea'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  defaultValue?: string
  /** Show field only when all param values match, e.g. { mode: 'pages' } */
  showWhen?: Record<string, string>
}

export const CATEGORY_ORDER: ToolCategory[] = [
  'Organize',
  'Edit & Sign',
  'Security',
  'Convert To PDF',
  'Convert From PDF',
  'Optimize & OCR',
]
