import type { ModuleFormat } from 'rolldown'
import type { OutExtensionFactory, Platform } from '../types'

/**
 * Resolve JavaScript output extension
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
