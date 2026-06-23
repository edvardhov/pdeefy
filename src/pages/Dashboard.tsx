import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { TOOLS } from '@/features/registry'
import { CATEGORY_ORDER } from '@/features/types'
import type { ToolCategory } from '@/features/types'
import type { ToolDefinition } from '@/features/types'
import {
  categorySlug,
  filterTools,
  groupTools,
  hasActiveFilters,
  type ToolFilters,
} from '@/features/toolFilters'
import { ToolCard } from '@/components/ToolCard'
import { ToolsToolbar } from '@/components/ToolsToolbar'
import { PopularToolsRow } from '@/components/PopularToolsRow'
import { CategoryQuickNav } from '@/components/CategoryQuickNav'
import { BackendGateModal } from '@/components/BackendGateModal'
import { Button } from '@/components/ui/button'

const DEFAULT_FILTERS: ToolFilters = {
  query: '',
  mode: 'all',
  category: 'all',
}

export function Dashboard() {
  const [filters, setFilters] = useState<ToolFilters>(DEFAULT_FILTERS)
  const [gateTool, setGateTool] = useState<ToolDefinition | null>(null)

  const filteredTools = useMemo(() => filterTools(TOOLS, filters), [filters])
  const grouped = useMemo(() => groupTools(filteredTools), [filteredTools])
  const isFiltered = hasActiveFilters(filters)
  const showGrouped = filters.category === 'all' && !filters.query.trim()
  const showPopular = !isFiltered

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <>
      <div className="mb-6 space-y-2">
        <h1 className="font-display text-3xl font-light tracking-tight">PDF Tools</h1>
        <p className="max-w-2xl text-muted-foreground">
          {TOOLS.length} free utilities — search by name, filter by category, or jump to a popular tool
          below. Browser tools work offline; server tools need the local backend.
        </p>
      </div>

      <ToolsToolbar
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredTools.length}
        totalCount={TOOLS.length}
      />

      <div className="mt-8 space-y-10">
        {showPopular && (
          <>
            <PopularToolsRow onBackendGate={setGateTool} />
            {showGrouped && <CategoryQuickNav />}
          </>
        )}

        {filteredTools.length === 0 ? (
          <EmptyResults onReset={resetFilters} query={filters.query} />
        ) : showGrouped ? (
          CATEGORY_ORDER.map((category) => (
            <CategorySection
              key={category}
              category={category}
              tools={grouped.get(category)}
              onBackendGate={setGateTool}
            />
          ))
        ) : (
          <section>
            <h2 className="mb-4 font-display text-lg font-normal">
              {filters.query.trim() ? 'Search results' : filters.category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onBackendGate={setGateTool}
                  showCategory={filters.category === 'all'}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <BackendGateModal
        open={gateTool !== null}
        onOpenChange={(open) => !open && setGateTool(null)}
        toolName={gateTool?.name}
      />
    </>
  )
}

function CategorySection({
  category,
  tools,
  onBackendGate,
}: {
  category: ToolCategory
  tools: ToolDefinition[] | undefined
  onBackendGate: (tool: ToolDefinition) => void
}) {
  if (!tools?.length) return null

  return (
    <section id={categorySlug(category)} className="scroll-mt-24">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="font-display text-lg font-normal">{category}</h2>
        <span className="font-mono text-xs text-muted-foreground">{tools.length}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onBackendGate={onBackendGate} />
        ))}
      </div>
    </section>
  )
}

function EmptyResults({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/40 px-6 py-16 text-center">
      <SearchX className="mb-4 h-10 w-10 text-muted-foreground/50" />
      <h2 className="font-display text-xl font-normal">No tools match your search</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {query.trim()
          ? `Nothing found for “${query}”. Try a shorter term like “merge”, “split”, or “OCR”.`
          : 'No tools match the current filters. Try broadening your selection.'}
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  )
}
