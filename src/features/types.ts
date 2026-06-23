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

export interface ToolContext {
  files: File[]
  params: Record<string, string>
  apiUrl: string
}

export interface ToolOutputFile {
  name: string
  data: Uint8Array
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
  /** Show first-page PDF preview when files are loaded */
  preview?: boolean
  /** Minimum files required before Run is enabled */
  minFiles?: number
  /** Cache output and show preview before download (merge, split, rotate) */
  resultPreview?: boolean
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
}

export const CATEGORY_ORDER: ToolCategory[] = [
  'Organize',
  'Edit & Sign',
  'Security',
  'Convert To PDF',
  'Convert From PDF',
  'Optimize & OCR',
]
