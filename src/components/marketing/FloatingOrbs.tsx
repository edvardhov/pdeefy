import { motion } from 'motion/react'
import { useMotionSafe } from '@/components/motion/motionConfig'

export function FloatingOrbs() {
  const { reduced } = useMotionSafe()

  if (reduced) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-punch-red-900/40 blur-3xl dark:bg-punch-red-300/15"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-punch-red-900/30 blur-3xl dark:bg-punch-red-300/10"
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-space-indigo-700/15 blur-3xl dark:bg-space-indigo-600/20"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
