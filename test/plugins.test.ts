import type { RobuildPlugin } from '../src/types'
import { describe, expect, it } from 'vitest'
import {
  createGlobImportPlugin,
  extractGlobPatterns,
  hasGlobImports,
  transformGlobImports,
} from '../src/features/glob-import'
import {
  adaptPlugin,
  createRollupPluginAdapter,
  createUnpluginAdapter,
  createVitePluginAdapter,
  loadPlugins,
  PluginManager,
} from '../src/features/plugins'
import {
  aliasPlugin,
  combinePlugins,
  cssPlugin,
  envPlugin,
  jsonPlugin,
  textPlugin,
  urlPlugin,
  virtualPlugin,
} from '../src/plugins/builtin'
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

      const manager = new PluginManager(config, entry)
      await manager.initialize()

      expect(manager.getPlugins()).toHaveLength(1)
      expect(manager.getPlugins()[0].name).toBe('test-plugin')
    })

    it('should execute plugin hooks', async () => {
      let hookCalled = false
      const testPlugin: RobuildPlugin = {
        name: 'hook-test',
        buildStart: async () => {
          hookCalled = true
        },
      }

      const config = { plugins: [testPlugin] }
      const entry = { type: 'bundle' as const, input: 'src/index.ts' }

      const manager = new PluginManager(config, entry)
      await manager.executeHook('buildStart')

      expect(hookCalled).toBe(true)
    })

    it('should adapt Rollup plugins', () => {
      const rollupPlugin = {
        name: 'rollup-test',
        transform: (code: string) => `// Rollup transformed\n${code}`,
      }

      const adapted = createRollupPluginAdapter(rollupPlugin)

      expect(adapted.name).toBe('rollup-test')
      expect(adapted.meta?.rollup).toBe(true)
      expect(adapted.transform).toBeDefined()
    })

    it('should adapt Vite plugins', () => {
      const vitePlugin = {
        name: 'vite-test',
        config: () => ({ build: { target: 'es2020' } }),
        transform: (code: string) => `// Vite transformed\n${code}`,
      }

      const adapted = createVitePluginAdapter(vitePlugin)

      expect(adapted.name).toBe('vite-test')
      expect(adapted.meta?.vite).toBe(true)
      expect(adapted.config).toBeDefined()
      expect(adapted.transform).toBeDefined()
    })

    it('should adapt Unplugin plugins', () => {
      const unplugin = {
        name: 'unplugin-test',
        unplugin: true,
        transform: (code: string) => `// Unplugin transformed\n${code}`,
      }

      const adapted = createUnpluginAdapter(unplugin)

      expect(adapted.name).toBe('unplugin-test')
      expect(adapted.unplugin).toBe(true)
      expect(adapted.meta?.rollup).toBe(true)
      expect(adapted.meta?.vite).toBe(true)
      expect(adapted.meta?.webpack).toBe(true)
    })

    it('should auto-detect plugin type', () => {
      const rollupPlugin = { name: 'auto-rollup', transform: () => null }
      const vitePlugin = { name: 'auto-vite', config: () => ({}) }
      const unplugin = { name: 'auto-unplugin', unplugin: true }

      expect(adaptPlugin(rollupPlugin).meta?.rollup).toBe(true)
      expect(adaptPlugin(vitePlugin).meta?.vite).toBe(true)
      expect(adaptPlugin(unplugin).unplugin).toBe(true)
    })

    it('should load plugin factories', () => {
      const pluginFactory = () => ({
        name: 'factory-plugin',
        transform: () => null,
      })

      const plugins = loadPlugins([pluginFactory])

      expect(plugins).toHaveLength(1)
      expect(plugins[0].name).toBe('factory-plugin')
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
      const result = await plugin.transform!(code, '/test/index.js')

      expect(result).toContain('{')
      // The result should contain some transformation, even if empty
      expect(result).not.toBe(code)
    })

    it('should handle eager glob imports', async () => {
      const code = `const modules = import.meta.glob('./test/*.js', { eager: true })`

      const plugin = createGlobImportPlugin({ enabled: true, eager: true })
      const result = await plugin.transform!(code, '/test/index.js')

      expect(result).toContain('{')
      // Eager imports should have actual import statements or module references
    })

    it('should handle URL glob imports', async () => {
      const code = `const assets = import.meta.glob('./assets/*', { as: 'url' })`

      const plugin = createGlobImportPlugin({ enabled: true, asUrls: true })
      const result = await plugin.transform!(code, '/test/index.js')

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
    it('should handle JSON imports', async () => {
      const plugin = jsonPlugin()

      expect(plugin.name).toBe('json')
      expect(plugin.load).toBeDefined()
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
      process.env.VITE_TEST_VAR = 'test-value'

      const plugin = envPlugin('VITE_')
      const code = 'const value = process.env.VITE_TEST_VAR'

      const result = await plugin.transform!(code, 'test.js')

      expect(result).toContain('"test-value"')

      delete process.env.VITE_TEST_VAR
    })

    it('should handle alias resolution', async () => {
      const plugin = aliasPlugin({
        '@': './src',
        '@utils': './src/utils',
      })

      const result1 = await plugin.resolveId!('@/components/Button', undefined)
      const result2 = await plugin.resolveId!('@utils/helpers', undefined)

      expect(result1).toBe('./src/components/Button')
      expect(result2).toBe('./src/utils/helpers')
    })

    it('should handle virtual modules', async () => {
      const plugin = virtualPlugin({
        'virtual:config': 'export default { version: "1.0.0" }',
      })

      const resolveResult = await plugin.resolveId!('virtual:config', undefined)
      expect(resolveResult).toBe('virtual:config')

      const loadResult = await plugin.load!('virtual:config')
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

      const combined = combinePlugins(plugin1, plugin2)

      expect(combined.name).toBe('combined-plugin')

      const result = await combined.transform!('const test = 1', 'test.js')
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
            jsonPlugin(),
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
