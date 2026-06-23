import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedPageStack } from "@/components/marketing/AnimatedPageStack";
import { FloatingOrbs } from "@/components/marketing/FloatingOrbs";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { TextReveal } from "@/components/motion/TextReveal";
import { useMotionSafe } from "@/components/motion/motionConfig";

function MagneticButton({
  children,
  to,
}: {
  children: React.ReactNode;
  to: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const { reduced } = useMotionSafe();

  const handleMove = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    setOffset({ x, y });
  };

  return (
    <motion.div
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      onPointerMove={handleMove}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      className="inline-block"
    >
      <Button
        asChild
        size="lg"
        className="group relative h-12 overflow-hidden px-8 text-base shadow-xl shadow-primary/25"
      >
        <Link ref={ref} to={to}>
          <motion.span
            className="absolute inset-0 bg-primary-foreground/10"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
          <span className="relative flex items-center">
            {children}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </span>
        </Link>
      </Button>
    </motion.div>
  );
}

const STATS = [
  { value: 22, suffix: "+", label: "PDF tools" },
  { value: 100, suffix: "%", label: "Client-side core" },
  { value: 0, suffix: "", label: "Uploads required" },
];

export function Hero() {
  const { fadeUp, staggerContainer, blurIn, reduced } = useMotionSafe();

  return (
    <section className="relative overflow-hidden pt-6 pb-20 sm:pt-12 sm:pb-28 lg:pt-16 lg:pb-32">
      <FloatingOrbs />

      {/* Decorative rule */}
      <div className="absolute top-24 left-4 hidden h-32 w-px bg-gradient-to-b from-primary/40 to-transparent lg:block" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 xl:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="order-2 space-y-7 lg:order-1 lg:space-y-8"
          >
            <div className="space-y-2">
              <TextReveal
                as="h1"
                text="Documents, refined and in your control."
                highlight="refined"
                highlightClassName="text-primary italic"
                className="font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] font-light tracking-tight text-foreground"
              />
            </div>

            <motion.p
              variants={blurIn}
              className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed"
            >
              Merge, split, convert, and protect PDFs — entirely in your
              browser. Connect the local backend when you need OCR and Office
              conversion.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <MagneticButton to="/tools">Open the app</MagneticButton>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 w-full px-6 sm:w-auto"
              >
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="grid grid-cols-3 gap-4 border-t border-border/60 pt-6 sm:flex sm:items-center sm:gap-8 sm:border-0 sm:pt-2"
            >
              {STATS.map((stat, i) => (
                <div key={stat.label} className="relative">
                  {i > 0 && (
                    <div className="absolute -left-4 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-border sm:block" />
                  )}
                  <p className="font-display text-2xl font-light sm:text-3xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2"
            initial={
              reduced ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: 20 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatedPageStack />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
