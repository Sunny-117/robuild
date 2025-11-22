import { createHash } from 'node:crypto'

/**
 * Generate content hash for filename
 */
export function generateContentHash(content: string, length = 8): string {
  return createHash('sha256')
    .update(content)
    .digest('hex')
    .slice(0, length)
}

/**
 * Add hash to filename
 */
export function addHashToFilename(
  filename: string,
  content: string,
  hashLength = 8,
): string {
  const hash = generateContentHash(content, hashLength)
  const dotIndex = filename.lastIndexOf('.')

  if (dotIndex === -1) {
    return `${filename}-${hash}`
  }

  const name = filename.slice(0, dotIndex)
  const ext = filename.slice(dotIndex)
  return `${name}-${hash}${ext}`
}

/**
 * Check if filename already has hash
 */
export function hasHash(filename: string): boolean {
  // Simple check for hash pattern: -[8 hex chars]
  return /-[a-f0-9]{8}(?:\.|$)/.test(filename)
}
