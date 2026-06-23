import { useState } from 'react'
import { Loader2, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { testConnection } from '@/hooks/useHealthCheck'
import { useAppStore } from '@/store/appStore'

export function SettingsDialog() {
  const apiUrl = useAppStore((s) => s.apiUrl)
  const isBackendConnected = useAppStore((s) => s.isBackendConnected)
  const setApiUrl = useAppStore((s) => s.setApiUrl)
  const setBackendConnected = useAppStore((s) => s.setBackendConnected)

  const [open, setOpen] = useState(false)
  const [draftUrl, setDraftUrl] = useState(apiUrl)
  const [testing, setTesting] = useState(false)

  const handleOpen = (next: boolean) => {
    if (next) setDraftUrl(apiUrl)
    setOpen(next)
  }

  const handleSave = () => {
    setApiUrl(draftUrl.trim())
    toast.success('API URL saved')
    setOpen(false)
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const connected = await testConnection(draftUrl.trim())
      setBackendConnected(connected)
      if (connected) {
        toast.success('Backend connected')
      } else {
        toast.error('Could not reach backend')
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure the local FastAPI backend connection.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={isBackendConnected ? 'default' : 'secondary'}>
              {isBackendConnected ? 'Connected' : 'Offline'}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-url">Local API URL</Label>
            <Input
              id="api-url"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test connection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
