import { mergePdfs } from '@/features/client/merge'
import { jpgToPdf, pngToPdf } from '@/features/client/jpgToPdf'
import { passwordProtectPdf } from '@/features/client/passwordProtect'
import { rotatePdf, type RotationAngle } from '@/features/client/rotate'
import { splitPdf, type SplitMode } from '@/features/client/split'
import type { WorkerRequest, WorkerResponse } from './types'

async function handleRequest(request: WorkerRequest): Promise<WorkerResponse> {
  try {
    switch (request.op) {
      case 'merge': {
        const data = await mergePdfs(request.files)
        return { id: request.id, ok: true, data }
      }
      case 'split': {
        const mode = (request.params?.mode as SplitMode) ?? 'half'
        const ranges = request.params?.ranges as string | undefined
        const baseFilename = (request.params?.baseFilename as string) ?? 'document'
        const outputs = await splitPdf(request.files[0], { mode, ranges }, baseFilename)
        return { id: request.id, ok: true, outputs }
      }
      case 'rotate': {
        const angle = (request.params?.angle as RotationAngle) ?? 90
        const data = await rotatePdf(request.files[0], angle)
        return { id: request.id, ok: true, data }
      }
      case 'jpgToPdf': {
        const mime = request.params?.mime as string | undefined
        const data =
          mime === 'image/png' ? await pngToPdf(request.files) : await jpgToPdf(request.files)
        return { id: request.id, ok: true, data }
      }
      case 'passwordProtect': {
        const userPassword = (request.params?.userPassword as string) ?? ''
        const ownerPassword = request.params?.ownerPassword as string | undefined
        const data = await passwordProtectPdf(request.files[0], userPassword, ownerPassword)
        return { id: request.id, ok: true, data }
      }
      default:
        return { id: request.id, ok: false, error: `Unknown operation: ${request.op}` }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown worker error'
    return { id: request.id, ok: false, error: message }
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  void handleRequest(event.data).then((response) => {
    self.postMessage(response)
  })
}
