import { cn } from '@/lib/utils'
import {
  MARKETING_CONTAINER_CLASS,
  MARKETING_EYEBROW_CLASS,
  MARKETING_TITLE_CLASS,
} from '@/constants/ui'

interface MarketingContainerProps {
  children: React.ReactNode
  className?: string
}

export function MarketingContainer({ children, className }: MarketingContainerProps) {
  return <div className={cn(MARKETING_CONTAINER_CLASS, className)}>{children}</div>
}

interface MarketingSectionHeaderProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function MarketingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: MarketingSectionHeaderProps) {
  return (
    <div
      className={cn(
        align === 'center' && 'text-center',
        className,
      )}
    >
      <p className={MARKETING_EYEBROW_CLASS}>{eyebrow}</p>
      <h2 className={cn('mt-3', MARKETING_TITLE_CLASS, align === 'center' && 'tracking-tight')}>
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
