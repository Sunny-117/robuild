import type { RobuildPlugin } from '../../types'

/**
 * Built-in plugin for virtual modules
 */
export function virtualPlugin(modules: Record<string, string>): RobuildPlugin {
  return {
    name: 'virtual',
    resolveId: async (id: string) => {
      // Check if this is a virtual module we know about
      if (modules[id]) {
        return id
      }
      return null
    },
    load: async (id: string) => {
      // Load the virtual module content
      if (modules[id]) {
        return modules[id]
      }
      return null
    },
  }
}
