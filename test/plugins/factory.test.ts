import { describe, expect, it, vi } from 'vitest'
import {
  combinePlugins,
  createLoadPlugin,
  createPluginFactory,
  createResolvePlugin,
  createRobuildPlugin,
  createTransformPlugin,
  extendRolldownPlugin,
} from '../../src/plugins/factory'

describe('plugin factory', () => {
  describe('createRobuildPlugin', () => {
    it('should create a plugin with name and hooks', () => {
      const plugin = createRobuildPlugin('test-plugin', {
        buildStart: () => {},
      })

      expect(plugin.name).toBe('test-plugin')
      expect(plugin.meta?.framework).toBe('robuild')
      expect(plugin.meta?.robuild).toBe(true)
      expect(plugin.buildStart).toBeDefined()
    })

    it('should create a plugin with empty hooks', () => {
      const plugin = createRobuildPlugin('empty-plugin', {})

      expect(plugin.name).toBe('empty-plugin')
      expect(plugin.meta?.robuild).toBe(true)
    })
  })

  describe('createPluginFactory', () => {
    it('should create a factory function that returns a plugin', () => {
      const factory = createPluginFactory('factory-plugin', (options?: { prefix?: string }) => ({
        transform: async (code: string) => {
          return { code: `${options?.prefix || '// default'}\n${code}` }
        },
      }))

      const plugin = factory({ prefix: '// custom' })

      expect(plugin.name).toBe('factory-plugin')
      expect(plugin.meta?.robuild).toBe(true)
      expect(plugin.transform).toBeDefined()
    })

    it('should work without options', () => {
      const factory = createPluginFactory('no-options-plugin', () => ({
        buildStart: () => {},
      }))

      const plugin = factory()

      expect(plugin.name).toBe('no-options-plugin')
    })
  })

  describe('extendRolldownPlugin', () => {
    it('should extend rolldown plugin with robuild hooks', () => {
      const rolldownPlugin = {
        name: 'rolldown-plugin',
        buildStart: () => {},
      }

      const robuildSetup = vi.fn()
      const robuildBuildStart = vi.fn()
      const robuildBuildEnd = vi.fn()

      const extended = extendRolldownPlugin(rolldownPlugin, {
        robuildSetup,
        robuildBuildStart,
        robuildBuildEnd,
      })

      expect(extended.name).toBe('rolldown-plugin')
      expect(extended.buildStart).toBeDefined()
      expect(extended.robuildSetup).toBe(robuildSetup)
      expect(extended.robuildBuildStart).toBe(robuildBuildStart)
      expect(extended.robuildBuildEnd).toBe(robuildBuildEnd)
      expect(extended.meta?.framework).toBe('robuild')
      expect(extended.meta?.robuild).toBe(true)
      expect(extended.meta?.rollup).toBe(true)
    })

    it('should preserve existing meta properties', () => {
      const rolldownPlugin = {
        name: 'with-meta',
        meta: { custom: 'value' },
      }

      const extended = extendRolldownPlugin(rolldownPlugin, {})

      expect((extended.meta as any)?.custom).toBe('value')
      expect(extended.meta?.robuild).toBe(true)
    })
  })

  describe('createTransformPlugin', () => {
    it('should create a transform plugin', async () => {
      const plugin = createTransformPlugin(
        'transform-plugin',
        async (code, _id, _ctx) => code.toUpperCase(),
      )

      expect(plugin.name).toBe('transform-plugin')
      expect(plugin.transform).toBeDefined()

      const result = await (plugin.transform as any)('hello', 'test.js')
      expect(result).toEqual({ code: 'HELLO' })
    })

    it('should filter files by regex', async () => {
      const plugin = createTransformPlugin(
        'filter-plugin',
        async code => code.toUpperCase(),
        /\.ts$/,
      )

      const tsResult = await (plugin.transform as any)('hello', 'test.ts')
      expect(tsResult).toEqual({ code: 'HELLO' })

      const jsResult = await (plugin.transform as any)('hello', 'test.js')
      expect(jsResult).toBeNull()
    })

    it('should return null when transform returns null', async () => {
      const plugin = createTransformPlugin(
        'null-plugin',
        async () => null,
      )

      const result = await (plugin.transform as any)('hello', 'test.js')
      expect(result).toBeNull()
    })
  })

  describe('createLoadPlugin', () => {
    it('should create a load plugin', async () => {
      const plugin = createLoadPlugin(
        'load-plugin',
        async id => `// loaded from ${id}`,
      )

      expect(plugin.name).toBe('load-plugin')
      expect(plugin.load).toBeDefined()

      const result = await (plugin.load as any)('test.js')
      expect(result).toBe('// loaded from test.js')
    })

    it('should filter files by regex', async () => {
      const plugin = createLoadPlugin(
        'filter-load-plugin',
        async id => `// loaded: ${id}`,
        /\.virtual$/,
      )

      const virtualResult = await (plugin.load as any)('test.virtual')
      expect(virtualResult).toBe('// loaded: test.virtual')

      const jsResult = await (plugin.load as any)('test.js')
      expect(jsResult).toBeNull()
    })
  })

  describe('createResolvePlugin', () => {
    it('should create a resolve plugin', async () => {
      const plugin = createResolvePlugin(
        'resolve-plugin',
        async (id, _importer, _ctx) => {
          if (id.startsWith('virtual:')) {
            return id.replace('virtual:', '/resolved/')
          }
          return null
        },
      )

      expect(plugin.name).toBe('resolve-plugin')
      expect(plugin.resolveId).toBeDefined()

      const virtualResult = await (plugin.resolveId as any)('virtual:test', undefined)
      expect(virtualResult).toBe('/resolved/test')

      const normalResult = await (plugin.resolveId as any)('normal', undefined)
      expect(normalResult).toBeNull()
    })

    it('should filter files by regex', async () => {
      const plugin = createResolvePlugin(
        'filter-resolve-plugin',
        async id => `/resolved/${id}`,
        /^@app\//,
      )

      const appResult = await (plugin.resolveId as any)('@app/utils', undefined)
      expect(appResult).toBe('/resolved/@app/utils')

      const otherResult = await (plugin.resolveId as any)('lodash', undefined)
      expect(otherResult).toBeNull()
    })
  })

  describe('combinePlugins', () => {
    it('should combine multiple plugins into one', () => {
      const plugin1 = createRobuildPlugin('plugin1', {
        buildStart: vi.fn() as any,
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        buildEnd: vi.fn() as any,
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])

      expect(combined.name).toBe('combined')
      expect(combined.buildStart).toBeDefined()
      expect(combined.buildEnd).toBeDefined()
    })

    it('should chain buildStart hooks', async () => {
      const order: number[] = []
      const plugin1 = createRobuildPlugin('plugin1', {
        buildStart: async () => {
          order.push(1)
        },
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        buildStart: async () => {
          order.push(2)
        },
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])
      await (combined.buildStart as any)({})

      expect(order).toEqual([1, 2])
    })

    it('should chain buildEnd hooks', async () => {
      const order: number[] = []
      const plugin1 = createRobuildPlugin('plugin1', {
        buildEnd: async () => {
          order.push(1)
        },
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        buildEnd: async () => {
          order.push(2)
        },
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])
      await (combined.buildEnd as any)(null)

      expect(order).toEqual([1, 2])
    })

    it('should chain resolveId hooks and return first non-null result', async () => {
      const plugin1 = createRobuildPlugin('plugin1', {
        resolveId: async (id: string) => {
          if (id === 'special')
            return '/special'
          return null
        },
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        resolveId: async (id: string) => `/fallback/${id}`,
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])

      const specialResult = await (combined.resolveId as any)('special', undefined)
      expect(specialResult).toBe('/special')

      const otherResult = await (combined.resolveId as any)('other', undefined)
      expect(otherResult).toBe('/fallback/other')
    })

    it('should chain load hooks and return first non-null result', async () => {
      const plugin1 = createRobuildPlugin('plugin1', {
        load: async (id: string) => {
          if (id.endsWith('.special'))
            return '// special'
          return null
        },
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        load: async (id: string) => `// loaded: ${id}`,
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])

      const specialResult = await (combined.load as any)('test.special')
      expect(specialResult).toBe('// special')

      const otherResult = await (combined.load as any)('test.js')
      expect(otherResult).toBe('// loaded: test.js')
    })

    it('should chain transform hooks and pass transformed code', async () => {
      const plugin1 = createRobuildPlugin('plugin1', {
        transform: async (code: string) => ({ code: `/* plugin1 */\n${code}` }),
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        transform: async (code: string) => ({ code: `${code}\n/* plugin2 */` }),
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])

      const result = await (combined.transform as any)('content', 'test.js')
      expect(result.code).toBe('/* plugin1 */\ncontent\n/* plugin2 */')
    })

    it('should chain transform hooks with string returns', async () => {
      const plugin1 = createRobuildPlugin('plugin1', {
        transform: async (code: string) => `prefix-${code}`,
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        transform: async (code: string) => `${code}-suffix`,
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])

      const result = await (combined.transform as any)('content', 'test.js')
      expect(result).toBe('prefix-content-suffix')
    })

    it('should chain robuildSetup hooks', async () => {
      const order: number[] = []
      const plugin1 = createRobuildPlugin('plugin1', {
        robuildSetup: async () => {
          order.push(1)
        },
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        robuildSetup: async () => {
          order.push(2)
        },
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])
      await combined.robuildSetup!({} as any)

      expect(order).toEqual([1, 2])
    })

    it('should chain robuildBuildStart hooks', async () => {
      const order: number[] = []
      const plugin1 = createRobuildPlugin('plugin1', {
        robuildBuildStart: async () => {
          order.push(1)
        },
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        robuildBuildStart: async () => {
          order.push(2)
        },
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])
      await combined.robuildBuildStart!({} as any)

      expect(order).toEqual([1, 2])
    })

    it('should chain robuildBuildEnd hooks', async () => {
      const order: number[] = []
      const plugin1 = createRobuildPlugin('plugin1', {
        robuildBuildEnd: async () => {
          order.push(1)
        },
      })
      const plugin2 = createRobuildPlugin('plugin2', {
        robuildBuildEnd: async () => {
          order.push(2)
        },
      })

      const combined = combinePlugins('combined', [plugin1, plugin2])
      await combined.robuildBuildEnd!({} as any, {})

      expect(order).toEqual([1, 2])
    })

    it('should handle hooks with handler property', async () => {
      const plugin = createRobuildPlugin('handler-plugin', {
        buildStart: {
          handler: vi.fn(),
        } as any,
      })

      const combined = combinePlugins('combined', [plugin])

      // Should not throw
      await (combined.buildStart as any)({})
    })
  })
})
