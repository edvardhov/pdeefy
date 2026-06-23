import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="section-padding pb-24 sm:pb-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-paper-warm px-6 py-14 text-center sm:px-16 sm:py-20">
            {/* Animated gradient border glow */}
            <motion.div
              className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent, rgb(239 35 60 / 0.35), transparent, rgb(239 35 60 / 0.15), transparent)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative rounded-[calc(1.5rem-1px)] bg-paper-warm px-4 py-10 sm:py-12">
              <motion.div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 60% at 50% 100%, rgb(239 35 60 / 0.12), transparent)',
                }}
              />
              <h2 className="relative font-display text-[clamp(1.75rem,4vw,2.75rem)] font-light tracking-tight">
                Ready to work with your documents?
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-base text-muted-foreground">
                Open the full toolkit — free, open-source, and designed to respect your privacy.
              </p>
              <motion.div
                className="relative mt-8"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild size="lg" className="h-12 px-10 text-base shadow-xl shadow-space-indigo-500/10">
                  <Link to="/tools">
                    Open the app
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
