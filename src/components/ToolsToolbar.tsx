import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CATEGORY_ORDER } from '@/features/types'
import type { CategoryFilter, ModeFilter, ToolFilters } from '@/features/toolFilters'

const MODE_OPTIONS: Array<{ value: ModeFilter; label: string }> = [
  { value: 'all', label: 'All tools' },
  { value: 'client', label: 'In browser' },
  { value: 'backend', label: 'Requires server' },
]

interface ToolsToolbarProps {
  filters: ToolFilters
  onFiltersChange: (filters: ToolFilters) => void
  resultCount: number
  totalCount: number
}

export function ToolsToolbar({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: ToolsToolbarProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const setQuery = (query: string) => onFiltersChange({ ...filters, query })
  const setMode = (mode: ModeFilter) => onFiltersChange({ ...filters, mode })
  const setCategory = (category: CategoryFilter) => onFiltersChange({ ...filters, category })

  const showSummary = filters.query.trim() || filters.mode !== 'all' || filters.category !== 'all'

  return (
    <div className="sticky top-16 z-40 -mx-4 border-b border-border/60 bg-background/95 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sm:-mx-0 sm:rounded-b-xl sm:border sm:px-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          type="search"
          value={filters.query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools — merge, split, OCR…"
          className="h-10 pr-9 pl-9"
          aria-label="Search tools"
        />
        {filters.query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-2 -translate-y-1/2"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
        {!filters.query && (
          <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            /
          </kbd>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {MODE_OPTIONS.map((option) => (
          <FilterPill
            key={option.value}
            active={filters.mode === option.value}
            onClick={() => setMode(option.value)}
          >
            {option.label}
          </FilterPill>
        ))}
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPill
          active={filters.category === 'all'}
          onClick={() => setCategory('all')}
          className="shrink-0"
        >
          All categories
        </FilterPill>
        {CATEGORY_ORDER.map((category) => (
          <FilterPill
            key={category}
            active={filters.category === category}
            onClick={() => setCategory(category)}
            className="shrink-0"
          >
            {category}
          </FilterPill>
        ))}
      </div>

      {showSummary && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {resultCount} of {totalCount} tools
        </p>
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border/60 bg-card text-muted-foreground hover:border-lavender-grey-600 hover:text-foreground dark:hover:border-lavender-grey-400',
        className,
      )}
    >
      {children}
    </button>
  )
}
