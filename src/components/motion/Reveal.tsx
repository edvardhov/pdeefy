import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useMotionSafe } from '@/components/motion/motionConfig'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'article'
}

export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const { fadeUp, reduced } = useMotionSafe()
  const Component = motion[as]

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      transition={reduced ? undefined : { delay }}
      className={cn(className)}
    >
      {children}
    </Component>
  )
}

interface RevealStaggerProps {
  children: ReactNode
  className?: string
}

export function RevealStagger({ children, className }: RevealStaggerProps) {
  const { staggerContainer, fadeUp } = useMotionSafe()

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={staggerContainer}
      className={cn(className)}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={fadeUp}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}
