import type { RobuildPlugin } from '../types'

/**
 * Detect if a file uses CommonJS exports
 */
export function detectCommonJSExports(code: string): {
  hasModuleExports: boolean
  hasExportsAssignment: boolean
  hasDefaultExport: boolean
  hasNamedExports: boolean
} {
  // Remove comments and strings to avoid false positives
  const cleanCode = removeCommentsAndStrings(code)

  const hasModuleExports = /\bmodule\.exports\s*=/.test(cleanCode)
  const hasExportsAssignment = /\bexports\.\w+\s*=/.test(cleanCode)
  const hasDefaultExport = /\bexport\s+default\b/.test(cleanCode)
  const hasNamedExports = /\bexport\s+(?:const|let|var|function|class|\{)/.test(cleanCode)

  return {
    hasModuleExports,
    hasExportsAssignment,
    hasDefaultExport,
    hasNamedExports,
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
 * Transform CommonJS exports to ES modules
 */
export function transformCommonJSExports(code: string, mode: boolean | 'auto'): string {
  if (mode === false) {
    return code
  }

  const detection = detectCommonJSExports(code)

  // Auto mode: only transform if it's clearly CommonJS
  if (mode === 'auto') {
    if (!detection.hasModuleExports && !detection.hasExportsAssignment) {
      return code
    }
    if (detection.hasDefaultExport || detection.hasNamedExports) {
      return code // Already ES modules
    }
  }

  let transformedCode = code

  // Transform module.exports = ...
  transformedCode = transformedCode.replace(
    /\bmodule\.exports\s*=\s*([^;]+);?/g,
    (match, value) => {
      return `export default ${value.trim()};`
    },
  )

  // Transform exports.name = ...
  transformedCode = transformedCode.replace(
    /\bexports\.(\w+)\s*=\s*([^;]+);?/g,
    'export const $1 = $2;',
  )

  return transformedCode
}

/**
 * Transform ES modules to CommonJS
 */
export function transformESModulesToCommonJS(code: string): string {
  let transformedCode = code

  // Transform export default
  transformedCode = transformedCode.replace(
    /\bexport\s+default\s+([^;]+);?/g,
    'module.exports = $1;',
  )

  // Transform named exports
  transformedCode = transformedCode.replace(
    /\bexport\s+(?:const|let|var)\s+(\w+)\s*=\s*([^;]+);?/g,
    'const $1 = $2;\nexports.$1 = $1;',
  )

  // Transform export function/class
  transformedCode = transformedCode.replace(
    /\bexport\s+(function|class)\s+(\w+)/g,
    '$1 $2',
  )

  // Add exports assignment for functions/classes
  transformedCode = transformedCode.replace(
    /(function|class)\s+(\w+)/g,
    (match, type, name) => {
      if (transformedCode.includes(`export ${type} ${name}`)) {
        return `${match};\nexports.${name} = ${name};`
      }
      return match
    },
  )

  return transformedCode
}

/**
 * Add CommonJS compatibility wrapper
 */
export function addCommonJSWrapper(code: string, hasDefaultExport: boolean): string {
  if (!hasDefaultExport) {
    return code
  }

  return `${code}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = exports.default;
  Object.assign(module.exports, exports);
}`
}

/**
 * Create CJS default export handling plugin
 */
export function createCjsDefaultPlugin(mode: boolean | 'auto' = 'auto'): RobuildPlugin {
  return {
    name: 'cjs-default',
    transform: async (code: string, id: string) => {
      // Only process JavaScript/TypeScript files
      if (!/\.(?:js|mjs|cjs|ts|mts|cts|jsx|tsx)$/.test(id)) {
        return null
      }

      const detection = detectCommonJSExports(code)

      // Skip if no CommonJS patterns detected in auto mode
      if (mode === 'auto' && !detection.hasModuleExports && !detection.hasExportsAssignment) {
        return null
      }

      // Skip if already has ES module exports in auto mode
      if (mode === 'auto' && (detection.hasDefaultExport || detection.hasNamedExports)) {
        return null
      }

      const transformedCode = transformCommonJSExports(code, mode)

      return transformedCode !== code ? transformedCode : null
    },
  }
}

/**
 * Create CommonJS interop plugin for better compatibility
 */
export function createCommonJSInteropPlugin(): RobuildPlugin {
  return {
    name: 'cjs-interop',
    transform: async (code: string, id: string) => {
      // Only process JavaScript files
      if (!/\.(?:js|mjs|cjs)$/.test(id)) {
        return null
      }

      // Add __esModule marker for better interop
      if (code.includes('export default') || code.includes('export ')) {
        return `${code}

// ES Module interop
if (typeof exports === 'object' && typeof module !== 'undefined') {
  Object.defineProperty(exports, '__esModule', { value: true });
}`
      }

      return null
    },
  }
}

/**
 * Analyze module format
 */
export function analyzeModuleFormat(code: string): {
  format: 'cjs' | 'esm' | 'mixed' | 'unknown'
  confidence: number
} {
  const detection = detectCommonJSExports(code)

  const cjsScore = (detection.hasModuleExports ? 2 : 0) + (detection.hasExportsAssignment ? 1 : 0)
  const esmScore = (detection.hasDefaultExport ? 2 : 0) + (detection.hasNamedExports ? 1 : 0)

  if (cjsScore > 0 && esmScore > 0) {
    return { format: 'mixed', confidence: Math.min(cjsScore, esmScore) / 3 }
  }

  if (cjsScore > esmScore) {
    return { format: 'cjs', confidence: cjsScore / 3 }
  }

  if (esmScore > cjsScore) {
    return { format: 'esm', confidence: esmScore / 3 }
  }

  return { format: 'unknown', confidence: 0 }
}

/**
 * Get recommended CJS default mode based on code analysis
 */
export function getRecommendedCjsDefaultMode(code: string): boolean | 'auto' {
  const analysis = analyzeModuleFormat(code)

  if (analysis.format === 'cjs' && analysis.confidence > 0.5) {
    return true
  }

  if (analysis.format === 'esm' && analysis.confidence > 0.5) {
    return false
  }

  return 'auto'
}
