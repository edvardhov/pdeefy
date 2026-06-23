import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { useMotionSafe } from '@/components/motion/motionConfig'

export interface DemoInteractionOptions {
  autoPlay?: boolean
  hovered?: boolean
  intervalMs?: number
  inViewMargin?: `${number}%` | `${number}px` | `${number}% ${number}%`
  className?: string
}

export function useDemoInteraction({
  autoPlay = false,
  hovered: hoveredProp,
  intervalMs = 2800,
  inViewMargin = '-10%' as const,
  className = 'relative flex h-44 w-full items-center justify-center sm:h-52',
}: DemoInteractionOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: inViewMargin })
  const [localHovered, setLocalHovered] = useState(false)
  const [autoActive, setAutoActive] = useState(false)
  const { reduced } = useMotionSafe()

  const hovered = hoveredProp ?? localHovered
  const active = hovered || autoActive || reduced

  useEffect(() => {
    if (!autoPlay || !inView || reduced) return
    const interval = setInterval(() => setAutoActive((value) => !value), intervalMs)
    return () => clearInterval(interval)
  }, [autoPlay, inView, reduced, intervalMs])

  return {
    ref,
    active,
    containerProps: {
      ref,
      className,
      onMouseEnter: () => setLocalHovered(true),
      onMouseLeave: () => setLocalHovered(false),
      onTouchStart: () => setLocalHovered(true),
      onTouchEnd: () => setLocalHovered(false),
    },
  }
}

export type DemoProps = DemoInteractionOptions
