import { ArrowRight } from 'lucide-react'
import { getPopularTools } from '@/features/toolFilters'
import type { ToolDefinition } from '@/features/types'
import { ToolIconBox } from '@/components/ModeBadge'
import { useOpenTool } from '@/hooks/useOpenTool'
import { cn } from '@/lib/utils'

interface PopularToolsRowProps {
  onBackendGate: (tool: ToolDefinition) => void
}

export function PopularToolsRow({ onBackendGate }: PopularToolsRowProps) {
  const openTool = useOpenTool(onBackendGate)
  const popular = getPopularTools()

  return (
    <section aria-label="Popular tools">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-normal">Popular</h2>
        <p className="hidden text-xs text-muted-foreground sm:block">Most-used tools, one click away</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {popular.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => openTool(tool)}
              className={cn(
                'group flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-left text-sm transition-colors',
                'hover:border-lavender-grey-600 hover:bg-punch-red-900/30 dark:hover:border-lavender-grey-400 dark:hover:bg-punch-red-300/10',
                'min-w-0 sm:shrink-0',
              )}
            >
              <ToolIconBox icon={Icon} size="sm" />
              <span className="min-w-0 truncate font-medium sm:whitespace-nowrap">{tool.name}</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:ml-0" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
