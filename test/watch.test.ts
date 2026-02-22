import type { BuildConfig, BuildContext } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock rolldown watch
vi.mock('rolldown', async () => {
  const actual = await vi.importActual<typeof import('rolldown')>('rolldown')
  return {
    ...actual,
    watch: vi.fn(() => {
      const listeners: Record<string, Function[]> = {}
      return {
        on: vi.fn((event: string, handler: Function) => {
          if (!listeners[event]) {
            listeners[event] = []
          }
          listeners[event].push(handler)
        }),
        close: vi.fn(async () => {}),
        emit: (event: string, data: any) => {
          if (listeners[event]) {
            listeners[event].forEach(handler => handler(data))
          }
        },
        getListeners: () => listeners,
      }
    }),
  }
})

// Mock logger
vi.mock('../src/core/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    log: vi.fn(),
  },
}))

// Mock process events
const mockProcessOn = vi.fn()
const mockProcessExit = vi.fn()
const originalProcessOn = process.on
const originalProcessExit = process.exit

describe('watch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.on = mockProcessOn as any
    process.exit = mockProcessExit as any
  })

  afterEach(() => {
    process.on = originalProcessOn
    process.exit = originalProcessExit
  })

  describe('startRolldownWatch', () => {
    it('should create watch configurations for bundle entries', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
        },
      ]

      // Run in background
      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should handle string entries', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = ['./src/index.ts']

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should skip entries without input', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { logger } = await import('../src/core/logger')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          // No input
          outDir: './dist',
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(logger.warn).toHaveBeenCalledWith('Skipping entry without input:', expect.anything())
    })

    it('should handle different formats', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
          format: ['esm', 'cjs'],
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should handle different platforms', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
          platform: 'browser',
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should handle array input', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: ['./src/index.ts', './src/cli.ts'],
          outDir: './dist',
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should handle object input', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: {
            index: './src/index.ts',
            cli: './src/cli.ts',
          },
          outDir: './dist',
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should register SIGINT and SIGTERM handlers', async () => {
      const { startRolldownWatch } = await import('../src/watch')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockProcessOn).toHaveBeenCalledWith('SIGINT', expect.any(Function))
      expect(mockProcessOn).toHaveBeenCalledWith('SIGTERM', expect.any(Function))
    })

    it('should handle watch events', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { logger } = await import('../src/core/logger')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      // Get the watcher mock and trigger events
      const watcher = (watch as any).mock.results[0].value

      // Trigger START event
      watcher.emit('event', { code: 'START' })
      expect(logger.info).toHaveBeenCalledWith('Rebuilding...')

      // Trigger END event
      watcher.emit('event', { code: 'END' })
      expect(logger.success).toHaveBeenCalledWith('Rebuilt')

      // Trigger ERROR event
      watcher.emit('event', { code: 'ERROR', error: new Error('Test error') })
      expect(logger.error).toHaveBeenCalledWith('Build error:', expect.any(Error))

      // Trigger BUNDLE_START and BUNDLE_END (should be silent)
      const infoCallCount = (logger.info as any).mock.calls.length
      watcher.emit('event', { code: 'BUNDLE_START' })
      watcher.emit('event', { code: 'BUNDLE_END' })
      // Info should not be called again for these events
      expect((logger.info as any).mock.calls.length).toBe(infoCallCount)
    })

    it('should handle cleanup on SIGINT', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { logger } = await import('../src/core/logger')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      // Get the SIGINT handler
      const sigintHandler = mockProcessOn.mock.calls.find(
        call => call[0] === 'SIGINT',
      )?.[1]

      expect(sigintHandler).toBeDefined()

      // Call the handler
      await sigintHandler()

      expect(logger.info).toHaveBeenCalledWith('Stopping watch mode...')

      // Get the watcher mock
      const watcher = (watch as any).mock.results[0].value
      expect(watcher.close).toHaveBeenCalled()
      expect(mockProcessExit).toHaveBeenCalledWith(0)
    })

    it('should handle rolldown plugins from entry', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const mockPlugin = { name: 'test-plugin' }
      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
          rolldown: {
            plugins: [mockPlugin],
          },
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should handle external and noExternal options', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
          external: ['lodash'],
          noExternal: ['internal-pkg'],
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should use correct format mapping', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      // Test each format
      const formats = ['esm', 'cjs', 'iife', 'umd']

      for (const format of formats) {
        vi.clearAllMocks()

        const bundleEntries = [
          {
            type: 'bundle',
            input: './src/index.ts',
            outDir: './dist',
            format,
          },
        ]

        const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(watch).toHaveBeenCalled()
      }
    })

    it('should handle sourcemap option', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
          sourcemap: true,
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })

    it('should handle target option', async () => {
      const { startRolldownWatch } = await import('../src/watch')
      const { watch } = await import('rolldown')

      const config: BuildConfig = {
        entries: [],
      }

      const ctx: BuildContext = {
        pkgDir: process.cwd(),
        pkg: { name: 'test', version: '1.0.0' },
      }

      const bundleEntries = [
        {
          type: 'bundle',
          input: './src/index.ts',
          outDir: './dist',
          target: 'es2020',
        },
      ]

      const watchPromise = startRolldownWatch(config, ctx, bundleEntries)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(watch).toHaveBeenCalled()
    })
  })
})
