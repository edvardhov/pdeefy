import { SiteHeader } from '@/components/SiteHeader'
import { MARKETING_CONTAINER_CLASS } from '@/constants/ui'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader variant="app" />
      <div aria-hidden className="h-16 shrink-0" />
      <main className={cn(MARKETING_CONTAINER_CLASS, 'py-8')}>{children}</main>
    </div>
  )
}
