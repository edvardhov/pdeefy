import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { PdfPage } from '@/components/marketing/PdfPage'
import { useMotionSafe } from '@/components/motion/motionConfig'

interface DemoProps {
  autoPlay?: boolean
  hovered?: boolean
}

export function FlipDemo({ autoPlay = false, hovered: hoveredProp }: DemoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-20%' })
  const [localHovered, setLocalHovered] = useState(false)
  const [autoFlipped, setAutoFlipped] = useState(false)
  const { reduced } = useMotionSafe()

  const hovered = hoveredProp ?? localHovered
  const flipped = hovered || autoFlipped || reduced

  useEffect(() => {
    if (!autoPlay || !inView || reduced) return
    const interval = setInterval(() => setAutoFlipped((f) => !f), 3500)
    return () => clearInterval(interval)
  }, [inView, reduced, autoPlay])

  return (
    <div
      ref={ref}
      className="flex h-44 w-full items-center justify-center sm:h-52"
      onMouseEnter={() => setLocalHovered(true)}
      onMouseLeave={() => setLocalHovered(false)}
      onTouchStart={() => setLocalHovered(true)}
      onTouchEnd={() => setLocalHovered(false)}
    >
      <div className="relative aspect-[3/4] w-[110px] sm:w-[130px]" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative h-full w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="absolute inset-0 h-full w-full"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <PdfPage className="h-full w-full" lines={4} variant="compact" />
          </div>
          <div
            className="absolute inset-0 h-full w-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <PdfPage className="h-full w-full border-primary/40" lines={6} accent variant="compact" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
