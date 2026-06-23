import { cn } from '@/lib/utils'

interface PdfPageProps {
  className?: string
  lines?: number
  accent?: boolean
  variant?: 'default' | 'compact'
}

export function PdfPage({ className, lines = 5, accent = false, variant = 'default' }: PdfPageProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-sm border border-border/60 bg-card pdf-page-shadow',
        className,
      )}
    >
      <div className="flex items-center border-b border-border/40 bg-muted/30 px-3 py-2">
        <div className="h-1 w-8 rounded-full bg-foreground/10" />
        {accent && (
          <div className="ml-auto font-mono text-[7px] uppercase tracking-widest text-primary/70">
            Active
          </div>
        )}
      </div>

      {accent && (
        <div className="absolute top-0 left-0 h-full w-1 bg-primary/70" aria-hidden />
      )}

      <div className={cn('space-y-2', variant === 'compact' ? 'p-3 pt-3' : 'p-4 pt-4')}>
        <div className="h-2 w-1/3 rounded-full bg-foreground/12" />
        <div className="h-1.5 w-2/3 rounded-full bg-foreground/8" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full bg-foreground/6"
            style={{ width: `${65 + (i % 4) * 8}%` }}
          />
        ))}
      </div>

      <div className="absolute bottom-2.5 right-3 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/40">
        PDF
      </div>
    </div>
  )
}
