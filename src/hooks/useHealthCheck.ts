import { useEffect } from 'react'
import { checkHealth } from '@/lib/api'
import { API } from '@/constants/api'
import { useAppStore } from '@/store/appStore'

export function useHealthCheck() {
  const apiUrl = useAppStore((s) => s.apiUrl)
  const setBackendConnected = useAppStore((s) => s.setBackendConnected)

  useEffect(() => {
    let cancelled = false

    async function runCheck() {
      const connected = await checkHealth(apiUrl)
      if (!cancelled) {
        setBackendConnected(connected)
      }
    }

    void runCheck()
    const interval = setInterval(runCheck, API.HEALTH_POLL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [apiUrl, setBackendConnected])
}

export async function testConnection(apiUrl: string): Promise<boolean> {
  return checkHealth(apiUrl)
}
