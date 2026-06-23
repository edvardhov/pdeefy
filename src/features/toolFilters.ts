import { TOOLS } from '@/features/registry'
import type { ToolCategory, ToolDefinition, ToolMode } from '@/features/types'
import { CATEGORY_ORDER } from '@/features/types'

export const POPULAR_TOOL_IDS = [
  'merge',
  'split',
  'rotate',
  'jpg-to-pdf',
  'password-protect',
  'pdf-to-word',
  'ocr',
] as const

export const IMPLEMENTED_TOOL_IDS = new Set([
  'merge',
  'split',
  'rotate',
  'password-protect',
  'jpg-to-pdf',
  'pdf-to-word',
  'ocr',
  'compress',
])

export type ModeFilter = 'all' | ToolMode
export type CategoryFilter = 'all' | ToolCategory

export interface ToolFilters {
  query: string
  mode: ModeFilter
  category: CategoryFilter
}

export function isToolImplemented(tool: ToolDefinition): boolean {
  return IMPLEMENTED_TOOL_IDS.has(tool.id)
}

export function categorySlug(category: ToolCategory): string {
  return category
    .toLowerCase()
    .replace(/\s+&\s+/g, '-')
    .replace(/\s+/g, '-')
}

export function filterTools(
  tools: ToolDefinition[],
  { query, mode, category }: ToolFilters,
): ToolDefinition[] {
  const normalizedQuery = query.trim().toLowerCase()

  return tools.filter((tool) => {
    if (mode !== 'all' && tool.mode !== mode) return false
    if (category !== 'all' && tool.category !== category) return false
    if (!normalizedQuery) return true

    const haystack = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase()
    return haystack.includes(normalizedQuery)
  })
}

export function groupTools(tools: ToolDefinition[]): Map<ToolCategory, ToolDefinition[]> {
  const grouped = new Map<ToolCategory, ToolDefinition[]>()
  for (const category of CATEGORY_ORDER) {
    const inCategory = tools.filter((tool) => tool.category === category)
    if (inCategory.length > 0) grouped.set(category, inCategory)
  }
  return grouped
}

export function getPopularTools(): ToolDefinition[] {
  return POPULAR_TOOL_IDS.map((id) => TOOLS.find((tool) => tool.id === id)).filter(
    (tool): tool is ToolDefinition => tool !== undefined,
  )
}

export function hasActiveFilters({ query, mode, category }: ToolFilters): boolean {
  return query.trim().length > 0 || mode !== 'all' || category !== 'all'
}
