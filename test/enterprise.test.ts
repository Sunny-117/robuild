import type { BuildConfig } from '../src/types'
import { describe, expect, it } from 'vitest'
import { generatePackageExports } from '../src/features/exports'

describe('exports Generation', () => {
  describe('package Exports Generation', () => {
    it('should generate exports for ESM format', async () => {
      const buildConfig: BuildConfig = {
        entries: [{
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
          dts: true,
        }],
      }

      const exports = await generatePackageExports(
        process.cwd(),
        buildConfig,
        { enabled: true, includeTypes: true },
      )

      expect(exports).toHaveProperty('.')
      expect(exports['.']).toHaveProperty('import')
      expect(exports['.']).toHaveProperty('types')
    })

    it('should generate exports for multiple formats', async () => {
      const buildConfig: BuildConfig = {
        entries: [{
          type: 'bundle',
          input: 'src/index.ts',
          format: ['esm', 'cjs'],
          dts: true,
        }],
      }

      const exports = await generatePackageExports(
        process.cwd(),
        buildConfig,
        { enabled: true, includeTypes: true },
      )

      expect(exports).toHaveProperty('.')
      expect(exports['.']).toHaveProperty('import')
      expect(exports['.']).toHaveProperty('require')
      expect(exports['.']).toHaveProperty('types')
    })

    it('should generate exports with custom mapping', async () => {
      const buildConfig: BuildConfig = {
        entries: [{
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
        }],
      }

      const exports = await generatePackageExports(
        process.cwd(),
        buildConfig,
        {
          enabled: true,
          custom: {
            './custom': './dist/custom.mjs',
          },
        },
      )

      expect(exports).toHaveProperty('./custom')
      expect(exports['./custom']).toBe('./dist/custom.mjs')
    })

    it('should generate exports with base directory', async () => {
      const buildConfig: BuildConfig = {
        entries: [{
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
        }],
      }

      const exports = await generatePackageExports(
        process.cwd(),
        buildConfig,
        {
          enabled: true,
          baseDir: 'lib',
        },
      )

      expect(exports).toHaveProperty('.')
      // When only one format and no types, it returns a string directly
      expect(typeof exports['.']).toBe('string')
      expect(exports['.']).toContain('./lib/')
    })
  })
})
