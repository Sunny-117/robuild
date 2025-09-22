import { relative } from 'node:path'
import { minimatch } from 'minimatch'

/**
 * Default patterns to ignore in watch mode
 */
export const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/.DS_Store',
  '**/Thumbs.db',
  '**/*.log',
  '**/coverage/**',
  '**/.nyc_output/**',
  '**/.cache/**',
  '**/tmp/**',
  '**/temp/**',
]

/**
 * Check if a file path should be ignored in watch mode
 */
export function shouldIgnoreFile(
  filePath: string,
  cwd: string,
  ignorePatterns: string[] = [],
): boolean {
  const relativePath = relative(cwd, filePath)
  const allPatterns = [...DEFAULT_IGNORE_PATTERNS, ...ignorePatterns]

  return allPatterns.some((pattern) => {
    try {
      return minimatch(relativePath, pattern, { dot: true })
    }
    catch {
      // Invalid pattern, ignore it
      return false
    }
  })
}

/**
 * Filter file paths to exclude ignored files
 */
export function filterIgnoredFiles(
  filePaths: string[],
  cwd: string,
  ignorePatterns: string[] = [],
): string[] {
  return filePaths.filter(filePath =>
    !shouldIgnoreFile(filePath, cwd, ignorePatterns),
  )
}

/**
 * Create a file filter function for watch mode
 */
export function createWatchFilter(
  cwd: string,
  ignorePatterns: string[] = [],
): (filePath: string) => boolean {
  return (filePath: string) => !shouldIgnoreFile(filePath, cwd, ignorePatterns)
}

/**
 * Normalize ignore patterns
 */
export function normalizeIgnorePatterns(patterns: string[]): string[] {
  return patterns.map((pattern) => {
    // Ensure patterns are properly formatted
    if (pattern.startsWith('./')) {
      return pattern.slice(2)
    }
    if (pattern.startsWith('/')) {
      return pattern.slice(1)
    }
    return pattern
  })
}
