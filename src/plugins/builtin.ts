import type { RobuildPlugin } from '../types'
import { cssPlugin } from './css'
import { nodePolyfillsPlugin } from './node-polyfills'
import { textPlugin } from './text'
import { urlPlugin } from './url'
import { virtualPlugin } from './virtual'

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
