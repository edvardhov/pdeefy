import { toast } from 'sonner'
import { API } from '@/constants/api'
import { MIME } from '@/constants/mime'
import { postFile } from '@/lib/api'
import { baseName } from '@/lib/download'
import { runPdfWorkerOrThrow } from '@/lib/workerClient'
import type { ToolContext, ToolRunnerResult } from '@/features/types'

async function runToolRunner(
  fallbackMessage: string,
  run: () => Promise<ToolRunnerResult>,
): Promise<ToolRunnerResult> {
  try {
    return await run()
  } catch (error) {
    const message = error instanceof Error ? error.message : fallbackMessage
    toast.error(message)
    return { success: false, message }
  }
}

async function blobToOutput(name: string, blob: Blob, mimeType: string) {
  return {
    name,
    data: new Uint8Array(await blob.arrayBuffer()),
    mimeType,
  }
}

export async function notImplementedRunner(): Promise<ToolRunnerResult> {
  toast.info('This tool is coming soon.')
  return { success: false, message: 'Not implemented yet' }
}

export async function runMerge(ctx: ToolContext): Promise<ToolRunnerResult> {
  return runToolRunner('Merge failed', async () => {
    const result = await runPdfWorkerOrThrow('merge', ctx.files)
    if (!result.data) throw new Error('No output generated')
    return {
      success: true,
      outputs: [{ name: 'merged.pdf', data: result.data }],
    }
  })
}

export async function runSplit(ctx: ToolContext): Promise<ToolRunnerResult> {
  return runToolRunner('Split failed', async () => {
    const mode = ctx.params.mode === 'pages' ? 'pages' : 'half'
    const baseFilename = baseName(ctx.files[0].name)
    const result = await runPdfWorkerOrThrow('split', ctx.files, {
      mode,
      ranges: ctx.params.ranges,
      baseFilename,
    })
    if (!result.outputs?.length) throw new Error('No output generated')
    return {
      success: true,
      outputs: result.outputs,
      downloadZipName: `${baseFilename}_splits.zip`,
    }
  })
}

export async function runRotate(ctx: ToolContext): Promise<ToolRunnerResult> {
  return runToolRunner('Rotate failed', async () => {
    const angle = Number.parseInt(ctx.params.angle ?? '90', 10) as 90 | 180 | 270
    const result = await runPdfWorkerOrThrow('rotate', ctx.files, { angle })
    if (!result.data) throw new Error('No output generated')
    return {
      success: true,
      outputs: [{ name: `rotated_${ctx.files[0].name}`, data: result.data }],
    }
  })
}

export async function runJpgToPdf(ctx: ToolContext): Promise<ToolRunnerResult> {
  return runToolRunner('Conversion failed', async () => {
    const mime = ctx.files[0]?.type
    const result = await runPdfWorkerOrThrow('jpgToPdf', ctx.files, { mime })
    if (!result.data) throw new Error('No output generated')
    return {
      success: true,
      message: 'Images converted to PDF',
      outputs: [{ name: 'images.pdf', data: result.data }],
    }
  })
}

export async function runPasswordProtect(ctx: ToolContext): Promise<ToolRunnerResult> {
  return runToolRunner('Password protect failed', async () => {
    const result = await runPdfWorkerOrThrow('passwordProtect', ctx.files, {
      userPassword: ctx.params.userPassword,
      ownerPassword: ctx.params.ownerPassword,
    })
    if (!result.data) throw new Error('No output generated')
    return {
      success: true,
      message: 'PDF password applied',
      outputs: [{ name: `protected_${ctx.files[0].name}`, data: result.data }],
    }
  })
}

export async function runPdfToWord(ctx: ToolContext): Promise<ToolRunnerResult> {
  return runToolRunner('Conversion failed', async () => {
    const blob = await postFile({
      apiUrl: ctx.apiUrl,
      endpoint: API.paths.pdfToWord,
      file: ctx.files[0],
    })
    return {
      success: true,
      message: 'PDF converted to Word',
      outputs: [
        await blobToOutput(`${baseName(ctx.files[0].name)}.docx`, blob, MIME.docx),
      ],
    }
  })
}

export async function runOcr(ctx: ToolContext): Promise<ToolRunnerResult> {
  return runToolRunner('OCR failed', async () => {
    const blob = await postFile({
      apiUrl: ctx.apiUrl,
      endpoint: API.paths.ocr,
      file: ctx.files[0],
      params: { language: ctx.params.language ?? 'eng' },
    })
    return {
      success: true,
      message: 'OCR completed',
      outputs: [await blobToOutput(`ocr_${ctx.files[0].name}`, blob, MIME.pdf)],
    }
  })
}

export async function runDeepCompress(ctx: ToolContext): Promise<ToolRunnerResult> {
  return runToolRunner('Compression failed', async () => {
    const blob = await postFile({
      apiUrl: ctx.apiUrl,
      endpoint: API.paths.compress,
      file: ctx.files[0],
    })
    return {
      success: true,
      message: 'PDF compressed',
      outputs: [await blobToOutput(`compressed_${ctx.files[0].name}`, blob, MIME.pdf)],
    }
  })
}
