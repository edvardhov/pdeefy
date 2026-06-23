import { motion } from 'motion/react'
import { Shield, Cpu, Lock } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { TiltCard } from '@/components/motion/TiltCard'

const POINTS = [
  {
    icon: Shield,
    title: 'Your files stay yours',
    body: 'Core tools process PDFs entirely in Web Workers. Nothing is uploaded to a cloud server in Live Demo Mode.',
  },
  {
    icon: Cpu,
    title: 'Main thread stays free',
    body: 'Heavy parsing runs off-thread so the UI never freezes, even on large documents.',
  },
  {
    icon: Lock,
    title: 'Encryption in-browser',
    body: 'Password protection uses AES-256 via the Web Crypto API — the same standard as enterprise PDF tools.',
  },
]

export function PrivacySection() {
  return (
    <section className="section-padding border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 max-w-xl sm:mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Privacy</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-light tracking-tight">
            Built for trust, not telemetry
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {POINTS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <TiltCard intensity={6}>
                <motion.div
                  className="group h-full space-y-5 rounded-2xl border border-border/50 bg-card/40 p-6 sm:p-7"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-background shadow-sm"
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-xl font-normal">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </motion.div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
