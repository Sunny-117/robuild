import type { RobuildPlugin, ShimsConfig } from '../types'

/**
 * Default shims configuration
 */
export const DEFAULT_SHIMS_CONFIG: Required<ShimsConfig> = {
  dirname: true,
  require: true,
  exports: true,
  env: false,
}

/**
 * Node.js globals shim for ESM
 */
export const NODE_GLOBALS_SHIM = `
// Node.js globals shim for ESM
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createRequire } from 'node:module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
`

/**
 * Process.env shim for browser
 */
export const PROCESS_ENV_SHIM = `
// Process.env shim for browser
if (typeof process === 'undefined') {
  globalThis.process = {
    env: {},
    platform: 'browser',
    version: '0.0.0',
    versions: { node: '0.0.0' }
  }
}
`

/**
 * Module.exports shim for ESM
 */
export const MODULE_EXPORTS_SHIM = `
// Module.exports shim for ESM
if (typeof module === 'undefined') {
  globalThis.module = { exports: {} }
}
if (typeof exports === 'undefined') {
  globalThis.exports = module.exports
}
`

/**
 * Detect if code needs specific shims
 */
export function detectShimNeeds(code: string): {
  needsDirname: boolean
  needsRequire: boolean
  needsExports: boolean
  needsEnv: boolean
} {
  // Remove comments and strings to avoid false positives
  const cleanCode = removeCommentsAndStrings(code)

  const needsDirname = /\b__dirname\b/.test(cleanCode) || /\b__filename\b/.test(cleanCode)
  const needsRequire = /\brequire\s*\(/.test(cleanCode)
  const needsExports = /\bmodule\.exports\b/.test(cleanCode) || /\bexports\.\w+/.test(cleanCode)
  const needsEnv = /\bprocess\.env\b/.test(cleanCode)

  return {
    needsDirname,
    needsRequire,
    needsExports,
    needsEnv,
  }
}

/**
 * Remove comments and string literals from code
 */
function removeCommentsAndStrings(code: string): string {
  return code
    // Remove single-line comments
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove string literals
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, '\'\'')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
}

/**
 * Generate shims code based on configuration and needs
 */
export function generateShims(config: ShimsConfig, needs: ReturnType<typeof detectShimNeeds>): string {
  const shims: string[] = []

  if (config.dirname && needs.needsDirname) {
    shims.push(NODE_GLOBALS_SHIM)
  }
  else if (config.require && needs.needsRequire) {
    shims.push(`
// Require shim for ESM
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
`)
  }

  if (config.exports && needs.needsExports) {
    shims.push(MODULE_EXPORTS_SHIM)
  }

  if (config.env && needs.needsEnv) {
    shims.push(PROCESS_ENV_SHIM)
  }

  return shims.join('\n')
}

/**
 * Transform code to use shims
 */
export function transformWithShims(code: string, config: ShimsConfig): string {
  const needs = detectShimNeeds(code)
  const shims = generateShims(config, needs)

  if (!shims) {
    return code
  }

  return `${shims}\n${code}`
}

/**
 * Create shims plugin
 */
export function createShimsPlugin(config: boolean | ShimsConfig = true): RobuildPlugin {
  const shimsConfig: ShimsConfig = config === true
    ? DEFAULT_SHIMS_CONFIG
    : config === false
      ? { dirname: false, require: false, exports: false, env: false }
      : { ...DEFAULT_SHIMS_CONFIG, ...config }

  return {
    name: 'shims',
    transform: async (code: string, id: string) => {
      // Only process JavaScript/TypeScript files
      if (!/\.(js|mjs|cjs|ts|mts|cts|jsx|tsx)$/.test(id)) {
        return null
      }

      const needs = detectShimNeeds(code)

      // Skip if no shims are needed
      if (!needs.needsDirname && !needs.needsRequire && !needs.needsExports && !needs.needsEnv) {
        return null
      }

      const transformedCode = transformWithShims(code, shimsConfig)

      return transformedCode !== code ? transformedCode : null
    },
  }
}

/**
 * Create browser-specific shims plugin
 */
export function createBrowserShimsPlugin(): RobuildPlugin {
  return {
    name: 'browser-shims',
    transform: async (code: string, id: string) => {
      // Only process JavaScript files for browser
      if (!/\.(js|mjs|jsx|tsx?)$/.test(id)) {
        return null
      }

      const needs = detectShimNeeds(code)

      if (needs.needsEnv) {
        return `${PROCESS_ENV_SHIM}\n${code}`
      }

      return null
    },
  }
}

/**
 * Create Node.js-specific shims plugin
 */
export function createNodeShimsPlugin(): RobuildPlugin {
  return {
    name: 'node-shims',
    transform: async (code: string, id: string) => {
      // Only process ES modules for Node.js
      if (!/\.mjs$/.test(id) && !/\.js$/.test(id)) {
        return null
      }

      const needs = detectShimNeeds(code)
      const shims: string[] = []

      if (needs.needsDirname || needs.needsRequire) {
        shims.push(NODE_GLOBALS_SHIM)
      }

      if (needs.needsExports) {
        shims.push(MODULE_EXPORTS_SHIM)
      }

      if (shims.length === 0) {
        return null
      }

      return `${shims.join('\n')}\n${code}`
    },
  }
}

/**
 * Analyze shim requirements for a codebase
 */
export function analyzeShimRequirements(codes: string[]): {
  totalFiles: number
  filesNeedingShims: number
  shimTypes: {
    dirname: number
    require: number
    exports: number
    env: number
  }
  recommendations: ShimsConfig
} {
  const shimTypes = { dirname: 0, require: 0, exports: 0, env: 0 }
  let filesNeedingShims = 0

  for (const code of codes) {
    const needs = detectShimNeeds(code)
    let fileNeedsShims = false

    if (needs.needsDirname) {
      shimTypes.dirname++
      fileNeedsShims = true
    }
    if (needs.needsRequire) {
      shimTypes.require++
      fileNeedsShims = true
    }
    if (needs.needsExports) {
      shimTypes.exports++
      fileNeedsShims = true
    }
    if (needs.needsEnv) {
      shimTypes.env++
      fileNeedsShims = true
    }

    if (fileNeedsShims) {
      filesNeedingShims++
    }
  }

  const totalFiles = codes.length
  const threshold = Math.ceil(totalFiles * 0.1) // 10% threshold

  const recommendations: ShimsConfig = {
    dirname: shimTypes.dirname >= threshold,
    require: shimTypes.require >= threshold,
    exports: shimTypes.exports >= threshold,
    env: shimTypes.env >= threshold,
  }

  return {
    totalFiles,
    filesNeedingShims,
    shimTypes,
    recommendations,
  }
}

/**
 * Get platform-specific shims configuration
 */
export function getPlatformShimsConfig(platform: 'browser' | 'node' | 'neutral'): ShimsConfig {
  switch (platform) {
    case 'browser':
      return {
        dirname: false,
        require: false,
        exports: false,
        env: true,
      }

    case 'node':
      return {
        dirname: true,
        require: true,
        exports: true,
        env: false,
      }

    case 'neutral':
    default:
      return {
        dirname: false,
        require: false,
        exports: false,
        env: false,
      }
  }
}
