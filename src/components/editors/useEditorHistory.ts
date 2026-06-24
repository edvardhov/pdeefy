import { useCallback, useMemo, useState } from 'react'
import type { Annotation } from '@/features/client/editorTypes'

const MAX_HISTORY = 100

function cloneAnnotations(annotations: Annotation[]): Annotation[] {
  return annotations.map((annotation) => {
    if (annotation.type === 'image') {
      return { ...annotation, imageBytes: new Uint8Array(annotation.imageBytes) }
    }
    return { ...annotation, cover: annotation.cover ? { ...annotation.cover } : undefined }
  })
}

interface HistoryState {
  entries: Annotation[][]
  index: number
}

export function useEditorHistory(initial: Annotation[] = []) {
  const [state, setState] = useState<HistoryState>({
    entries: [cloneAnnotations(initial)],
    index: 0,
  })

  const annotations = state.entries[state.index] ?? []

  const push = useCallback((next: Annotation[] | ((prev: Annotation[]) => Annotation[])) => {
    setState((prev) => {
      const current = prev.entries[prev.index] ?? []
      const resolved = typeof next === 'function' ? next(current) : next
      const cloned = cloneAnnotations(resolved)
      const trimmed = prev.entries.slice(0, prev.index + 1)
      const entries = [...trimmed, cloned].slice(-MAX_HISTORY)
      return { entries, index: entries.length - 1 }
    })
  }, [])

  const replace = useCallback((next: Annotation[]) => {
    setState({ entries: [cloneAnnotations(next)], index: 0 })
  }, [])

  const undo = useCallback(() => {
    setState((prev) => ({ ...prev, index: Math.max(0, prev.index - 1) }))
  }, [])

  const redo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index: Math.min(prev.entries.length - 1, prev.index + 1),
    }))
  }, [])

  const canUndo = state.index > 0
  const canRedo = state.index < state.entries.length - 1

  return useMemo(
    () => ({
      annotations,
      push,
      replace,
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [annotations, push, replace, undo, redo, canUndo, canRedo],
  )
}
