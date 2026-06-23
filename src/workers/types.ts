export type WorkerOp =
  | 'merge'
  | 'split'
  | 'rotate'
  | 'jpgToPdf'
  | 'passwordProtect'

export interface WorkerRequest {
  id: string
  op: WorkerOp
  files: Uint8Array[]
  params?: Record<string, unknown>
}

export interface WorkerSuccess {
  id: string
  ok: true
  data?: Uint8Array
  outputs?: Array<{ name: string; data: Uint8Array }>
}

export interface WorkerFailure {
  id: string
  ok: false
  error: string
}

export type WorkerResponse = WorkerSuccess | WorkerFailure
