import type { ModuleFormat } from 'rolldown'
import type { OutExtensionFactory, Platform } from '../types'

/**
 * Get file extension for a given format (with leading dot).
 * This is the unified function used by bundle, watch, and transform modes.
 *
 * @param format - The module format (es, cjs, iife, umd, etc.)
 * @param platform - The target platform
 * @param fixedExtension - Whether to force .cjs/.mjs extensions
 * @returns The file extension with leading dot (e.g., '.mjs', '.cjs', '.js')
 */
export function getFormatExtension(
  format: ModuleFormat | string,
  platform: Platform = 'node',
  fixedExtension = false,
): string {
  if (fixedExtension) {
    return format === 'cjs' || format === 'commonjs' ? '.cjs' : '.mjs'
  }

  switch (format) {
    case 'es':
    case 'esm':
    case 'module':
      return '.mjs' // Always use .mjs for ESM to be explicit about module type
    case 'cjs':
    case 'commonjs':
      return platform === 'node' ? '.cjs' : '.js'
    case 'iife':
    case 'umd':
      return '.js'
    default:
      return '.js'
  }
}

/**
 * Resolve JavaScript output extension (without leading dot).
 * @deprecated Use getFormatExtension() instead for consistency
 */
export function resolveJsOutputExtension(
  format: ModuleFormat,
  platform: Platform = 'node',
  fixedExtension = false,
): string {
  if (fixedExtension) {
    return format === 'cjs' ? 'cjs' : 'mjs'
  }

  switch (format) {
    case 'es':
      return platform === 'browser' ? 'js' : 'mjs'
    case 'cjs':
      return platform === 'browser' ? 'js' : 'cjs'
    case 'iife':
    case 'umd':
      return 'js'
    default:
      return 'js'
  }
}

/**
 * Resolve DTS output extension
 */
export function resolveDtsOutputExtension(
  format: ModuleFormat,
  fixedExtension = false,
): string {
  if (fixedExtension) {
    return format === 'cjs' ? 'd.cts' : 'd.mts'
  }

  switch (format) {
    case 'es':
      return 'd.mts'
    case 'cjs':
      return 'd.cts'
    default:
      return 'd.ts'
  }
}

/**
 * Apply custom output extensions
 */
export function applyOutExtensions(
  format: ModuleFormat,
  outExtensions?: OutExtensionFactory,
): { js: string, dts: string } {
  const defaultJs = resolveJsOutputExtension(format)
  const defaultDts = resolveDtsOutputExtension(format)

  if (!outExtensions) {
    return { js: defaultJs, dts: defaultDts }
  }

  const custom = outExtensions(format)
  return {
    js: custom.js || defaultJs,
    dts: custom.dts || defaultDts,
  }
}

/**
 * Create filename with proper extension
 */
export function createFilename(
  basename: string,
  format: ModuleFormat,
  isDts = false,
  options: {
    platform?: Platform
    fixedExtension?: boolean
    outExtensions?: OutExtensionFactory
  } = {},
): string {
  const { platform, fixedExtension, outExtensions } = options

  if (outExtensions) {
    const extensions = applyOutExtensions(format, outExtensions)
    return `${basename}.${isDts ? extensions.dts : extensions.js}`
  }

  if (isDts) {
    return `${basename}.${resolveDtsOutputExtension(format, fixedExtension)}`
  }

  return `${basename}.${resolveJsOutputExtension(format, platform, fixedExtension)}`
}
