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
      <div className="pt-16">{children}</div>
      <SiteFooter />
    </div>
  )
}
