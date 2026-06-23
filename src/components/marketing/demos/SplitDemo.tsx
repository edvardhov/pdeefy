import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { PdfPage } from '@/components/marketing/PdfPage'
import { useMotionSafe, springGentle } from '@/components/motion/motionConfig'

interface DemoProps {
  autoPlay?: boolean
  hovered?: boolean
}

export function SplitDemo({ autoPlay = false, hovered: hoveredProp }: DemoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-10%' })
  const [localHovered, setLocalHovered] = useState(false)
  const [autoActive, setAutoActive] = useState(false)
  const { reduced } = useMotionSafe()

  const hovered = hoveredProp ?? localHovered

  useEffect(() => {
    if (!autoPlay || !inView || reduced) return
    const interval = setInterval(() => setAutoActive((a) => !a), 3200)
    return () => clearInterval(interval)
  }, [autoPlay, inView, reduced])

  const split = hovered || autoActive || reduced

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
        className="absolute w-[105px] sm:w-[125px]"
        initial={false}
        animate={
          split
            ? { opacity: 0, scale: 0.85, y: 4 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={springGentle}
        style={{ zIndex: 1, pointerEvents: 'none' }}
      >
        <PdfPage className="aspect-[3/4] w-full" lines={5} variant="compact" />
      </motion.div>

      <motion.div
        className="absolute w-[90px] sm:w-[110px]"
        initial={false}
        animate={
          split
            ? { x: -68, rotate: -12, opacity: 1, scale: 1 }
            : { x: -4, rotate: -2, opacity: 0, scale: 0.95 }
        }
        transition={springGentle}
        style={{ zIndex: 2 }}
      >
        <PdfPage className="aspect-[3/4] w-full" lines={4} variant="compact" />
      </motion.div>

      <motion.div
        className="absolute w-[90px] sm:w-[110px]"
        initial={false}
        animate={
          split
            ? { x: 68, rotate: 12, opacity: 1, scale: 1 }
            : { x: 4, rotate: 2, opacity: 0, scale: 0.95 }
        }
        transition={springGentle}
        style={{ zIndex: 2 }}
      >
        <PdfPage className="aspect-[3/4] w-full" lines={4} accent variant="compact" />
      </motion.div>
    </div>
  )
}
