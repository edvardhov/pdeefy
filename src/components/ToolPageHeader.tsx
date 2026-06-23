import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

interface ToolPageHeaderProps {
  icon: LucideIcon
  name: string
  description: string
}

export function ToolPageHeader({ icon: Icon, name, description }: ToolPageHeaderProps) {
  return (
    <div className="mb-6">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to={ROUTES.tools}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          All tools
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-muted p-3">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
