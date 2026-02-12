import type { RobuildPlugin } from '../../types'

/**
 * Create skip node_modules plugin
 */
export function createSkipNodeModulesPlugin(options?: {
  noExternal?: (string | RegExp)[]
}): RobuildPlugin {
  const noExternalPatterns = options?.noExternal || []

  // Helper function to check if a module should be inlined
  const shouldInline = (id: string): boolean => {
    for (const pattern of noExternalPatterns) {
      if (typeof pattern === 'string') {
        if (id === pattern || id.startsWith(`${pattern}/`)) {
          return true
        }
      }
      else if (pattern instanceof RegExp) {
        if (pattern.test(id)) {
          return true
        }
      }
    }
    return false
  }

  return {
    name: 'skip-node-modules',
    resolveId: async (id: string, importer?: string) => {
      // Always inline modules matching noExternal patterns
      if (shouldInline(id)) {
        return null
      }

      // Don't externalize entry files (when importer is undefined)
      if (!importer) {
        return null
      }

      // Skip resolution for node_modules dependencies
      if (id.includes('node_modules') || (!id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\\'))) {
        return { id, external: true } as any
      }
      return null
    },
  }
}
