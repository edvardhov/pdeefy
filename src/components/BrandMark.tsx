import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Applied to both icon and logo images. */
  className?: string;
  /** Icon mark on viewports below `md`. Defaults to h-7 w-7. */
  iconClassName?: string;
  /** Full lockup on `md` and up. Defaults to h-8 w-auto. */
  logoClassName?: string;
}

/**
 * Pdeefy brand mark: square icon below `md`, full logo lockup at `md+`.
 * Swaps light/dark SVG variants by theme.
 *
 * Breakpoint and theme are split into separate wrappers so responsive
 * `display` rules don't fight compound `md:dark:` variants.
 */
export function BrandMark({
  className,
  iconClassName = "h-7 w-7",
  logoClassName = "h-8 w-auto",
}: BrandMarkProps) {
  const base = import.meta.env.BASE_URL;

  return (
    <>
      <div className="md:hidden">
        <img
          src={`${base}app-icon-light.svg`}
          alt="Pdeefy"
          className={cn("block shrink-0 dark:hidden", iconClassName, className)}
        />
        <img
          src={`${base}app-icon-dark.svg`}
          alt="Pdeefy"
          aria-hidden="true"
          className={cn("hidden shrink-0 dark:block", iconClassName, className)}
        />
      </div>
      <div className="hidden md:block">
        <img
          src={`${base}app-logo-light.svg`}
          alt="Pdeefy"
          className={cn("block shrink-0 dark:hidden", logoClassName, className)}
        />
        <img
          src={`${base}app-logo-dark.svg`}
          alt="Pdeefy"
          aria-hidden="true"
          className={cn("hidden shrink-0 dark:block", logoClassName, className)}
        />
      </div>
    </>
  );
}
