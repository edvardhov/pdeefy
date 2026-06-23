import { useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { ArrowDownToLine, Download, Upload } from 'lucide-react'
import { PdfPage } from '@/components/marketing/PdfPage'
import { useMotionSafe } from '@/components/motion/motionConfig'

const STEPS = [
  {
    num: '01',
    icon: Upload,
    title: 'Drop your files',
    body: 'Drag PDFs or images into any tool. Instant validation — no account, no upload queue.',
  },
  {
    num: '02',
    icon: ArrowDownToLine,
    title: 'Process locally',
    body: 'Web Workers handle the heavy lifting off-thread. Advanced jobs route to your local FastAPI server.',
  },
  {
    num: '03',
    icon: Download,
    title: 'Download the result',
    body: 'Get your merged, split, or converted file in seconds. Your originals never leave your device.',
  },
] as const

export function WorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })
  const [activeStep, setActiveStep] = useState(0)
  const { reduced } = useMotionSafe()

  return (
    <section ref={sectionRef} className="section-padding relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 max-w-2xl sm:mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Workflow</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-light leading-tight tracking-tight">
            Three steps. Zero friction.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            From drop to download — every step stays in your browser unless you opt into local power
            mode.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-3xl border border-border/60 bg-paper-warm/40 shadow-sm"
        >
          <div className="grid lg:grid-cols-[1fr_1.1fr] lg:divide-x lg:divide-border/50">
            {/* Step list */}
            <div className="divide-y divide-border/50">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                const isActive = activeStep === i
                return (
                  <button
                    key={step.num}
                    type="button"
                    onMouseEnter={() => setActiveStep(i)}
                    onFocus={() => setActiveStep(i)}
                    onClick={() => setActiveStep(i)}
                    className={`group relative w-full px-6 py-7 text-left transition-colors sm:px-8 sm:py-8 ${
                      isActive ? 'bg-card/80' : 'hover:bg-card/40'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="workflow-active"
                        className="absolute inset-y-0 left-0 w-1 bg-primary"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <div className="flex gap-5">
                      <span
                        className={`font-display text-3xl font-light tabular-nums transition-colors sm:text-4xl ${
                          isActive ? 'text-primary/80' : 'text-primary/20'
                        }`}
                      >
                        {step.num}
                      </span>
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                          <h3 className="font-display text-lg font-normal sm:text-xl">{step.title}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Live preview panel */}
            <div className="flex min-h-[280px] flex-col items-center justify-center bg-card/30 p-8 sm:min-h-[320px] lg:min-h-0">
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Step {STEPS[activeStep].num}
              </p>
              <WorkflowVisual step={activeStep} animate={!reduced} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function WorkflowVisual({ step, animate }: { step: number; animate: boolean }) {
  return (
    <div className="relative flex h-48 w-full max-w-xs items-center justify-center">
      {step === 0 && <DropVisual animate={animate} />}
      {step === 1 && <ProcessVisual animate={animate} />}
      {step === 2 && <DownloadVisual animate={animate} />}
    </div>
  )
}

function DropVisual({ animate }: { animate: boolean }) {
  return (
    <>
      <motion.div
        className="absolute inset-x-4 bottom-4 top-8 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5"
        animate={animate ? { opacity: [0.7, 1, 0.7] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[72px]"
        initial={{ y: -40, opacity: 0.6, rotate: -8 }}
        animate={animate ? { y: [8, 8, 8], opacity: [0.6, 1, 0.6], rotate: [0, 0, 0] } : { y: 8, opacity: 1, rotate: 0 }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
      >
        <PdfPage className="aspect-[3/4] w-full shadow-lg" lines={3} variant="compact" />
      </motion.div>
      <motion.div
        className="absolute w-[68px]"
        initial={{ y: -55, opacity: 0.4, rotate: 6 }}
        animate={animate ? { y: [-4, -4, -4], opacity: [0.5, 0.9, 0.5], rotate: [4, 4, 4] } : { y: -4, opacity: 0.85, rotate: 4 }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut', delay: 0.2 }}
      >
        <PdfPage className="aspect-[3/4] w-full" lines={4} accent variant="compact" />
      </motion.div>
    </>
  )
}

function ProcessVisual({ animate }: { animate: boolean }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-8 rounded-full border border-primary/10"
        animate={animate ? { scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative w-[100px] overflow-hidden rounded-sm"
        animate={animate ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PdfPage className="aspect-[3/4] w-full border-primary/30" lines={5} accent variant="compact" />
        {animate && (
          <motion.div
            className="absolute inset-x-0 h-px bg-primary/50"
            animate={{ top: ['10%', '85%', '10%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </div>
  )
}

function DownloadVisual({ animate }: { animate: boolean }) {
  return (
    <>
      <motion.div className="relative w-[100px]" animate={animate ? { y: [0, -4, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <PdfPage className="aspect-[3/4] w-full" lines={6} accent variant="compact" />
      </motion.div>
      <motion.div
        className="absolute -bottom-2 flex flex-col items-center text-primary"
        animate={animate ? { y: [0, 6, 0], opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <Download className="h-5 w-5" />
        <span className="mt-1 font-mono text-[9px] uppercase tracking-widest">Ready</span>
      </motion.div>
    </>
  )
}
