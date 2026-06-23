import ReactMarkdown from 'react-markdown'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const SETUP_INSTRUCTIONS = `
## Run the Local Power Backend

This feature needs server-side processing (OCR, Office conversion, deep compression). The live demo on GitHub Pages runs entirely in your browser — start the local FastAPI backend to unlock it.

### Prerequisites

- **Python 3.11+** (pyenv recommended)
- **Tesseract OCR** (\`brew install tesseract\` on macOS)
- **Ghostscript** (\`brew install ghostscript\`) for deep compression

### Steps

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/pdeefy.git
   cd pdeefy
   \`\`\`

2. **Create a virtual environment**
   \`\`\`bash
   cd backend
   python3.11 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   \`\`\`

3. **Start the server**
   \`\`\`bash
   uvicorn app.main:app --reload --port 8000
   \`\`\`

4. **Return here** — the app will auto-detect the backend at \`http://localhost:8000\`.

You can change the API URL in **Settings** (gear icon in the header).
`

interface BackendGateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  toolName?: string
}

export function BackendGateModal({ open, onOpenChange, toolName }: BackendGateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Local backend required</DialogTitle>
          <DialogDescription>
            {toolName
              ? `"${toolName}" needs heavy server-side computing that isn't available in the browser demo.`
              : 'This feature needs heavy server-side computing that is not available in the browser demo.'}
          </DialogDescription>
        </DialogHeader>
        <div className="markdown-body max-w-none">
          <ReactMarkdown>{SETUP_INSTRUCTIONS}</ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  )
}
