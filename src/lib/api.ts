import { API } from '@/constants/api'

export interface HealthResponse {
  status: string
  version?: string
}

export async function checkHealth(apiUrl: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API.HEALTH_TIMEOUT_MS)

  try {
    const response = await fetch(`${apiUrl}${API.paths.health}`, {
      signal: controller.signal,
    })
    if (!response.ok) return false
    const data = (await response.json()) as HealthResponse
    return data.status === API.HEALTH_STATUS_OK
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

export interface PostFileOptions {
  endpoint: string
  file: File
  params?: Record<string, string>
  apiUrl: string
}

export async function postFile({
  endpoint,
  file,
  params = {},
  apiUrl,
}: PostFileOptions): Promise<Blob> {
  const formData = new FormData()
  formData.append('file', file)

  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value)
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const errorBody = (await response.json()) as { detail?: string }
      if (errorBody.detail) message = errorBody.detail
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  return response.blob()
}
