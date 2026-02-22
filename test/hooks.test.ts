import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * Hooks tests
 * Tests for build lifecycle hooks: start, end, entries, rolldownConfig, rolldownOutput
 */
describe('hooks', () => {
  describe('start hook', () => {
    it('should execute start hook at the beginning of build', async (context) => {
      let startCalled = false
      let receivedContext: any = null

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
          'package.json': JSON.stringify({ name: 'test-pkg', version: '1.0.0' }),
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            start: (ctx) => {
              startCalled = true
              receivedContext = ctx
            },
          },
        },
        afterBuild: async () => {
          expect(startCalled).toBe(true)
          expect(receivedContext).not.toBeNull()
          expect(receivedContext.pkgDir).toBeDefined()
          expect(receivedContext.pkg).toBeDefined()
        },
      })
    })

    it('should support async start hook', async (context) => {
      let asyncCompleted = false

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            start: async (ctx) => {
              await new Promise(resolve => setTimeout(resolve, 10))
              asyncCompleted = true
            },
          },
        },
        afterBuild: async () => {
          expect(asyncCompleted).toBe(true)
        },
      })
    })
  })

  describe('end hook', () => {
    it('should execute end hook after build completes', async (context) => {
      let endCalled = false
      let receivedContext: any = null

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            end: (ctx) => {
              endCalled = true
              receivedContext = ctx
            },
          },
        },
        afterBuild: async () => {
          expect(endCalled).toBe(true)
          expect(receivedContext).not.toBeNull()
          expect(receivedContext.pkgDir).toBeDefined()
        },
      })
    })

    it('should support async end hook', async (context) => {
      let asyncCompleted = false

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            end: async (ctx) => {
              await new Promise(resolve => setTimeout(resolve, 10))
              asyncCompleted = true
            },
          },
        },
        afterBuild: async () => {
          expect(asyncCompleted).toBe(true)
        },
      })
    })
  })

  describe('entries hook', () => {
    it('should execute entries hook with normalized entries', async (context) => {
      let receivedEntries: any[] = []

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            entries: (entries, ctx) => {
              receivedEntries = [...entries]
            },
          },
        },
        afterBuild: async () => {
          expect(receivedEntries.length).toBeGreaterThan(0)
          expect(receivedEntries[0].type).toBe('bundle')
        },
      })
    })

    it('should allow modifying entries in hook', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts', minify: false }],
          hooks: {
            entries: (entries, ctx) => {
              // Modify entry
              if (entries[0]) {
                (entries[0] as any).minify = true
              }
            },
          },
        },
        afterBuild: async (outputDir) => {
          // Build should complete successfully
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })
  })

  describe('rolldownConfig hook', () => {
    it('should execute rolldownConfig hook before rolldown build', async (context) => {
      let rolldownConfigCalled = false
      let receivedConfig: any = null

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            rolldownConfig: (cfg, ctx) => {
              rolldownConfigCalled = true
              receivedConfig = cfg
            },
          },
        },
        afterBuild: async () => {
          expect(rolldownConfigCalled).toBe(true)
          expect(receivedConfig).not.toBeNull()
          // Config should have input property
          expect(receivedConfig.input).toBeDefined()
        },
      })
    })
  })

  describe('rolldownOutput hook', () => {
    it('should execute rolldownOutput hook before output generation', async (context) => {
      let rolldownOutputCalled = false

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            rolldownOutput: (cfg, res, ctx) => {
              rolldownOutputCalled = true
            },
          },
        },
        afterBuild: async () => {
          expect(rolldownOutputCalled).toBe(true)
        },
      })
    })
  })

  describe('hook execution order', () => {
    it('should execute hooks in correct order: start -> entries -> rolldownConfig -> rolldownOutput -> end', async (context) => {
      const executionOrder: string[] = []

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            start: () => {
              executionOrder.push('start')
            },
            entries: () => {
              executionOrder.push('entries')
            },
            rolldownConfig: () => {
              executionOrder.push('rolldownConfig')
            },
            rolldownOutput: () => {
              executionOrder.push('rolldownOutput')
            },
            end: () => {
              executionOrder.push('end')
            },
          },
        },
        afterBuild: async () => {
          expect(executionOrder).toEqual([
            'start',
            'entries',
            'rolldownConfig',
            'rolldownOutput',
            'end',
          ])
        },
      })
    })
  })

  describe('BuildContext', () => {
    it('should provide pkgDir in context', async (context) => {
      let receivedPkgDir: string | undefined

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            start: (ctx) => {
              receivedPkgDir = ctx.pkgDir
            },
          },
        },
        afterBuild: async () => {
          expect(receivedPkgDir).toBeDefined()
          expect(typeof receivedPkgDir).toBe('string')
        },
      })
    })

    it('should provide pkg info in context', async (context) => {
      let receivedPkg: any

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
          'package.json': JSON.stringify({
            name: 'my-test-pkg',
            version: '2.0.0',
            description: 'Test package',
          }),
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            start: (ctx) => {
              receivedPkg = ctx.pkg
            },
          },
        },
        afterBuild: async () => {
          expect(receivedPkg).toBeDefined()
          expect(receivedPkg.name).toBe('my-test-pkg')
          expect(receivedPkg.version).toBe('2.0.0')
        },
      })
    })
  })

  describe('multiple hooks combined', () => {
    it('should support all hooks together', async (context) => {
      const hooksCalled = {
        start: false,
        entries: false,
        rolldownConfig: false,
        rolldownOutput: false,
        end: false,
      }

      await testBuild({
        context,
        files: {
          'index.ts': `export const version = "1.0.0"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          hooks: {
            start: () => {
              hooksCalled.start = true
            },
            entries: () => {
              hooksCalled.entries = true
            },
            rolldownConfig: () => {
              hooksCalled.rolldownConfig = true
            },
            rolldownOutput: () => {
              hooksCalled.rolldownOutput = true
            },
            end: () => {
              hooksCalled.end = true
            },
          },
        },
        afterBuild: async (outputDir) => {
          expect(hooksCalled.start).toBe(true)
          expect(hooksCalled.entries).toBe(true)
          expect(hooksCalled.rolldownConfig).toBe(true)
          expect(hooksCalled.rolldownOutput).toBe(true)
          expect(hooksCalled.end).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })
  })
})
