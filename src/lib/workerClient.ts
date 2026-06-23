import type { WorkerOp, WorkerRequest, WorkerResponse } from '@/workers/types'

let worker: Worker | null = null
const pending = new Map<
  string,
  {
    resolve: (value: WorkerResponse) => void
    reject: (reason: Error) => void
  }
>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data
      const entry = pending.get(response.id)
      if (!entry) return
      pending.delete(response.id)
      entry.resolve(response)
    }
    worker.onerror = (event) => {
      for (const [, entry] of pending) {
        entry.reject(new Error(event.message || 'Worker crashed'))
      }
      pending.clear()
      worker?.terminate()
      worker = null
    }
  }
  return worker
}

function createId(): string {
  return crypto.randomUUID()
}

async function readFiles(files: File[]): Promise<Uint8Array[]> {
  return Promise.all(files.map((file) => file.arrayBuffer().then((buf) => new Uint8Array(buf))))
}

export async function runPdfWorker(
  op: WorkerOp,
  files: File[],
  params?: Record<string, unknown>,
): Promise<WorkerResponse> {
  const id = createId()
  const fileBytes = await readFiles(files)

  const request: WorkerRequest = { id, op, files: fileBytes, params }

  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    getWorker().postMessage(request)
  })
}

export async function runPdfWorkerOrThrow(
  op: WorkerOp,
  files: File[],
  params?: Record<string, unknown>,
): Promise<WorkerResponse & { ok: true }> {
  const response = await runPdfWorker(op, files, params)
  if (!response.ok) {
    throw new Error(response.error)
  }
  return response
}
