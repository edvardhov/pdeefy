import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModeBadge, ToolIconBox } from '@/components/ModeBadge'
import { cn } from '@/lib/utils'
import { isToolImplemented } from '@/features/toolFilters'
import { getToolMode, type ToolDefinition } from '@/features/types'
import { useAppStore } from '@/store/appStore'
import { useOpenTool } from '@/hooks/useOpenTool'

interface ToolCardProps {
  tool: ToolDefinition
  onBackendGate: (tool: ToolDefinition) => void
  showCategory?: boolean
}

export function ToolCard({ tool, onBackendGate, showCategory = false }: ToolCardProps) {
  const openTool = useOpenTool(onBackendGate)
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)
  const ready = isToolImplemented(tool)
  const mode = getToolMode(tool)

  const handleClick = () => openTool(tool)

  return (
    <Card
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
      onClick={handleClick}
      className={cn(
        'group cursor-pointer gap-0 py-0 transition-all hover:border-lavender-grey-600 hover:shadow-md dark:hover:border-lavender-grey-400',
        !ready && 'opacity-75',
        mode === 'backend' && !isBackendConnected && 'opacity-90',
      )}
    >
      <CardHeader className="space-y-3 px-5 py-5">
        <div className="flex items-start justify-between gap-2">
          <ToolIconBox icon={tool.icon} />
          <div className="flex flex-wrap justify-end gap-1.5">
            <ModeBadge mode={mode} />
            {!ready && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Coming soon
              </Badge>
            )}
          </div>
        </div>
        <div>
          {showCategory && (
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {tool.category}
            </p>
          )}
          <CardTitle className="text-base font-medium">{tool.name}</CardTitle>
          <CardDescription className="mt-1.5 line-clamp-2 leading-relaxed">
            {tool.description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}
