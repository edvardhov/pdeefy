import { TOOLS } from '@/features/registry'

export function MarqueeSection() {
  const items = [...TOOLS, ...TOOLS]

  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-paper-warm/40 py-3.5 sm:py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-paper-warm/90 to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-paper-warm/90 to-transparent sm:w-20" />

      <div className="animate-marquee flex w-max items-center gap-2.5 sm:gap-3">
        {items.map((tool, i) => {
          const Icon = tool.icon

          return (
            <span
              key={`${tool.id}-${i}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 sm:px-3.5 sm:py-2"
            >
              <Icon className="h-3.5 w-3.5 text-primary/60" strokeWidth={1.5} />
              <span className="whitespace-nowrap font-display text-sm tracking-tight text-muted-foreground">
                {tool.name}
              </span>
            </span>
          )
        })}
      </div>
    </section>
  )
}
