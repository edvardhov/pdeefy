import { toast } from 'sonner'
import { postFile } from '@/lib/api'
import { baseName } from '@/lib/download'
import { runPdfWorkerOrThrow } from '@/lib/workerClient'
import type { ToolContext, ToolRunnerResult } from '@/features/types'

export async function notImplementedRunner(): Promise<ToolRunnerResult> {
  toast.info('This tool is coming soon.')
  return { success: false, message: 'Not implemented yet' }
}

export async function runMerge(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
    const result = await runPdfWorkerOrThrow('merge', ctx.files)
    if (!result.data) throw new Error('No output generated')
    return {
      success: true,
      outputs: [{ name: 'merged.pdf', data: result.data }],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Merge failed'
    toast.error(message)
    return { success: false, message }
  }
}

export async function runSplit(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Split failed'
    toast.error(message)
    return { success: false, message }
  }
}

export async function runRotate(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
    const angle = Number.parseInt(ctx.params.angle ?? '90', 10) as 90 | 180 | 270
    const result = await runPdfWorkerOrThrow('rotate', ctx.files, { angle })
    if (!result.data) throw new Error('No output generated')
    return {
      success: true,
      outputs: [{ name: `rotated_${ctx.files[0].name}`, data: result.data }],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rotate failed'
    toast.error(message)
    return { success: false, message }
  }
}

export async function runJpgToPdf(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
    const mime = ctx.files[0]?.type
    const result = await runPdfWorkerOrThrow('jpgToPdf', ctx.files, { mime })
    if (!result.data) throw new Error('No output generated')
    return {
      success: true,
      message: 'Images converted to PDF',
      outputs: [{ name: 'images.pdf', data: result.data }],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversion failed'
    toast.error(message)
    return { success: false, message }
  }
}

export async function runPasswordProtect(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password protect failed'
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

export async function runPdfToWord(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
    const blob = await postFile({
      apiUrl: ctx.apiUrl,
      endpoint: '/api/convert/pdf-to-word',
      file: ctx.files[0],
    })
    return {
      success: true,
      message: 'PDF converted to Word',
      outputs: [
        await blobToOutput(
          `${baseName(ctx.files[0].name)}.docx`,
          blob,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversion failed'
    toast.error(message)
    return { success: false, message }
  }
}

export async function runOcr(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
    const blob = await postFile({
      apiUrl: ctx.apiUrl,
      endpoint: '/api/ocr',
      file: ctx.files[0],
      params: { language: ctx.params.language ?? 'eng' },
    })
    return {
      success: true,
      message: 'OCR completed',
      outputs: [
        await blobToOutput(`ocr_${ctx.files[0].name}`, blob, 'application/pdf'),
      ],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OCR failed'
    toast.error(message)
    return { success: false, message }
  }
}

export async function runDeepCompress(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
    const blob = await postFile({
      apiUrl: ctx.apiUrl,
      endpoint: '/api/edit/compress',
      file: ctx.files[0],
    })
    return {
      success: true,
      message: 'PDF compressed',
      outputs: [
        await blobToOutput(`compressed_${ctx.files[0].name}`, blob, 'application/pdf'),
      ],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Compression failed'
    toast.error(message)
    return { success: false, message }
  }
}
