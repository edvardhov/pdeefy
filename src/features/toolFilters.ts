import { TOOLS } from '@/features/registry'
import { getToolMode, type ToolCategory, type ToolDefinition, type ToolMode } from '@/features/types'
import { CATEGORY_ORDER } from '@/constants/categories'
import {
  FEATURED_TOOL_IDS,
  POPULAR_TOOL_IDS,
  SEARCH_KEYWORDS,
} from '@/constants/tools'

export { POPULAR_TOOL_IDS, FEATURED_TOOL_IDS }

export type ModeFilter = 'all' | ToolMode
export type CategoryFilter = 'all' | ToolCategory

export interface ToolFilters {
  query: string
  mode: ModeFilter
  category: CategoryFilter
}

export function isToolImplemented(tool: ToolDefinition): boolean {
  return tool.execution.kind !== 'editor' || tool.execution.editor.capabilities.length > 0
}

export function categorySlug(category: ToolCategory): string {
  return category
    .toLowerCase()
    .replace(/\s+&\s+/g, '-')
    .replace(/\s+/g, '-')
}

/** Relative importance of each searchable field. */
const FIELD_WEIGHTS = {
  name: 10,
  keywords: 6,
  category: 4,
  description: 2,
} as const

interface ToolSearchIndex {
  name: string
  description: string
  category: string
  keywords: string[]
}

const SEARCH_INDEX: WeakMap<ToolDefinition, ToolSearchIndex> = new WeakMap()

function getSearchIndex(tool: ToolDefinition): ToolSearchIndex {
  let index = SEARCH_INDEX.get(tool)
  if (!index) {
    index = {
      name: tool.name.toLowerCase(),
      description: tool.description.toLowerCase(),
      category: tool.category.toLowerCase(),
      keywords: (SEARCH_KEYWORDS[tool.id] ?? []).map((keyword) => keyword.toLowerCase()),
    }
    SEARCH_INDEX.set(tool, index)
  }
  return index
}

/** Split a raw query into normalized, deduplicated search tokens. */
function tokenize(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter(Boolean),
    ),
  )
}

/**
 * Score a single token against one field. Substring matches earn the field
 * weight; word-start matches, prefix matches, and exact matches earn
 * progressively larger boosts so the most relevant tools rank first.
 */
function scoreField(field: string, token: string, weight: number): number {
  const idx = field.indexOf(token)
  if (idx === -1) return 0
  if (field === token) return weight * 4
  if (idx === 0) return weight * 2
  if (!/[a-z0-9]/i.test(field[idx - 1] ?? '')) return weight * 1.5
  return weight
}

/**
 * Score a tool against all query tokens using AND semantics: every token must
 * match at least one field, otherwise the tool is excluded (score 0).
 */
function scoreTool(tool: ToolDefinition, tokens: string[]): number {
  const index = getSearchIndex(tool)
  let total = 0

  for (const token of tokens) {
    let best = Math.max(
      scoreField(index.name, token, FIELD_WEIGHTS.name),
      scoreField(index.category, token, FIELD_WEIGHTS.category),
      scoreField(index.description, token, FIELD_WEIGHTS.description),
    )
    for (const keyword of index.keywords) {
      best = Math.max(best, scoreField(keyword, token, FIELD_WEIGHTS.keywords))
    }
    if (best === 0) return 0
    total += best
  }

  return total
}

export function filterTools(
  tools: ToolDefinition[],
  { query, mode, category }: ToolFilters,
): ToolDefinition[] {
  const tokens = tokenize(query)

  const candidates = tools.filter((tool) => {
    if (mode !== 'all' && getToolMode(tool) !== mode) return false
    if (category !== 'all' && tool.category !== category) return false
    return true
  })

  if (tokens.length === 0) return candidates

  return candidates
    .map((tool, position) => ({ tool, position, score: scoreTool(tool, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .map((entry) => entry.tool)
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
