import { useNavigate } from 'react-router-dom'
import { Server } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ToolDefinition } from '@/features/types'
import { useAppStore } from '@/store/appStore'

interface ToolCardProps {
  tool: ToolDefinition
  onBackendGate: (tool: ToolDefinition) => void
}

export function ToolCard({ tool, onBackendGate }: ToolCardProps) {
  const navigate = useNavigate()
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)
  const Icon = tool.icon

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
        'cursor-pointer transition-all hover:border-primary/40 hover:shadow-md',
        tool.mode === 'backend' && !isBackendConnected && 'opacity-90',
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-5 w-5" />
          </div>
          {tool.mode === 'backend' && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Server className="h-3 w-3" />
              Server
            </Badge>
          )}
        </div>
        <div>
          <CardTitle className="text-base">{tool.name}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2">{tool.description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}
