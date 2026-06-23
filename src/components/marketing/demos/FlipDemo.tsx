import { motion } from 'motion/react'
import { PdfPage } from '@/components/marketing/PdfPage'
import { easeOutExpo } from '@/components/motion/motionConfig'
import { useDemoInteraction, type DemoProps } from '@/hooks/useDemoInteraction'

export function FlipDemo({ autoPlay = false, hovered: hoveredProp }: DemoProps) {
  const { active: flipped, containerProps } = useDemoInteraction({
    autoPlay,
    hovered: hoveredProp,
    intervalMs: 3500,
    inViewMargin: '-20%',
    className: 'flex h-44 w-full items-center justify-center sm:h-52',
  })

  return (
    <div {...containerProps}>
      <div className="relative aspect-[3/4] w-[110px] sm:w-[130px]" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative h-full w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.75, ease: easeOutExpo }}
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
            <PdfPage className="h-full w-full border-punch-red-700" lines={6} accent variant="compact" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
