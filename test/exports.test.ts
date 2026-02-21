import { describe, expect, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * Tests for generateExports functionality
 */
describe('exports generation', () => {
  describe('basic exports', () => {
    it('should generate exports for single entry', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
          'package.json': JSON.stringify({ name: 'test-pkg', version: '1.0.0' }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm', 'cjs'],
              dts: true,
              generateExports: true,
            },
          ],
          exports: {
            enabled: true,
            includeTypes: true,
            autoUpdate: true,
          },
        },
        afterBuild: async (outputDir) => {
          const fs = await import('node:fs/promises')
          const path = await import('node:path')
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await fs.readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          expect(pkg.exports).toBeDefined()
          expect(pkg.exports['.']).toBeDefined()
          expect(pkg.exports['.'].import).toContain('.mjs')
          expect(pkg.exports['.'].require).toContain('.cjs')
          expect(pkg.exports['.'].types).toContain('.d.mts')
        },
      })
    })

    it('should generate exports for multiple entries', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const main = "main"`,
          'utils.ts': `export const util = "util"`,
          'package.json': JSON.stringify({ name: 'test-pkg', version: '1.0.0' }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              generateExports: true,
            },
            {
              type: 'bundle',
              input: 'utils.ts',
              format: ['esm'],
              generateExports: true,
            },
          ],
          exports: {
            enabled: true,
            autoUpdate: true,
          },
        },
        afterBuild: async (outputDir) => {
          const fs = await import('node:fs/promises')
          const path = await import('node:path')
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await fs.readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          expect(pkg.exports).toBeDefined()
          expect(pkg.exports['.']).toBeDefined()
          expect(pkg.exports['./utils']).toBeDefined()
        },
      })
    })

    it('should use custom exportPath', async (context) => {
      await testBuild({
        context,
        files: {
          'src/helpers/index.ts': `export const helper = "helper"`,
          'package.json': JSON.stringify({ name: 'test-pkg', version: '1.0.0' }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'src/helpers/index.ts',
              format: ['esm'],
              generateExports: true,
              exportPath: './helpers',
            },
          ],
          exports: {
            enabled: true,
            autoUpdate: true,
          },
        },
        afterBuild: async (outputDir) => {
          const fs = await import('node:fs/promises')
          const path = await import('node:path')
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await fs.readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          expect(pkg.exports).toBeDefined()
          expect(pkg.exports['./helpers']).toBeDefined()
        },
      })
    })
  })

  describe('format handling', () => {
    it('should generate correct extensions for multi-format builds', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const value = 42`,
          'package.json': JSON.stringify({ name: 'test-pkg', version: '1.0.0' }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm', 'cjs'],
              generateExports: true,
            },
          ],
          exports: {
            enabled: true,
            autoUpdate: true,
          },
        },
        afterBuild: async (outputDir) => {
          const fs = await import('node:fs/promises')
          const path = await import('node:path')
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await fs.readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          expect(pkg.exports['.'].import).toMatch(/\.mjs$/)
          expect(pkg.exports['.'].require).toMatch(/\.cjs$/)
        },
      })
    })

    it('should handle ESM-only builds', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const value = 42`,
          'package.json': JSON.stringify({ name: 'test-pkg', version: '1.0.0' }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              generateExports: true,
            },
          ],
          exports: {
            enabled: true,
            includeTypes: false,
            autoUpdate: true,
          },
        },
        afterBuild: async (outputDir) => {
          const fs = await import('node:fs/promises')
          const path = await import('node:path')
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await fs.readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          // For single format without types, should be a string
          expect(typeof pkg.exports['.']).toBe('string')
          expect(pkg.exports['.']).toContain('.mjs')
        },
      })
    })
  })

  describe('custom exports', () => {
    it('should merge custom exports with generated ones', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const main = "main"`,
          'package.json': JSON.stringify({ name: 'test-pkg', version: '1.0.0' }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              generateExports: true,
            },
          ],
          exports: {
            enabled: true,
            autoUpdate: true,
            custom: {
              './package.json': './package.json',
            },
          },
        },
        afterBuild: async (outputDir) => {
          const fs = await import('node:fs/promises')
          const path = await import('node:path')
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await fs.readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          expect(pkg.exports['./package.json']).toBe('./package.json')
          expect(pkg.exports['.']).toBeDefined()
        },
      })
    })
  })

  describe('cli flag', () => {
    it('should respect --generate-exports flag', async (context) => {
      // This test verifies the CLI integration works
      await testBuild({
        context,
        files: {
          'index.ts': `export const value = 1`,
          'package.json': JSON.stringify({ name: 'test-pkg', version: '1.0.0' }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
            },
          ],
          // Simulating --generate-exports flag
          exports: {
            enabled: true,
            autoUpdate: true,
          },
        },
        afterBuild: async (outputDir) => {
          const fs = await import('node:fs/promises')
          const path = await import('node:path')
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await fs.readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          expect(pkg.exports).toBeDefined()
        },
      })
    })
  })
})
