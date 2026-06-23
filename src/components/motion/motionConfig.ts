import { useReducedMotion } from 'motion/react'
import type { Transition, Variants } from 'motion/react'

export const easeOutExpo: Transition['ease'] = [0.16, 1, 0.3, 1]

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 28,
}

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 22,
}

export function useMotionSafe() {
  const reduced = useReducedMotion()

  const fadeUp: Variants = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutExpo } },
      }

  const fadeIn: Variants = reduced
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, ease: easeOutExpo } },
      }

  const blurIn: Variants = reduced
    ? { hidden: { opacity: 1, filter: 'blur(0px)' }, visible: { opacity: 1, filter: 'blur(0px)' } }
    : {
        hidden: { opacity: 0, filter: 'blur(8px)' },
        visible: {
          opacity: 1,
          filter: 'blur(0px)',
          transition: { duration: 0.8, ease: easeOutExpo },
        },
      }

  const slideInLeft: Variants = reduced
    ? { hidden: { opacity: 1, x: 0 }, visible: { opacity: 1, x: 0 } }
    : {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeOutExpo } },
      }

  const staggerContainer: Variants = reduced
    ? { hidden: {}, visible: {} }
    : {
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
      }

  const staggerFast: Variants = reduced
    ? { hidden: {}, visible: {} }
    : {
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.05, delayChildren: 0.02 },
        },
      }

  const scaleIn: Variants = reduced
    ? { hidden: { opacity: 1, scale: 1 }, visible: { opacity: 1, scale: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: easeOutExpo } },
      }

  const wordReveal: Variants = reduced
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: '110%', rotateX: -40 },
        visible: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.65, ease: easeOutExpo },
        },
      }

  return {
    reduced,
    fadeUp,
    fadeIn,
    blurIn,
    slideInLeft,
    staggerContainer,
    staggerFast,
    scaleIn,
    wordReveal,
  }
}
