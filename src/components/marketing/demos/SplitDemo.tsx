import { motion } from 'motion/react'
import { PdfPage } from '@/components/marketing/PdfPage'
import { springGentle } from '@/components/motion/motionConfig'
import { useDemoInteraction, type DemoProps } from '@/hooks/useDemoInteraction'

export function SplitDemo({ autoPlay = false, hovered: hoveredProp }: DemoProps) {
  const { active: split, containerProps } = useDemoInteraction({
    autoPlay,
    hovered: hoveredProp,
    intervalMs: 3200,
  })

  return (
    <div {...containerProps}>
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
