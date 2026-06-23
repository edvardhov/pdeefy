import { useNavigate } from 'react-router-dom'
import { Cloud, Server } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { isToolImplemented } from '@/features/toolFilters'
import type { ToolDefinition } from '@/features/types'
import { useAppStore } from '@/store/appStore'

interface ToolCardProps {
  tool: ToolDefinition
  onBackendGate: (tool: ToolDefinition) => void
  showCategory?: boolean
}

export function ToolCard({ tool, onBackendGate, showCategory = false }: ToolCardProps) {
  const navigate = useNavigate()
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)
  const Icon = tool.icon
  const ready = isToolImplemented(tool)

  const handleClick = () => {
    if (tool.mode === 'backend' && !isBackendConnected) {
      onBackendGate(tool)
      return
    }
    navigate(`/tool/${tool.id}`)
  }

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
        tool.mode === 'backend' && !isBackendConnected && 'opacity-90',
      )}
    >
      <CardHeader className="space-y-3 px-5 py-5">
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-lg bg-secondary p-2.5 transition-colors group-hover:bg-punch-red-900/50 dark:group-hover:bg-punch-red-300/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {tool.mode === 'backend' ? (
              <Badge variant="outline" className="gap-1 text-xs">
                <Server className="h-3 w-3" />
                Server
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Cloud className="h-3 w-3" />
                Browser
              </Badge>
            )}
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
