import { useCallback, useEffect, useState } from 'react'
import type { ToolRunnerResult } from '@/features/types'

export function useToolResultCache(inputFingerprint: string, enabled: boolean) {
  const [cachedResult, setCachedResult] = useState<ToolRunnerResult | null>(null)
  const [cachedFingerprint, setCachedFingerprint] = useState<string | null>(null)
  const [resultModalOpen, setResultModalOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    if (cachedFingerprint !== null && cachedFingerprint !== inputFingerprint) {
      setCachedResult(null)
      setCachedFingerprint(null)
      setResultModalOpen(false)
    }
  }, [inputFingerprint, cachedFingerprint, enabled])

  const hasValidCache =
    enabled &&
    cachedResult?.outputs != null &&
    cachedResult.outputs.length > 0 &&
    cachedFingerprint === inputFingerprint

  const cacheResult = useCallback((result: ToolRunnerResult, fingerprint: string) => {
    setCachedResult(result)
    setCachedFingerprint(fingerprint)
  }, [])

  const clearCache = useCallback(() => {
    setCachedResult(null)
    setCachedFingerprint(null)
    setResultModalOpen(false)
  }, [])

  return {
    cachedResult,
    hasValidCache,
    cacheResult,
    clearCache,
    resultModalOpen,
    setResultModalOpen,
  }
}
