/** Parse page ranges like "1-3,5,7-9" into 0-based page index groups. */
export function parseRanges(input: string, pageCount: number): number[][] {
  const groups: number[][] = []
  const parts = input.split(',').map((part) => part.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-')
      const start = Math.max(1, Number.parseInt(startRaw, 10))
      const end = Math.min(pageCount, Number.parseInt(endRaw, 10))
      if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
        throw new Error(`Invalid page range: ${part}`)
      }
      groups.push(Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i))
    } else {
      const page = Number.parseInt(part, 10)
      if (Number.isNaN(page) || page < 1 || page > pageCount) {
        throw new Error(`Invalid page number: ${part}`)
      }
      groups.push([page - 1])
    }
  }

  if (groups.length === 0) {
    throw new Error('Provide at least one page range, e.g. 1-3,5,7-9')
  }

  return groups
}

/** Parse a page list like "1,3,5-7" into unique 1-based page numbers. */
export function parsePageList(input: string, pageCount: number): number[] {
  const pages = new Set<number>()
  const parts = input.split(',').map((part) => part.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-')
      const start = Number.parseInt(startRaw, 10)
      const end = Number.parseInt(endRaw, 10)
      if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
        throw new Error(`Invalid page range: ${part}`)
      }
      for (let page = start; page <= end; page++) {
        if (page < 1 || page > pageCount) {
          throw new Error(`Invalid page number: ${page}`)
        }
        pages.add(page)
      }
    } else {
      const page = Number.parseInt(part, 10)
      if (Number.isNaN(page) || page < 1 || page > pageCount) {
        throw new Error(`Invalid page number: ${part}`)
      }
      pages.add(page)
    }
  }

  if (pages.size === 0) {
    throw new Error('Provide at least one page number, e.g. 1,3,5-7')
  }

  return [...pages].sort((a, b) => a - b)
}

/** Flatten range groups into a single ordered list of unique 0-based indices. */
export function flattenRangeIndices(groups: number[][]): number[] {
  const seen = new Set<number>()
  const indices: number[] = []
  for (const group of groups) {
    for (const index of group) {
      if (!seen.has(index)) {
        seen.add(index)
        indices.push(index)
      }
    }
  }
  return indices
}
