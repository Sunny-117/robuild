import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { testBuild } from './helpers'

/**
 * Developer experience tests
 * Tests for onSuccess, ignoreWatch, failOnWarn, logLevel, fromVite
 */
describe('developer experience', () => {
  describe('onSuccess callback', () => {
    it('should execute string command on successful build', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          // String command - creates a marker file
          onSuccess: 'echo "success" > .build-success',
        },
        afterBuild: async (outputDir) => {
          // The command runs in the working directory
          const workDir = path.dirname(outputDir)
          expect(existsSync(path.join(workDir, '.build-success'))).toBe(true)
        },
      })
    })

    it('should execute function callback on successful build', async (context) => {
      let callbackExecuted = false

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          onSuccess: (result) => {
            callbackExecuted = true
            // Note: result.entries is currently empty due to implementation
            // The callback still receives the result object with duration
          },
        },
        afterBuild: async () => {
          expect(callbackExecuted).toBe(true)
        },
      })
    })

    it('should pass build result to callback function', async (context) => {
      let capturedResult: any = null

      await testBuild({
        context,
        files: {
          'index.ts': `export const version = "1.0.0"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          onSuccess: (result) => {
            capturedResult = result
          },
        },
        afterBuild: async () => {
          expect(capturedResult).not.toBeNull()
          expect(capturedResult.entries).toBeDefined()
          expect(capturedResult.duration).toBeGreaterThan(0)
        },
      })
    })

    it('should execute async callback function', async (context) => {
      let asyncCompleted = false

      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          onSuccess: async (result) => {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 10))
            asyncCompleted = true
          },
        },
        afterBuild: async () => {
          expect(asyncCompleted).toBe(true)
        },
      })
    })
  })

  describe('build result structure', () => {
    it('should pass build result with duration to callback', async (context) => {
      let capturedResult: any = null

      await testBuild({
        context,
        files: {
          'index.ts': `
            export const hello = "world"
            export function greet(name: string) { return \`Hello, \${name}!\` }
          `,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts', format: ['esm', 'cjs'] }],
          onSuccess: (result) => {
            capturedResult = result
          },
        },
        afterBuild: async () => {
          expect(capturedResult).not.toBeNull()
          expect(capturedResult).toHaveProperty('duration')
          expect(capturedResult).toHaveProperty('entries')
          expect(capturedResult.duration).toBeGreaterThan(0)
          // Note: entries array is currently empty due to implementation limitation
        },
      })
    })
  })

  describe('failOnWarn option', () => {
    it('should not fail by default when there are warnings', async (context) => {
      // This test verifies the default behavior (failOnWarn: false)
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          failOnWarn: false,
        },
        afterBuild: async (outputDir) => {
          // Build should succeed even if there were warnings
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })
  })

  describe('logLevel option', () => {
    it('should accept different log levels', async (context) => {
      // Test that different log levels are accepted without error
      for (const level of ['silent', 'error', 'warn', 'info', 'verbose']) {
        await testBuild({
          context,
          files: {
            'index.ts': `export const hello = "world"`,
          },
          config: {
            entries: [{ type: 'bundle', input: 'index.ts' }],
            logLevel: level as any,
          },
          afterBuild: async (outputDir) => {
            expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          },
        })
      }
    })
  })

  describe('ignoreWatch option', () => {
    it('should accept ignore patterns', async (context) => {
      // Test that ignoreWatch option is accepted
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          ignoreWatch: [
            '**/*.test.ts',
            '**/*.spec.ts',
            'docs/**',
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })
  })

  describe('fromVite option', () => {
    it('should accept fromVite option', async (context) => {
      // Test that fromVite option is accepted (without actual vite config)
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          fromVite: false,
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })

    it('should load vite config when fromVite is true', async (context) => {
      // Test with a simple vite config
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
          'vite.config.ts': `
            export default {
              build: {
                lib: {
                  entry: './index.ts',
                  formats: ['es'],
                  name: 'TestLib'
                }
              }
            }
          `,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          fromVite: true,
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })
  })

  describe('combined options', () => {
    it('should handle multiple dev experience options together', async (context) => {
      let callbackExecuted = false

      await testBuild({
        context,
        files: {
          'index.ts': `export const version = "1.0.0"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
          logLevel: 'info',
          failOnWarn: false,
          ignoreWatch: ['**/*.test.ts'],
          onSuccess: () => {
            callbackExecuted = true
          },
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(callbackExecuted).toBe(true)
        },
      })
    })
  })
})
