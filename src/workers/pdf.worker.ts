import { mergePdfs } from '@/features/client/merge'
import { jpgToPdf, pngToPdf } from '@/features/client/jpgToPdf'
import { passwordProtectPdf } from '@/features/client/passwordProtect'
import { rotatePdf, type RotationAngle } from '@/features/client/rotate'
import { splitPdf, type SplitMode } from '@/features/client/split'
import { unlockPdf } from '@/features/client/unlock'
import { watermarkPdf } from '@/features/client/watermark'
import { flattenPdf } from '@/features/client/flatten'
import { extractPagesPdf } from '@/features/client/extract'
import { deletePagesPdf } from '@/features/client/deletePages'
import { markdownToPdf } from '@/features/client/markdownToPdf'
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
      case 'unlock': {
        const password = (request.params?.password as string) ?? ''
        const data = await unlockPdf(request.files[0], password)
        return { id: request.id, ok: true, data }
      }
      case 'watermark': {
        const mode = (request.params?.mode as 'text' | 'image') ?? 'text'
        const opacity = (request.params?.opacity as number) ?? 0.3
        const fontSize = (request.params?.fontSize as number) ?? 48
        const imageScale = (request.params?.imageScale as number) ?? 0.35
        const layout = (request.params?.layout as 'single' | 'tile') ?? 'tile'
        const data = await watermarkPdf(request.files[0], {
          mode,
          layout,
          text: (request.params?.text as string) ?? '',
          fontSize,
          opacity,
          imageBytes: mode === 'image' ? request.files[1] : undefined,
          imageMime: request.params?.imageMime as string | undefined,
          imageFilename: request.params?.imageFilename as string | undefined,
          imageScale,
        })
        return { id: request.id, ok: true, data }
      }
      case 'flatten': {
        const data = await flattenPdf(request.files[0])
        return { id: request.id, ok: true, data }
      }
      case 'extract': {
        const ranges = (request.params?.ranges as string) ?? ''
        const data = await extractPagesPdf(request.files[0], ranges)
        return { id: request.id, ok: true, data }
      }
      case 'deletePages': {
        const pages = (request.params?.pages as string) ?? ''
        const data = await deletePagesPdf(request.files[0], pages)
        return { id: request.id, ok: true, data }
      }
      case 'markdownToPdf': {
        const decoder = new TextDecoder('utf-8')
        const text = decoder.decode(request.files[0])
        const data = await markdownToPdf(text)
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
