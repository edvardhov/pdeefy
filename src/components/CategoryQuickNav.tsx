import { CATEGORY_ORDER } from '@/features/types'
import { categorySlug } from '@/features/toolFilters'

export function CategoryQuickNav() {
  return (
    <nav aria-label="Browse by category" className="flex flex-wrap gap-x-1 gap-y-2">
      {CATEGORY_ORDER.map((category, i) => (
        <span key={category} className="inline-flex items-center">
          {i > 0 && <span className="mr-1 text-border" aria-hidden>·</span>}
          <a
            href={`#${categorySlug(category)}`}
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {category}
          </a>
        </span>
      ))}
    </nav>
  )
}
