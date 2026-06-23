import { Link } from 'react-router-dom'
import { Cloud, Home, Server } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BrandMark } from '@/components/BrandMark'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SettingsDialog } from '@/components/SettingsDialog'
import { useAppStore } from '@/store/appStore'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/tools" className="flex items-center">
              <BrandMark
                iconClassName="h-7 w-7"
                logoClassName="h-8 w-auto"
              />
            </Link>
            <Link
              to="/"
              className="hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Badge
              variant={isBackendConnected ? 'default' : 'secondary'}
              className="gap-1 font-normal"
            >
              {isBackendConnected ? (
                <>
                  <Server className="h-3 w-3" />
                  Local Power Mode
                </>
              ) : (
                <>
                  <Cloud className="h-3 w-3" />
                  Live Demo Mode
                </>
              )}
            </Badge>
            <SettingsDialog />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
