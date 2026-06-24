import { toast } from 'sonner'
import { MIME } from '@/constants/mime'
import { postFile } from '@/lib/api'
import {
  baseName,
  buildOutputName,
  buildZipName,
  resolveMimeForExt,
} from '@/lib/download'
import { runPdfWorkerOrThrow } from '@/lib/workerClient'
import { isSvgFile, svgToPngFile } from '@/lib/svgToPng'
import type { ToolContext, ToolDefinition, ToolRunnerResult } from '@/features/types'

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

function buildWorkerParams(
  tool: ToolDefinition,
  ctx: ToolContext,
  workerFiles: File[] = ctx.files,
): Record<string, unknown> {
  const params: Record<string, unknown> = { ...ctx.params }

  if (ctx.files[0]) {
    params.baseFilename = baseName(ctx.files[0].name)
    if (ctx.files[0].type) params.mime = ctx.files[0].type
  }

  if (tool.execution.kind === 'worker') {
    if (tool.execution.op === 'rotate') {
      params.angle = Number.parseInt(ctx.params.angle ?? '90', 10)
    }
    if (tool.execution.op === 'split') {
      params.mode = ctx.params.mode === 'pages' ? 'pages' : 'half'
    }
    if (tool.execution.op === 'watermark') {
      params.mode = ctx.params.mode === 'image' ? 'image' : 'text'
      params.opacity = Number.parseFloat(ctx.params.opacity ?? '0.3')
      params.fontSize = Number.parseInt(ctx.params.fontSize ?? '48', 10)
      params.imageScale =
        Number.parseFloat(ctx.params.imageScale ?? '35') / 100
      if (params.mode === 'image') {
        const imageFile = workerFiles[1] ?? ctx.auxFiles?.watermarkImage
        params.imageMime = imageFile?.type
        params.imageFilename = imageFile?.name
      }
    }
  }

  return params
}

async function prepareWorkerFiles(tool: ToolDefinition, ctx: ToolContext): Promise<File[]> {
  if (
    tool.execution.kind === 'worker' &&
    tool.execution.op === 'watermark' &&
    ctx.params.mode === 'image'
  ) {
    const imageFile = ctx.auxFiles?.watermarkImage
    if (!imageFile) {
      throw new Error('Watermark image is required')
    }

    const watermarkImage = isSvgFile(imageFile) ? await svgToPngFile(imageFile) : imageFile
    return [ctx.files[0], watermarkImage]
  }

  return ctx.files
}

async function runWorkerTool(
  tool: ToolDefinition,
  ctx: ToolContext,
): Promise<ToolRunnerResult> {
  if (tool.execution.kind !== 'worker') {
    throw new Error('Not a worker tool')
  }

  const { op, multiOutput } = tool.execution
  const workerFiles = await prepareWorkerFiles(tool, ctx)
  const result = await runPdfWorkerOrThrow(
    op,
    workerFiles,
    buildWorkerParams(tool, ctx, workerFiles),
  )
  const mimeType = tool.output.mimeType ?? MIME.pdf

  if (multiOutput && result.outputs?.length) {
    return {
      success: true,
      message: tool.output.successMessage,
      outputs: result.outputs.map((output) => ({
        name: output.name,
        data: output.data,
        mimeType,
      })),
      downloadZipName: buildZipName(ctx.files[0]?.name, tool.output.zipName),
    }
  }

  if (!result.data) {
    throw new Error('No output generated')
  }

  const name = buildOutputName(ctx.files[0]?.name, tool.output.naming)
  return {
    success: true,
    message: tool.output.successMessage,
    outputs: [
      {
        name,
        data: result.data,
        mimeType: tool.output.mimeType ?? resolveMimeForExt(name),
      },
    ],
  }
}

async function runBackendTool(
  tool: ToolDefinition,
  ctx: ToolContext,
): Promise<ToolRunnerResult> {
  if (tool.execution.kind !== 'backend') {
    throw new Error('Not a backend tool')
  }

  const params = { ...ctx.params }
  if (tool.id === 'pdf-to-jpg') params.format = 'jpg'
  if (tool.id === 'pdf-to-png') params.format = 'png'

  const blob = await postFile({
    apiUrl: ctx.apiUrl,
    endpoint: tool.execution.endpoint,
    file: ctx.files[0],
    params,
  })

  const name = buildOutputName(ctx.files[0]?.name, tool.output.naming)
  const mimeType = tool.output.mimeType ?? resolveMimeForExt(name)

  return {
    success: true,
    message: tool.output.successMessage,
    outputs: [
      {
        name,
        data: new Uint8Array(await blob.arrayBuffer()),
        mimeType,
      },
    ],
  }
}

export function resolveRunner(
  tool: ToolDefinition,
): (ctx: ToolContext) => Promise<ToolRunnerResult> {
  if (tool.execution.kind === 'editor') {
    return async () => ({ success: false, message: 'Use editor workspace' })
  }

  const label = tool.name

  if (tool.execution.kind === 'worker') {
    return (ctx) => runToolRunner(`${label} failed`, () => runWorkerTool(tool, ctx))
  }

  return (ctx) => runToolRunner(`${label} failed`, () => runBackendTool(tool, ctx))
}
