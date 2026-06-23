import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getPopularTools } from '@/features/toolFilters'
import type { ToolDefinition } from '@/features/types'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

interface PopularToolsRowProps {
  onBackendGate: (tool: ToolDefinition) => void
}

export function PopularToolsRow({ onBackendGate }: PopularToolsRowProps) {
  const navigate = useNavigate()
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)
  const popular = getPopularTools()

  const openTool = (tool: ToolDefinition) => {
    if (tool.mode === 'backend' && !isBackendConnected) {
      onBackendGate(tool)
      return
    }
    navigate(`/tool/${tool.id}`)
  }

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
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-punch-red-900/50 dark:group-hover:bg-punch-red-300/15">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </span>
              <span className="min-w-0 truncate font-medium sm:whitespace-nowrap">{tool.name}</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:ml-0" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
