import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'

export function ConnectionStatus() {
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider',
        isBackendConnected
          ? 'bg-primary/5 text-foreground'
          : 'bg-muted/30 text-muted-foreground',
      )}
      title={
        isBackendConnected
          ? 'Local backend connected — server tools available'
          : 'Browser only — no local backend detected'
      }
    >
      {isBackendConnected ? (
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
      ) : (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/35"
          aria-hidden
        />
      )}
      {isBackendConnected ? 'Server' : 'Browser'}
    </span>
  )
}
