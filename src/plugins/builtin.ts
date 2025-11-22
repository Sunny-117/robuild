import type { RobuildPlugin } from '../types'
import { cssPlugin, urlPlugin } from './assets'
import { textPlugin } from './data'
import { nodePolyfillsPlugin } from './environment'
import { virtualPlugin } from './resolution'

// Re-export all plugins from the new organized structure
export * from './assets'
export * from './build'
export * from './data'
export * from './environment'
export * from './resolution'
export * from './utils'

/**
 * Get all built-in plugins
 */
export function getBuiltinPlugins(): Record<string, () => RobuildPlugin> {
  return {
    css: cssPlugin,
    text: textPlugin,
    url: urlPlugin,
    virtual: () => virtualPlugin({}),
    nodePolyfills: nodePolyfillsPlugin,
  }
}
