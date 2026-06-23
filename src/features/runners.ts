import { toast } from 'sonner'
import { postFile } from '@/lib/api'
import { baseName, downloadBlob, downloadBytes, downloadMultiple } from '@/lib/download'
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
    downloadBytes(result.data, 'merged.pdf')
    toast.success('PDFs merged successfully')
    return { success: true }
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
    await downloadMultiple(result.outputs, `${baseFilename}_splits.zip`)
    toast.success('PDF split successfully')
    return { success: true }
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
    downloadBytes(result.data, `rotated_${ctx.files[0].name}`)
    toast.success('PDF rotated successfully')
    return { success: true }
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
    downloadBytes(result.data, 'images.pdf')
    toast.success('Images converted to PDF')
    return { success: true }
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
    downloadBytes(result.data, `protected_${ctx.files[0].name}`)
    toast.success('PDF password applied')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password protect failed'
    toast.error(message)
    return { success: false, message }
  }
}

export async function runPdfToWord(ctx: ToolContext): Promise<ToolRunnerResult> {
  try {
    const blob = await postFile({
      apiUrl: ctx.apiUrl,
      endpoint: '/api/convert/pdf-to-word',
      file: ctx.files[0],
    })
    downloadBlob(blob, `${baseName(ctx.files[0].name)}.docx`)
    toast.success('PDF converted to Word')
    return { success: true }
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
    downloadBlob(blob, `ocr_${ctx.files[0].name}`)
    toast.success('OCR completed')
    return { success: true }
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
    downloadBlob(blob, `compressed_${ctx.files[0].name}`)
    toast.success('PDF compressed')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Compression failed'
    toast.error(message)
    return { success: false, message }
  }
}
