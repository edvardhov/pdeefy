import { TOOLS } from '@/features/registry'
import type { ToolCategory, ToolDefinition, ToolMode } from '@/features/types'
import { CATEGORY_ORDER } from '@/constants/categories'
import {
  FEATURED_TOOL_IDS,
  IMPLEMENTED_TOOL_IDS,
  POPULAR_TOOL_IDS,
} from '@/constants/tools'

export { POPULAR_TOOL_IDS, FEATURED_TOOL_IDS, IMPLEMENTED_TOOL_IDS }

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

function resolveToolsByIds(ids: readonly string[]): ToolDefinition[] {
  return ids
    .map((id) => TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is ToolDefinition => tool !== undefined)
}

export function getPopularTools(): ToolDefinition[] {
  return resolveToolsByIds(POPULAR_TOOL_IDS)
}

export function getFeaturedTools(): ToolDefinition[] {
  return resolveToolsByIds(FEATURED_TOOL_IDS)
}

export function hasActiveFilters({ query, mode, category }: ToolFilters): boolean {
  return query.trim().length > 0 || mode !== 'all' || category !== 'all'
}
