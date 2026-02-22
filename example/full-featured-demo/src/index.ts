/**
 * Robuild Full-Featured Demo
 *
 * A comprehensive example showcasing robuild capabilities:
 * - Multiple output formats (ESM, CJS, IIFE)
 * - TypeScript with declaration generation
 * - Path aliases
 * - Custom loaders for assets
 * - Plugin architecture
 * - Virtual modules
 * - And more!
 */

// Re-export types
export type * from '@types'

// Re-export utilities
export * from '@utils'

// Re-export core
export * from './core'

// Import virtual module (provided by plugin)
// @ts-expect-error - virtual module
import { buildTime, nodeVersion, platform } from 'virtual:build-info'

// Version info
declare const __VERSION__: string
declare const __BUILD_TIME__: string
declare const __DEV__: boolean

export const VERSION: string = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0-dev'
export const BUILD_TIME: string = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : buildTime
export const IS_DEV: boolean = typeof __DEV__ !== 'undefined' ? __DEV__ : true

// Export build info from virtual module
export const buildInfo: {
  buildTime: string
  nodeVersion: string
  platform: string
} = {
  buildTime,
  nodeVersion,
  platform,
}

// Default export
const defaultExport: {
  VERSION: string
  BUILD_TIME: string
  IS_DEV: boolean
  buildInfo: typeof buildInfo
} = {
  VERSION,
  BUILD_TIME,
  IS_DEV,
  buildInfo,
}

export default defaultExport
