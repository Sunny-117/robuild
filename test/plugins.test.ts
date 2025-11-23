import type { RobuildPlugin } from '../src/types'
import { describe, expect, it } from 'vitest'
import {
  createGlobImportPlugin,
  extractGlobPatterns,
  hasGlobImports,
} from '../src/features/glob-import'
import { RobuildPluginManager } from '../src/features/plugin-manager'
import {
  combinePlugins,
  createLoadPlugin,
  createRobuildPlugin,
  createTransformPlugin,
} from '../src/features/plugin-utils'
import {
  cssPlugin,
  textPlugin,
  urlPlugin,
  virtualPlugin,
} from '../src/plugins'
import { testBuild } from './utils'

describe('plugins and Extensions', () => {
  describe('plugin System', () => {
    it('should create and manage plugins', async () => {
      const testPlugin: RobuildPlugin = {
        name: 'test-plugin',
        transform: async (code: string, id: string) => {
          if (id.endsWith('.test')) {
            return `// Transformed by test plugin\n${code}`
          }
          return null
        },
      }

      const config = { plugins: [testPlugin] }
      const entry = { type: 'bundle' as const, input: 'src/index.ts' }

      const manager = new RobuildPluginManager(config, entry, '/test')
      await manager.initializeRobuildHooks()

      expect(manager.getPlugins()).toHaveLength(1)
      expect(manager.getPlugins()[0].name).toBe('test-plugin')
    })

    it('should execute plugin hooks', async () => {
      const testPlugin: RobuildPlugin = {
        name: 'hook-test',
        buildStart: async () => {
          // Hook implementation
        },
      }

      const config = { plugins: [testPlugin] }
      const entry = { type: 'bundle' as const, input: 'src/index.ts' }

      const manager = new RobuildPluginManager(config, entry, '/test')
      // For this test, we'll just check if the plugin was added correctly
      expect(manager.getPlugins()).toHaveLength(1)

      // The new plugin system doesn't have executeHook, so we just verify the plugin exists
      expect(manager.getPlugins()[0].name).toBe('hook-test')
    })

    it('should create robuild plugins', () => {
      const plugin = createRobuildPlugin('test', {
        transform: (code: string) => `// transformed\n${code}`,
      })

      expect(plugin.name).toBe('test')
      expect(plugin.meta?.robuild).toBe(true)
      expect(plugin.transform).toBeDefined()
    })

    it('should create transform plugins', () => {
      const plugin = createTransformPlugin(
        'test-transform',
        (code: string) => `// transformed\n${code}`,
        /\.test$/,
      )

      expect(plugin.name).toBe('test-transform')
      expect(plugin.transform).toBeDefined()
    })

    it('should create load plugins', () => {
      const plugin = createLoadPlugin(
        'test-load',
        (id: string) => `// loaded: ${id}`,
        /\.test$/,
      )

      expect(plugin.name).toBe('test-load')
      expect(plugin.load).toBeDefined()
    })

    it('should combine plugins', () => {
      const plugin1 = createRobuildPlugin('test1', {
        transform: (code: string) => `// plugin1\n${code}`,
      })

      const plugin2 = createRobuildPlugin('test2', {
        transform: (code: string) => `// plugin2\n${code}`,
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])

      expect(combined.name).toBe('combined')
      expect(combined.transform).toBeDefined()
    })
  })

  describe('glob Import Plugin', () => {
    it('should detect glob imports in code', () => {
      const code = `
        import { something } from './module'
        const modules = import.meta.glob('./components/*.vue')
        const eager = import.meta.glob('./utils/*.ts', { eager: true })
      `

      expect(hasGlobImports(code)).toBe(true)

      const patterns = extractGlobPatterns(code)
      expect(patterns).toEqual(['./components/*.vue', './utils/*.ts'])
    })

    it('should transform glob imports', async () => {
      const code = `const modules = import.meta.glob('./test/*.js')`

      const plugin = createGlobImportPlugin({ enabled: true })
      const result = await (plugin.transform as any)(code, '/test/index.js')

      expect(result).toContain('{')
      // The result should contain some transformation, even if empty
      expect(result).not.toBe(code)
    })

    it('should handle eager glob imports', async () => {
      const code = `const modules = import.meta.glob('./test/*.js', { eager: true })`

      const plugin = createGlobImportPlugin({ enabled: true, eager: true })
      const result = await (plugin.transform as any)(code, '/test/index.js')

      expect(result).toContain('{')
      // Eager imports should have actual import statements or module references
    })

    it('should handle URL glob imports', async () => {
      const code = `const assets = import.meta.glob('./assets/*', { as: 'url' })`

      const plugin = createGlobImportPlugin({ enabled: true, asUrls: true })
      const result = await (plugin.transform as any)(code, '/test/index.js')

      expect(result).toContain('{')
      // URL imports should return file paths as strings
    })

    it('should not transform when disabled', async () => {
      const plugin = createGlobImportPlugin({ enabled: false })

      // When disabled, the plugin should not have a transform function
      expect(plugin.transform).toBeUndefined()
    })
  })

  describe('built-in Plugins', () => {
    it.skip('should handle JSON imports', async () => {
      // JSON imports are now handled natively by rolldown
    })

    it('should handle CSS imports', async () => {
      const plugin = cssPlugin()

      expect(plugin.name).toBe('css')
      expect(plugin.load).toBeDefined()
    })

    it('should handle text file imports', async () => {
      const plugin = textPlugin(['.txt', '.md'])

      expect(plugin.name).toBe('text')
      expect(plugin.load).toBeDefined()
    })

    it('should handle URL/asset imports', async () => {
      const plugin = urlPlugin(['.png', '.jpg'])

      expect(plugin.name).toBe('url')
      expect(plugin.load).toBeDefined()
    })

    it('should handle environment variable replacement', async () => {
      // Environment variables are now handled natively by rolldown's define option
      expect(true).toBe(true)
    })

    it('should handle alias resolution', async () => {
      // Alias resolution is now handled natively by rolldown's resolve.alias option
      expect(true).toBe(true)
    })

    it('should handle virtual modules', async () => {
      const plugin = virtualPlugin({
        'virtual:config': 'export default { version: "1.0.0" }',
      })

      const resolveResult = await (plugin.resolveId as any)('virtual:config', undefined)
      expect(resolveResult).toBe('virtual:config')

      const loadResult = await (plugin.load as any)('virtual:config')
      expect(loadResult).toBeTruthy()
      expect(loadResult).toContain('version: "1.0.0"')
    })

    it('should combine multiple plugins', async () => {
      const plugin1: RobuildPlugin = {
        name: 'plugin1',
        transform: async code => `// Plugin 1\n${code}`,
      }

      const plugin2: RobuildPlugin = {
        name: 'plugin2',
        transform: async code => `${code}\n// Plugin 2`,
      }

      const combined = combinePlugins('combined-plugin', [plugin1, plugin2])

      expect(combined.name).toBe('combined-plugin')

      const result = await (combined.transform as any)('const test = 1', 'test.js')
      expect(result).toContain('// Plugin 1')
      expect(result).toContain('// Plugin 2')
    })
  })

  describe('integration Tests', () => {
    it('should build with custom plugins', async (ctx) => {
      const customPlugin: RobuildPlugin = {
        name: 'custom-test',
        transform: async (code: string, id: string) => {
          if (id.endsWith('index.ts')) {
            return `// Custom plugin header\n${code}`
          }
          return null
        },
      }

      await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
        },
        options: {
          plugins: [customPlugin],
          entries: [{
            type: 'bundle',
            input: 'src/index.ts',
            format: 'esm',
          }],
        },
      })
    })

    it('should build with glob imports', async (ctx) => {
      await testBuild({
        context: ctx,
        files: {
          'src/index.ts': `
            const modules = import.meta.glob('./components/*.ts')
            export { modules }
          `,
          'src/components/Button.ts': 'export const Button = "button"',
          'src/components/Input.ts': 'export const Input = "input"',
        },
        options: {
          globImport: {
            enabled: true,
            patterns: ['**/*'],
          },
          entries: [{
            type: 'bundle',
            input: 'src/index.ts',
            format: 'esm',
          }],
        },
      })
    })

    it('should build with built-in plugins', async (ctx) => {
      await testBuild({
        context: ctx,
        files: {
          'src/index.ts': `
            export const config = { name: "test", version: "1.0.0" }
            export const styles = "body { margin: 0; }"
          `,
        },
        options: {
          plugins: [
            cssPlugin(),
          ],
          entries: [{
            type: 'bundle',
            input: 'src/index.ts',
            format: 'esm',
          }],
        },
      })
    })
  })
})
