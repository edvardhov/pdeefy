import { DialogContent } from '@/components/ui/dialog'
import { FULLSCREEN_DIALOG_CLASS } from '@/constants/ui'
import { cn } from '@/lib/utils'

interface FullscreenDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogContent> {}

export function FullscreenDialogContent({
  className,
  ...props
}: FullscreenDialogContentProps) {
  return <DialogContent className={cn(FULLSCREEN_DIALOG_CLASS, className)} {...props} />
}
