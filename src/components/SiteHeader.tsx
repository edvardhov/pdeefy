import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/BrandMark'
import { ConnectionStatus } from '@/components/ConnectionStatus'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SettingsDialog } from '@/components/SettingsDialog'

const MARKETING_NAV = [
  { href: '#features', label: 'Features' },
  { href: '#dual-mode', label: 'Dual-Mode' },
  {
    href: 'https://github.com/edvardhov/pdeefy',
    label: 'GitHub',
    external: true,
  },
] as const

export type SiteHeaderVariant = 'marketing' | 'app'

interface SiteHeaderProps {
  variant: SiteHeaderVariant
}

export function SiteHeader({ variant }: SiteHeaderProps) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMarketing = variant === 'marketing'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-xl transition-shadow duration-500 supports-[backdrop-filter]:bg-background/80',
          scrolled || mobileOpen ? 'shadow-sm' : 'shadow-none',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="relative z-50 flex shrink-0 items-center"
            aria-label="Pdeefy home"
          >
            <motion.div whileHover={{ scale: 1.02 }}>
              <BrandMark iconClassName="h-8 w-8" logoClassName="h-9 w-auto" />
            </motion.div>
          </Link>

          {isMarketing && (
            <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
              {MARKETING_NAV.map((link) =>
                'external' in link && link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link text-sm text-muted-foreground"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a key={link.href} href={link.href} className="nav-link text-sm text-muted-foreground">
                    {link.label}
                  </a>
                ),
              )}
            </nav>
          )}

          <div className={cn('flex items-center gap-1 sm:gap-2', !isMarketing && 'ml-auto')}>
            {!isMarketing && (
              <div className="hidden sm:block">
                <ConnectionStatus />
              </div>
            )}
            <ThemeToggle />
            {isMarketing ? (
              <Button
                asChild
                size="sm"
                className="hidden shadow-sm shadow-space-indigo-500/10 sm:inline-flex"
              >
                <Link to="/tools">Open the app</Link>
              </Button>
            ) : (
              <div className="hidden sm:block">
                <SettingsDialog />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn('relative z-50', isMarketing ? 'md:hidden' : 'sm:hidden')}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'fixed inset-0 z-40 bg-background/95 backdrop-blur-xl',
              isMarketing ? 'md:hidden' : 'sm:hidden',
            )}
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="flex h-full flex-col items-center justify-center gap-8 px-6"
              aria-label="Mobile"
            >
              {isMarketing ? (
                <>
                  {MARKETING_NAV.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                    >
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-3xl font-light"
                          onClick={() => setMobileOpen(false)}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          className="font-display text-3xl font-light"
                          onClick={() => setMobileOpen(false)}
                        >
                          {link.label}
                        </a>
                      )}
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-4 w-full max-w-xs"
                  >
                    <Button asChild size="lg" className="w-full">
                      <Link to="/tools" onClick={() => setMobileOpen(false)}>
                        Open the app
                      </Link>
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ConnectionStatus />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="w-full max-w-xs"
                  >
                    <SettingsDialog />
                  </motion.div>
                </>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
