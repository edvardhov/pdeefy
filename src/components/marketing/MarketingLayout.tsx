import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'

interface MarketingLayoutProps {
  children: ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="paper-grain gradient-mesh min-h-svh">
      <SiteHeader />
      <div aria-hidden className="h-16 shrink-0" />
      {children}
      <SiteFooter />
    </div>
  )
}
