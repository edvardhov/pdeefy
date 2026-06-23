import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useMotionSafe } from '@/components/motion/motionConfig'

interface TextRevealProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'p' | 'span'
  highlight?: string
  highlightClassName?: string
}

export function TextReveal({
  text,
  className,
  as = 'h1',
  highlight,
  highlightClassName,
}: TextRevealProps) {
  const { staggerFast, wordReveal } = useMotionSafe()
  const Component = motion[as]
  const words = text.split(' ')

  return (
    <Component
      className={cn(className, 'flex flex-wrap gap-x-[0.28em] gap-y-1')}
      initial="hidden"
      animate="visible"
      variants={staggerFast}
      aria-label={text}
    >
      {words.map((word, i) => {
        const clean = (w: string) => w.replace(/[.,!?;:]/g, '')
        const isHighlight =
          highlight && clean(word).toLowerCase() === clean(highlight).toLowerCase()
        return (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-1">
            <motion.span
              variants={wordReveal}
              className={cn('inline-block', isHighlight && highlightClassName)}
              style={{ transformOrigin: 'bottom' }}
            >
              {word}
            </motion.span>
          </span>
        )
      })}
    </Component>
  )
}
