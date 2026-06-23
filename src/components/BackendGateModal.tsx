import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API } from "@/constants/api";
import { LINKS } from "@/constants/links";

function buildSetupInstructions() {
  return `
## Run the Local Power Backend

This feature needs server-side processing (OCR, Office conversion, deep compression). The live demo on GitHub Pages runs entirely in your browser — start the local backend to unlock it.

### Docker (recommended)

1. **Clone and start**
   \`\`\`bash
   git clone ${LINKS.githubRepo}.git
   cd pdeefy
   docker compose up -d
   \`\`\`

2. **Return here** — the app auto-detects the backend at \`${API.DEFAULT_URL}\`.

Tesseract and Ghostscript are included in the Docker image. Open [http://localhost:5173](http://localhost:5173) for the full local app, or keep using GitHub Pages with only the backend running.

### Manual setup

Requires **Python 3.11+**, **Tesseract** (\`brew install tesseract\`), and **Ghostscript** (\`brew install ghostscript\`).

\`\`\`bash
git clone ${LINKS.githubRepo}.git
cd pdeefy/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
\`\`\`

You can change the API URL in **Settings** (gear icon in the header).
`;
}

interface BackendGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolName?: string;
}

export function BackendGateModal({
  open,
  onOpenChange,
  toolName,
}: BackendGateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Local backend required</DialogTitle>
          <DialogDescription>
            {toolName
              ? `"${toolName}" needs heavy server-side computing that isn't available in the browser demo.`
              : "This feature needs heavy server-side computing that is not available in the browser demo."}
          </DialogDescription>
        </DialogHeader>
        <div className="markdown-body max-w-none">
          <ReactMarkdown>{buildSetupInstructions()}</ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}
