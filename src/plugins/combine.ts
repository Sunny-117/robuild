import type { RobuildPlugin } from '../types'

/**
 * Create a plugin that combines multiple plugins
 */
export function combinePlugins(...plugins: RobuildPlugin[]): RobuildPlugin {
  return {
    name: 'combined-plugin',
    setup: async (build) => {
      for (const plugin of plugins) {
        if (plugin.setup) {
          await plugin.setup(build)
        }
      }
    },
    buildStart: async (opts) => {
      for (const plugin of plugins) {
        if (plugin.buildStart) {
          await plugin.buildStart(opts)
        }
      }
    },
    buildEnd: async (error) => {
      for (const plugin of plugins) {
        if (plugin.buildEnd) {
          await plugin.buildEnd(error)
        }
      }
    },
    resolveId: async (id, importer) => {
      for (const plugin of plugins) {
        if (plugin.resolveId) {
          const result = await plugin.resolveId(id, importer)
          if (result)
            return result
        }
      }
      return null
    },
    load: async (id) => {
      for (const plugin of plugins) {
        if (plugin.load) {
          const result = await plugin.load(id)
          if (result)
            return result
        }
      }
      return null
    },
    transform: async (code, id) => {
      let currentCode = code
      for (const plugin of plugins) {
        if (plugin.transform) {
          const result = await plugin.transform(currentCode, id)
          if (result) {
            currentCode = typeof result === 'string' ? result : result.code
          }
        }
      }
      return currentCode !== code ? currentCode : null
    },
  }
}
