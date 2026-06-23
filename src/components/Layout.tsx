import { SiteHeader } from '@/components/SiteHeader'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader variant="app" />
      <div aria-hidden className="h-16 shrink-0" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
