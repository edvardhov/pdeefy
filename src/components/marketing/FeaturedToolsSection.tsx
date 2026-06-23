import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Reveal } from '@/components/motion/Reveal'
import { TiltCard } from '@/components/motion/TiltCard'
import { TOOLS } from '@/features/registry'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FEATURED_IDS = ['merge', 'split', 'rotate', 'jpg-to-pdf', 'pdf-to-word', 'ocr']

const BENTO_LAYOUT = [
  'sm:col-span-2 lg:col-span-2',
  '',
  '',
  '',
  'lg:col-span-1',
  'sm:col-span-2 lg:col-span-1',
]

export function FeaturedToolsSection() {
  const featured = FEATURED_IDS.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean)

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Toolkit</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-light tracking-tight">
              Start with the essentials
            </h2>
          </div>
          <Button asChild variant="outline" className="group">
            <Link to="/tools">
              See all tools
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {featured.map((tool, i) => {
            if (!tool) return null
            const Icon = tool.icon
            const isHero = i === 0

            return (
              <TiltCard key={tool.id} className={cn(BENTO_LAYOUT[i], isHero && 'lg:row-span-1')} intensity={8}>
                <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                  <Link
                    to={`/tool/${tool.id}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-5 transition-all hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5 sm:p-6"
                  >
                    {isHero && (
                      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/8 blur-2xl" />
                    )}
                    <div className="flex w-full items-start justify-between">
                      <div className="rounded-xl bg-secondary p-3 transition-colors group-hover:bg-primary/10">
                        <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <div className="mt-4 flex-1">
                      <h3 className={cn('font-display font-normal', isHero ? 'text-xl sm:text-2xl' : 'text-lg')}>
                        {tool.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      {tool.mode === 'backend' && (
                        <span className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          Server required
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              </TiltCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
