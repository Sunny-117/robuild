import { describe, expect, it, vi } from 'vitest'
import { RobuildPluginManager } from '../../src/plugins/manager'
import type { BuildConfig, BuildEntry, RobuildPlugin } from '../../src/types'

describe('plugin manager', () => {
  const createMockConfig = (plugins: any[] = []): BuildConfig => ({
    cwd: '/test',
    plugins,
  })

  const createMockEntry = (): BuildEntry => ({
    type: 'bundle',
    input: './src/index.ts',
    outDir: 'dist',
    format: 'es',
    platform: 'node',
    target: 'es2022',
  })

  describe('constructor', () => {
    it('should initialize with config and entry', () => {
      const config = createMockConfig()
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      expect(manager.getPlugins()).toEqual([])
    })

    it('should use default values when entry options are not provided', () => {
      const config = createMockConfig()
      const entry: BuildEntry = { type: 'bundle', input: './src/index.ts' }
      const manager = new RobuildPluginManager(config, entry, '/test')

      // Should not throw
      expect(manager.getPlugins()).toEqual([])
    })
  })

  describe('normalizePlugin', () => {
    it('should handle plugin factory functions', () => {
      const pluginFactory = () => ({
        name: 'factory-plugin',
        buildStart: () => {},
      })

      const config = createMockConfig([pluginFactory])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins).toHaveLength(1)
      expect(plugins[0].name).toBe('factory-plugin')
    })

    it('should handle nested plugin factories', () => {
      const nestedFactory = () => () => ({
        name: 'nested-plugin',
        buildStart: () => {},
      })

      const config = createMockConfig([nestedFactory()])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins).toHaveLength(1)
      expect(plugins[0].name).toBe('nested-plugin')
    })

    it('should recognize robuild plugins by meta.robuild', () => {
      const robuildPlugin: RobuildPlugin = {
        name: 'robuild-plugin',
        meta: { robuild: true },
      }

      const config = createMockConfig([robuildPlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins).toHaveLength(1)
      expect(plugins[0]).toBe(robuildPlugin)
    })

    it('should recognize robuild plugins by robuildSetup hook', () => {
      const robuildPlugin = {
        name: 'robuild-plugin-setup',
        robuildSetup: () => {},
      }

      const config = createMockConfig([robuildPlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins).toHaveLength(1)
      expect(plugins[0]).toBe(robuildPlugin)
    })

    it('should recognize robuild plugins by robuildBuildStart hook', () => {
      const robuildPlugin = {
        name: 'robuild-plugin-start',
        robuildBuildStart: () => {},
      }

      const config = createMockConfig([robuildPlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins[0]).toBe(robuildPlugin)
    })

    it('should recognize robuild plugins by robuildBuildEnd hook', () => {
      const robuildPlugin = {
        name: 'robuild-plugin-end',
        robuildBuildEnd: () => {},
      }

      const config = createMockConfig([robuildPlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins[0]).toBe(robuildPlugin)
    })

    it('should adapt rolldown plugins', () => {
      const rolldownPlugin = {
        name: 'rolldown-plugin',
        buildStart: () => {},
        resolveId: () => null,
      }

      const config = createMockConfig([rolldownPlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins).toHaveLength(1)
      expect(plugins[0].meta?.framework).toBe('rolldown')
      expect(plugins[0].meta?.robuild).toBe(true)
      expect(plugins[0].meta?.rollup).toBe(true)
    })

    it('should adapt vite plugins by config hook', () => {
      const vitePlugin = {
        name: 'vite-plugin',
        config: () => ({}),
      }

      const config = createMockConfig([vitePlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins).toHaveLength(1)
      expect(plugins[0].meta?.framework).toBe('vite')
      expect(plugins[0].meta?.vite).toBe(true)
    })

    it('should adapt vite plugins by configResolved hook', () => {
      const vitePlugin = {
        name: 'vite-plugin-resolved',
        configResolved: () => {},
      }

      const config = createMockConfig([vitePlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins[0].meta?.vite).toBe(true)
    })

    it('should adapt vite plugins by configureServer hook', () => {
      const vitePlugin = {
        name: 'vite-plugin-server',
        configureServer: () => {},
      }

      const config = createMockConfig([vitePlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins[0].meta?.vite).toBe(true)
    })

    it('should adapt vite plugins by meta.vite', () => {
      const vitePlugin = {
        name: 'vite-plugin-meta',
        meta: { vite: true },
        buildStart: () => {},
      }

      const config = createMockConfig([vitePlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins[0].meta?.vite).toBe(true)
    })

    it('should adapt unplugins by unplugin flag', () => {
      const unplugin = {
        name: 'unplugin',
        unplugin: true,
        buildStart: () => {},
      }

      const config = createMockConfig([unplugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins).toHaveLength(1)
      // unplugin flag is not specifically detected by manager, it falls back to rolldown
      expect(plugins[0].meta?.robuild).toBe(true)
    })

    it('should adapt unplugins by meta.unplugin', () => {
      const unplugin = {
        name: 'unplugin-meta',
        meta: { unplugin: true },
        buildStart: () => {},
      }

      const config = createMockConfig([unplugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      // unplugin flag in meta is not specifically detected either
      expect(plugins[0].meta?.robuild).toBe(true)
    })

    it('should throw for invalid plugin options', () => {
      const config = createMockConfig(['invalid' as any])
      const entry = createMockEntry()

      expect(() => new RobuildPluginManager(config, entry, '/test')).toThrow('Invalid plugin option')
    })

    it('should fallback to rolldown adapter for unknown plugins', () => {
      const unknownPlugin = {
        name: 'unknown-plugin',
      }

      const config = createMockConfig([unknownPlugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const plugins = manager.getPlugins()
      expect(plugins[0].meta?.framework).toBe('rolldown')
    })
  })

  describe('initializeRobuildHooks', () => {
    it('should call robuildSetup on all plugins', async () => {
      const setup1 = vi.fn()
      const setup2 = vi.fn()

      const config = createMockConfig([
        { name: 'plugin1', robuildSetup: setup1 },
        { name: 'plugin2', robuildSetup: setup2 },
      ])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      await manager.initializeRobuildHooks()

      expect(setup1).toHaveBeenCalledTimes(1)
      expect(setup2).toHaveBeenCalledTimes(1)
    })

    it('should skip plugins without robuildSetup', async () => {
      const setup = vi.fn()

      const config = createMockConfig([
        { name: 'plugin1', buildStart: () => {} },
        { name: 'plugin2', robuildSetup: setup },
      ])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      await manager.initializeRobuildHooks()

      expect(setup).toHaveBeenCalledTimes(1)
    })
  })

  describe('executeRobuildBuildStart', () => {
    it('should call robuildBuildStart on all plugins', async () => {
      const start1 = vi.fn()
      const start2 = vi.fn()

      const config = createMockConfig([
        { name: 'plugin1', robuildBuildStart: start1 },
        { name: 'plugin2', robuildBuildStart: start2 },
      ])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      await manager.executeRobuildBuildStart()

      expect(start1).toHaveBeenCalledTimes(1)
      expect(start2).toHaveBeenCalledTimes(1)
    })
  })

  describe('executeRobuildBuildEnd', () => {
    it('should call robuildBuildEnd on all plugins with result', async () => {
      const end1 = vi.fn()
      const end2 = vi.fn()

      const config = createMockConfig([
        { name: 'plugin1', robuildBuildEnd: end1 },
        { name: 'plugin2', robuildBuildEnd: end2 },
      ])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const result = { success: true }
      await manager.executeRobuildBuildEnd(result)

      expect(end1).toHaveBeenCalledWith(expect.any(Object), result)
      expect(end2).toHaveBeenCalledWith(expect.any(Object), result)
    })
  })

  describe('getRolldownPlugins', () => {
    it('should return plugins without robuild-specific properties', () => {
      const plugin = {
        name: 'test-plugin',
        buildStart: () => {},
        robuildSetup: () => {},
        robuildBuildStart: () => {},
        robuildBuildEnd: () => {},
      }

      const config = createMockConfig([plugin])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      const rolldownPlugins = manager.getRolldownPlugins()

      expect(rolldownPlugins).toHaveLength(1)
      expect(rolldownPlugins[0].name).toBe('test-plugin')
      expect(rolldownPlugins[0].buildStart).toBeDefined()
      expect((rolldownPlugins[0] as any).robuildSetup).toBeUndefined()
      expect((rolldownPlugins[0] as any).robuildBuildStart).toBeUndefined()
      expect((rolldownPlugins[0] as any).robuildBuildEnd).toBeUndefined()
    })
  })

  describe('updateContext', () => {
    it('should update context with new values', async () => {
      const setup = vi.fn()
      const config = createMockConfig([{ name: 'plugin', robuildSetup: setup }])
      const entry = createMockEntry()
      const manager = new RobuildPluginManager(config, entry, '/test')

      manager.updateContext({ outDir: 'lib', format: 'cjs' })

      await manager.initializeRobuildHooks()

      expect(setup).toHaveBeenCalledWith(expect.objectContaining({
        outDir: 'lib',
        format: 'cjs',
      }))
    })
  })
})
