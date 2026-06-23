import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { PdfPage } from '@/components/marketing/PdfPage'
import { useMotionSafe, springGentle } from '@/components/motion/motionConfig'

interface DemoProps {
  autoPlay?: boolean
  hovered?: boolean
}

export function MergeDemo({ autoPlay = false, hovered: hoveredProp }: DemoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-10%' })
  const [localHovered, setLocalHovered] = useState(false)
  const [autoActive, setAutoActive] = useState(false)
  const { reduced } = useMotionSafe()

  const hovered = hoveredProp ?? localHovered

  useEffect(() => {
    if (!autoPlay || !inView || reduced) return
    const interval = setInterval(() => setAutoActive((a) => !a), 2800)
    return () => clearInterval(interval)
  }, [autoPlay, inView, reduced])

  const merged = hovered || autoActive || reduced

  return (
    <div
      ref={ref}
      className="relative flex h-44 w-full items-center justify-center sm:h-52"
      onMouseEnter={() => setLocalHovered(true)}
      onMouseLeave={() => setLocalHovered(false)}
      onTouchStart={() => setLocalHovered(true)}
      onTouchEnd={() => setLocalHovered(false)}
    >
      <motion.div
        className="absolute w-[90px] sm:w-[110px]"
        animate={
          merged
            ? { x: -12, rotate: -6, scale: 0.9, opacity: 0.5 }
            : { x: -72, rotate: -14, scale: 1, opacity: 1 }
        }
        transition={springGentle}
        style={{ zIndex: 1 }}
      >
        <PdfPage className="aspect-[3/4] w-full" lines={3} variant="compact" />
      </motion.div>
      <motion.div
        className="absolute w-[90px] sm:w-[110px]"
        animate={
          merged
            ? { x: 12, rotate: 6, scale: 0.9, opacity: 0.5 }
            : { x: 72, rotate: 14, scale: 1, opacity: 1 }
        }
        transition={springGentle}
        style={{ zIndex: 2 }}
      >
        <PdfPage className="aspect-[3/4] w-full" lines={4} accent variant="compact" />
      </motion.div>
      <motion.div
        className="absolute w-[105px] sm:w-[125px]"
        initial={false}
        animate={
          merged
            ? { opacity: 1, scale: 1, rotate: 0, y: 0 }
            : { opacity: 0, scale: 0.8, rotate: 4, y: 8 }
        }
        transition={springGentle}
        style={{ zIndex: 3, pointerEvents: 'none' }}
      >
        <PdfPage className="aspect-[3/4] w-full border-punch-red-700" lines={6} accent variant="compact" />
      </motion.div>
    </div>
  )
}
