import type { RobuildPlugin } from '../types'
import { createGlobImportPlugin } from '../features/glob-import'

/**
 * Built-in plugin for JSON imports
 */
export function jsonPlugin(): RobuildPlugin {
  return {
    name: 'json',
    load: async (id: string) => {
      if (id.endsWith('.json')) {
        try {
          const { readFile } = await import('node:fs/promises')
          const content = await readFile(id, 'utf-8')
          return `export default ${content}`
        }
        catch (error) {
          console.error(`Failed to load JSON file ${id}:`, error)
          return null
        }
      }
      return null
    },
  }
}

/**
 * Built-in plugin for CSS imports
 */
export function cssPlugin(): RobuildPlugin {
  return {
    name: 'css',
    load: async (id: string) => {
      if (id.endsWith('.css')) {
        try {
          const { readFile } = await import('node:fs/promises')
          const content = await readFile(id, 'utf-8')
          // Simple CSS-in-JS transformation
          return `
const css = ${JSON.stringify(content)};
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}
export default css;
`
        }
        catch (error) {
          console.error(`Failed to load CSS file ${id}:`, error)
          return null
        }
      }
      return null
    },
  }
}

/**
 * Built-in plugin for text file imports
 */
export function textPlugin(extensions: string[] = ['.txt', '.md']): RobuildPlugin {
  return {
    name: 'text',
    load: async (id: string) => {
      if (extensions.some(ext => id.endsWith(ext))) {
        try {
          const { readFile } = await import('node:fs/promises')
          const content = await readFile(id, 'utf-8')
          return `export default ${JSON.stringify(content)}`
        }
        catch (error) {
          console.error(`Failed to load text file ${id}:`, error)
          return null
        }
      }
      return null
    },
  }
}

/**
 * Built-in plugin for URL imports (assets)
 */
export function urlPlugin(extensions: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']): RobuildPlugin {
  return {
    name: 'url',
    load: async (id: string) => {
      if (extensions.some(ext => id.endsWith(ext))) {
        // In a real implementation, you might copy the file to output directory
        // and return the public URL
        const { basename } = await import('node:path')
        const filename = basename(id)
        return `export default "./${filename}"`
      }
      return null
    },
  }
}

/**
 * Built-in plugin for environment variable replacement
 */
export function envPlugin(prefix: string = 'VITE_'): RobuildPlugin {
  return {
    name: 'env',
    transform: async (code: string, id: string) => {
      // Replace process.env.VARIABLE with actual values
      const envRegex = new RegExp(`process\\.env\\.(${prefix}\\w+)`, 'g')

      let hasReplacements = false
      const transformedCode = code.replace(envRegex, (match, varName) => {
        hasReplacements = true
        const value = process.env[varName]
        return value !== undefined ? JSON.stringify(value) : 'undefined'
      })

      return hasReplacements ? transformedCode : null
    },
  }
}

/**
 * Built-in plugin for import alias resolution
 */
export function aliasPlugin(aliases: Record<string, string>): RobuildPlugin {
  return {
    name: 'alias',
    resolveId: async (id: string, importer?: string) => {
      for (const [alias, replacement] of Object.entries(aliases)) {
        if (id === alias || id.startsWith(`${alias}/`)) {
          const resolved = id.replace(alias, replacement)
          return resolved
        }
      }
      return null
    },
  }
}

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

/**
 * Built-in plugin for TypeScript path mapping
 */
export function tsconfigPathsPlugin(tsconfig?: any): RobuildPlugin {
  return {
    name: 'tsconfig-paths',
    resolveId: async (id: string, importer?: string) => {
      if (!tsconfig?.compilerOptions?.paths) {
        return null
      }

      const { resolve, dirname } = await import('node:path')
      const paths = tsconfig.compilerOptions.paths
      const baseUrl = tsconfig.compilerOptions.baseUrl || '.'

      for (const [pattern, mappings] of Object.entries(paths)) {
        const regex = new RegExp(`^${pattern.replace('*', '(.*)')}$`)
        const match = id.match(regex)

        if (match) {
          for (const mapping of mappings as string[]) {
            const resolved = mapping.replace('*', match[1] || '')
            const fullPath = resolve(baseUrl, resolved)

            try {
              // Check if file exists (simplified)
              return fullPath
            }
            catch {
              continue
            }
          }
        }
      }

      return null
    },
  }
}

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

/**
 * Get all built-in plugins
 */
export function getBuiltinPlugins(): Record<string, () => RobuildPlugin> {
  return {
    json: jsonPlugin,
    css: cssPlugin,
    text: textPlugin,
    url: urlPlugin,
    env: envPlugin,
    alias: aliasPlugin,
    virtual: virtualPlugin,
    tsconfigPaths: tsconfigPathsPlugin,
    nodePolyfills: nodePolyfillsPlugin,
  }
}

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
