export function computeRunFingerprint(
  files: File[],
  params: Record<string, string>,
): string {
  const filePart = files
    .map((file) => `${file.name}:${file.size}:${file.lastModified}`)
    .join('|')
  const paramPart = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key] ?? ''}`)
    .join('&')
  return `${filePart}::${paramPart}`
}
