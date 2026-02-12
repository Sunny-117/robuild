import type { BundleEntry, TransformEntry } from '../types'
import { normalizePath } from '../utils/index'

/**
 * Parse a string entry format like "src/index.ts:dist" or "src/:dist"
 *
 * @param rawEntry - The raw string entry
 * @returns Parsed entry object
 */
export function parseEntryString(rawEntry: string): TransformEntry | BundleEntry {
  const [input, outDir] = rawEntry.split(':') as [string, string | undefined]

  if (input.endsWith('/')) {
    return {
      type: 'transform',
      input,
      outDir: outDir || 'dist',
    } as TransformEntry
  }

  return {
    type: 'bundle',
    input: input.includes(',') ? input.split(',') : input,
    outDir: outDir || 'dist',
  } as BundleEntry
}

/**
 * Normalize entry input paths to absolute paths.
 * Handles string, array, and object (named entries) formats.
 *
 * @param entryInput - The entry input (string, array, or object)
 * @param pkgDir - The package directory to resolve paths from
 * @returns Normalized input
 */
export function normalizeEntryInput(
  entryInput: string | string[] | Record<string, string>,
  pkgDir: string,
): string | string[] | Record<string, string> {
  if (typeof entryInput === 'object' && !Array.isArray(entryInput)) {
    // Handle object format (named entries)
    const normalizedInput: Record<string, string> = {}
    for (const [key, value] of Object.entries(entryInput)) {
      normalizedInput[key] = normalizePath(value, pkgDir)
    }
    return normalizedInput
  }

  if (Array.isArray(entryInput)) {
    return entryInput.map(p => normalizePath(p, pkgDir))
  }

  return normalizePath(entryInput, pkgDir)
}

/**
 * Get the entry input from a BundleEntry, supporting both 'input' and 'entry' fields.
 * This provides tsup compatibility.
 *
 * @param entry - The bundle entry
 * @returns The entry input or undefined
 */
export function getBundleEntryInput(
  entry: BundleEntry,
): string | string[] | Record<string, string> | undefined {
  return entry.input || entry.entry
}

/**
 * Check if an entry has valid input.
 *
 * @param entry - The entry to check
 * @returns true if the entry has valid input
 */
export function hasValidInput(entry: TransformEntry | BundleEntry): boolean {
  if (entry.type === 'transform') {
    return !!(entry as TransformEntry).input
  }
  return !!(getBundleEntryInput(entry as BundleEntry))
}
