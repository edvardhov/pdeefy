import { Link } from "react-router-dom";
import { BrandMark } from "@/components/BrandMark";
import { ANCHORS, LINKS } from "@/constants/links";
import { APP_VERSION } from "@/constants/version";
import { MARKETING_CONTAINER_CLASS } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className={MARKETING_CONTAINER_CLASS}>
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <BrandMark iconClassName="h-7 w-7" logoClassName="h-8 w-auto" />
            <a
              href={`${LINKS.releases}/tag/v${APP_VERSION}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              v{APP_VERSION}
            </a>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link
              to={ROUTES.tools}
              className="transition-colors hover:text-foreground"
            >
              Tools
            </Link>
            <a
              href={LINKS.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href={ANCHORS.features}
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
