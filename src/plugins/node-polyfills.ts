import type { RobuildPlugin } from '../types'

/**
 * Built-in plugin for Node.js polyfills
 */
export function nodePolyfillsPlugin(): RobuildPlugin {
  const polyfills: Record<string, string> = {
    path: 'path-browserify',
    fs: 'browserify-fs',
    crypto: 'crypto-browserify',
    stream: 'stream-browserify',
    buffer: 'buffer',
    process: 'process/browser',
    util: 'util',
    url: 'url',
    querystring: 'querystring-es3',
  }

  return {
    name: 'node-polyfills',
    resolveId: async (id: string) => {
      if (polyfills[id]) {
        return polyfills[id]
      }
      return null
    },
  }
}
