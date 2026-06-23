import { useState } from 'react'
import { motion } from 'motion/react'
import { Reveal } from '@/components/motion/Reveal'
import { TiltCard } from '@/components/motion/TiltCard'
import { MergeDemo } from '@/components/marketing/demos/MergeDemo'
import { SplitDemo } from '@/components/marketing/demos/SplitDemo'
import { FlipDemo } from '@/components/marketing/demos/FlipDemo'

const DEMOS = [
  {
    title: 'Merge',
    caption: 'Combine documents into one seamless file.',
    Demo: MergeDemo,
  },
  {
    title: 'Split',
    caption: 'Divide pages with surgical precision.',
    Demo: SplitDemo,
  },
  {
    title: 'Rotate & Flip',
    caption: 'Reorient every page in a single action.',
    Demo: FlipDemo,
  },
]

function ShowcaseCard({
  title,
  caption,
  Demo,
}: {
  title: string
  caption: string
  Demo: React.ComponentType<{ autoPlay?: boolean; hovered?: boolean }>
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <TiltCard intensity={8}>
      <motion.article
        className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm transition-colors hover:border-lavender-grey-600 hover:bg-card dark:hover:border-lavender-grey-400"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="flex min-h-[11rem] items-center justify-center px-4 pt-6 sm:min-h-[13rem]">
          <Demo autoPlay hovered={hovered} />
        </div>
        <div className="border-t border-border/40 p-5 sm:p-6">
          <h3 className="font-display text-xl font-normal">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{caption}</p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Live preview
          </p>
        </div>
      </motion.article>
    </TiltCard>
  )
}

export function ShowcaseSection() {
  return (
    <section id="features" className="section-padding relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 max-w-2xl sm:mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Capabilities</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-light tracking-tight">
            What you can do
          </h2>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Hover or scroll to watch each action. Every tool runs the same logic — fast, local, and
            private.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {DEMOS.map((demo) => (
            <ShowcaseCard key={demo.title} {...demo} />
          ))}
        </div>
      </div>
    </section>
  )
}
