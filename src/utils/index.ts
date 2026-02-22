import { readdirSync, readFileSync, statSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { minify } from 'oxc-minify'

// Re-export utilities from submodules
export * from './extensions'
export * from './hash'
export * from './node-protocol'

/**
 * Normalize a path to an absolute path.
 * Handles string paths, URL objects, and undefined values.
 *
 * @param path - The path to normalize (string, URL, or undefined)
 * @param resolveFrom - The base directory to resolve relative paths from
 * @returns The normalized absolute path
 */
export function normalizePath(path: string | URL | undefined, resolveFrom?: string): string {
  return typeof path === 'string' && isAbsolute(path)
    ? path
    : path instanceof URL
      ? fileURLToPath(path)
      : resolve(resolveFrom || '.', path || '.')
}

export function fmtPath(path: string): string {
  return resolve(path).replace(process.cwd(), '.')
}

export function analyzeDir(dir: string | string[]): {
  size: number
  files: number
} {
  if (Array.isArray(dir)) {
    let totalSize = 0
    let totalFiles = 0
    for (const d of dir) {
      const { size, files } = analyzeDir(d)
      totalSize += size
      totalFiles += files
    }
    return { size: totalSize, files: totalFiles }
  }

  let totalSize = 0

  try {
    const files = readdirSync(dir, { withFileTypes: true, recursive: true })

    for (const file of files) {
      const fullPath = join(file.parentPath, file.name)
      if (file.isFile()) {
        const { size } = statSync(fullPath)
        totalSize += size
      }
    }

    return { size: totalSize, files: files.length }
  }
  catch (error: any) {
    // If directory doesn't exist or can't be read, return zero
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return { size: 0, files: 0 }
    }
    throw error
  }
}

/**
 * Calculate size metrics for a built file.
 * Reads the file directly from disk instead of rebuilding with rolldown.
 *
 * @param dir - The output directory
 * @param entry - The entry filename
 * @returns Size metrics (raw, minified, gzipped)
 */
export async function distSize(
  dir: string,
  entry: string,
): Promise<{
  size: number
  minSize: number
  minGzipSize: number
}> {
  const filePath = join(dir, entry)
  const code = readFileSync(filePath, 'utf-8')

  const { code: minified } = await minify(entry, code)

  return {
    size: Buffer.byteLength(code),
    minSize: Buffer.byteLength(minified),
    minGzipSize: gzipSync(minified).length,
  }
}

/**
 * Calculate side effect size.
 * For now, returns 0 as calculating true side effects requires complex analysis.
 * This avoids the expensive rolldown rebuild that was causing performance issues.
 *
 * @param _dir - The output directory (unused)
 * @param _entry - The entry filename (unused)
 * @returns Side effect size (always 0 for now)
 */
export async function sideEffectSize(
  _dir: string,
  _entry: string,
): Promise<number> {
  // Skip side effect calculation to improve performance
  // The previous implementation was calling rolldown again which was very slow
  return 0
}
