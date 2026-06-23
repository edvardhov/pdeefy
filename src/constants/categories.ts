export const TOOL_CATEGORIES = [
  'Organize',
  'Edit & Sign',
  'Security',
  'Convert To PDF',
  'Convert From PDF',
  'Optimize & OCR',
] as const

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export const CATEGORY_ORDER: ToolCategory[] = [...TOOL_CATEGORIES]
