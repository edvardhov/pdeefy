import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <BrandMark iconClassName="h-7 w-7" logoClassName="h-8 w-auto" />
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link
              to="/tools"
              className="transition-colors hover:text-foreground"
            >
              Tools
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
