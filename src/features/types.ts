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

export interface ToolRunnerResult {
  success: boolean
  message?: string
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
