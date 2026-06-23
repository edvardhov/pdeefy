import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { PdfPage } from "@/components/marketing/PdfPage";
import { useMotionSafe } from "@/components/motion/motionConfig";

const PAGES = [
  { rotate: -10, x: -28, y: 14, delay: 0.05, z: 1, lines: 3 },
  { rotate: 5, x: 20, y: -8, delay: 0.15, z: 2, lines: 4 },
  { rotate: -3, x: 0, y: 0, delay: 0.25, z: 4, lines: 5, accent: true },
  { rotate: 8, x: 30, y: 18, delay: 0.35, z: 2, lines: 4 },
  { rotate: -6, x: -14, y: 24, delay: 0.45, z: 1, lines: 3 },
];

export function AnimatedPageStack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const { reduced } = useMotionSafe();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const [active, setActive] = useState(false);

  const stackY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [50, -50],
  );
  const stackRotate = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [-3, 5],
  );

  const handlePointer = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 24);
    mouseY.set(y * 16);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={ref}
      className="relative mx-auto h-[340px] w-full max-w-lg sm:h-[440px] md:h-[500px]"
      onPointerMove={handlePointer}
      onPointerLeave={handlePointerLeave}
      onClick={() => setActive((a) => !a)}
      role="presentation"
    >
      <motion.div
        className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-punch-red-900/50 blur-3xl dark:bg-punch-red-300/15 sm:h-64 sm:w-64"
        animate={
          reduced
            ? {}
            : { scale: active ? 1.2 : 1, opacity: active ? 0.8 : 0.5 }
        }
        transition={{ duration: 0.6 }}
      />

      <motion.div
        style={{
          y: stackY,
          rotate: stackRotate,
          x: reduced ? 0 : springX,
        }}
        className="relative h-full w-full"
      >
        <motion.div
          style={{ y: reduced ? 0 : springY }}
          className="relative h-full w-full"
        >
          {PAGES.map((page, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 w-[160px] sm:w-[200px] md:w-[230px]"
              style={{ zIndex: page.z }}
              initial={
                reduced
                  ? { opacity: 1, x: "-50%", y: "-50%", rotate: page.rotate }
                  : {
                      opacity: 0,
                      x: "-50%",
                      y: "30%",
                      rotate: page.rotate + 20,
                      scale: 0.8,
                    }
              }
              animate={{
                opacity: 1,
                x: `calc(-50% + ${active && page.accent ? 0 : page.x}px)`,
                y: `calc(-50% + ${active && page.accent ? -8 : page.y}px)`,
                rotate:
                  active && !page.accent ? page.rotate * 1.5 : page.rotate,
                scale: active && page.accent ? 1.05 : 1,
              }}
              transition={{
                delay: page.delay,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <motion.div
                animate={
                  reduced || active
                    ? {}
                    : {
                        y: [0, i % 2 === 0 ? -6 : 6, 0],
                      }
                }
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              >
                <PdfPage
                  className="aspect-[3/4] w-full"
                  accent={page.accent}
                  lines={page.lines}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
