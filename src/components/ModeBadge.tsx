import type { LucideIcon } from 'lucide-react'
import { Cloud, Server } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ToolMode } from '@/features/types'

interface ModeBadgeProps {
  mode: ToolMode
}

export function ModeBadge({ mode }: ModeBadgeProps) {
  if (mode === 'backend') {
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Server className="h-3 w-3" />
        Server
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="gap-1 text-xs">
      <Cloud className="h-3 w-3" />
      Browser
    </Badge>
  )
}

interface ToolIconBoxProps {
  icon: LucideIcon
  size?: 'md' | 'sm' | 'lg'
  className?: string
}

const ICON_SIZES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-5 w-5 sm:h-6 sm:w-6',
} as const

export function ToolIconBox({ icon: Icon, size = 'md', className }: ToolIconBoxProps) {
  if (size === 'sm') {
    return (
      <span className={className ?? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-punch-red-900/50 dark:group-hover:bg-punch-red-300/15'}>
        <Icon className={`${ICON_SIZES.sm} text-primary`} />
      </span>
    )
  }

  return (
    <div className={className ?? 'rounded-lg bg-secondary p-2.5 transition-colors group-hover:bg-punch-red-900/50 dark:group-hover:bg-punch-red-300/15'}>
      <Icon className={`${ICON_SIZES[size]} text-primary`} />
    </div>
  )
}
