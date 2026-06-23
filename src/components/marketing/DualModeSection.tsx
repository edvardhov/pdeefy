import { useState } from 'react'
import { motion } from 'motion/react'
import { Cloud, Server, Zap } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { Badge } from '@/components/ui/badge'
import {
  MarketingContainer,
  MarketingSectionHeader,
} from '@/components/marketing/MarketingSection'
import { ANCHORS } from '@/constants/links'
import { API } from '@/constants/api'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

export function DualModeSection() {
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)
  const [selected, setSelected] = useState<'demo' | 'power'>(isBackendConnected ? 'power' : 'demo')

  return (
    <section id={ANCHORS.dualMode.slice(1)} className="section-padding relative overflow-hidden">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-punch-red-900/20 to-transparent dark:via-punch-red-300/10" />

      <MarketingContainer className="relative">
        <Reveal className="mb-10 text-center sm:mb-14">
          <MarketingSectionHeader
            eyebrow="Architecture"
            title="Two modes. One codebase."
            align="center"
          />
          <div className="mt-5 flex justify-center">
            <Badge
              variant={isBackendConnected ? 'default' : 'secondary'}
              className="gap-1.5 px-3 py-1"
            >
              {isBackendConnected ? (
                <>
                  <motion.span
                    className="h-2 w-2 rounded-full bg-primary-foreground"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <Server className="h-3 w-3" />
                  Backend detected — Local Power Mode
                </>
              ) : (
                <>
                  <Cloud className="h-3 w-3" />
                  Live Demo Mode — browser only
                </>
              )}
            </Badge>
          </div>
        </Reveal>

        {/* Mode toggle — mobile friendly */}
        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="inline-flex rounded-full border border-border/60 bg-muted/50 p-1">
            {(['demo', 'power'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSelected(mode)}
                className={cn(
                  'relative rounded-full px-5 py-2 text-sm font-medium transition-colors',
                  selected === mode ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {selected === mode && (
                  <motion.div
                    layoutId="mode-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {mode === 'demo' ? 'Live Demo' : 'Local Power'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ModeCard
            mode="demo"
            selected={selected}
            onSelect={() => setSelected('demo')}
            icon={Cloud}
            title="Live Demo Mode"
            description="Deployed on GitHub Pages. Merge, split, rotate, protect, and convert images — all in Web Workers."
            features={['pdf-lib in isolated workers', 'AES-256 password protection', 'Works offline after first load']}
          />
          <ModeCard
            mode="power"
            selected={selected}
            onSelect={() => setSelected('power')}
            icon={Server}
            title="Local Power Mode"
            description="Run FastAPI locally to unlock OCR, PDF-to-Word, and deep compression via PyMuPDF and Tesseract."
            features={[`Auto-detected at ${API.DEFAULT_HOST}`, 'Configurable API URL', 'Files never leave your machine']}
            highlighted={isBackendConnected}
          />
        </div>
      </MarketingContainer>
    </section>
  )
}

function ModeCard({
  mode,
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
  features,
  highlighted = false,
}: {
  mode: 'demo' | 'power'
  selected: 'demo' | 'power'
  onSelect: () => void
  icon: typeof Cloud
  title: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  const isActive = selected === mode

  return (
    <Reveal delay={mode === 'power' ? 0.15 : 0}>
      <motion.button
        type="button"
        onClick={onSelect}
        className={cn(
          'h-full w-full rounded-2xl border p-7 text-left transition-shadow sm:p-8',
          isActive
            ? 'border-punch-red-700 bg-card shadow-lg'
            : 'border-border/60 bg-card/40 opacity-80 hover:opacity-100',
          highlighted && mode === 'power' && 'ring-2 ring-punch-red-800/50',
        )}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-punch-red-900/50 dark:bg-punch-red-300/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {highlighted && mode === 'power' && (
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-primary">
              <Zap className="h-3 w-3" />
              Active
            </span>
          )}
        </div>
        <h3 className="font-display text-2xl font-normal">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <ul className="mt-6 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-2 h-px w-3 shrink-0 bg-punch-red-600" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </motion.button>
    </Reveal>
  )
}
