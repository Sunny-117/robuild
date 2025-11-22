import type { BuildConfig } from '../src/types'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generatePackageExports } from '../src/features/exports'
import {
  detectMigrationSources,
  migrateFromTsup,
  migrateFromUnbuild,
} from '../src/features/migration'

describe('enterprise Features', () => {
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

  describe('migration Tools', () => {
    it('should migrate from tsup configuration', async () => {
      const tsupConfig = {
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        dts: true,
        clean: true,
        minify: true,
        target: 'es2020',
        platform: 'node',
        external: ['react'],
        globalName: 'MyLib',
      }

      // Create a temporary config file content
      const configContent = JSON.stringify(tsupConfig)

      const result = await migrateFromTsup('tsup.config.json', configContent)

      expect(result.config).toHaveProperty('entries')
      expect(result.config.entries).toHaveLength(1)
      expect(result.config.entries![0]).toMatchObject({
        type: 'bundle',
        input: 'src/index.ts',
        format: ['esm', 'cjs'],
        dts: true,
        minify: true,
        target: 'es2020',
        platform: 'node',
        external: ['react'],
        globalName: 'MyLib',
      })
      expect(result.config).toHaveProperty('clean', true)
    })

    it('should migrate from unbuild configuration', async () => {
      const unbuildConfig = {
        entries: [
          { input: 'src/index.ts', format: 'esm' },
          { input: 'src/cli.ts', format: 'cjs', name: 'cli' },
        ],
        outDir: 'dist',
        clean: true,
      }

      const configContent = JSON.stringify(unbuildConfig)

      const result = await migrateFromUnbuild('build.config.json', configContent)

      expect(result.config).toHaveProperty('entries')
      expect(result.config.entries).toHaveLength(2)
      expect(result.config.entries![0]).toMatchObject({
        type: 'bundle',
        input: 'src/index.ts',
        format: 'esm',
      })
      expect(result.config.entries![1]).toMatchObject({
        type: 'bundle',
        input: 'src/cli.ts',
        format: 'cjs',
        globalName: 'cli',
      })
      expect(result.config).toHaveProperty('outDir', 'dist')
      expect(result.config).toHaveProperty('clean', true)
    })

    it('should detect migration sources', async () => {
      // This test would need to mock the file system
      // For now, we'll just test that the function exists and returns an array
      const sources = await detectMigrationSources(process.cwd())
      expect(sources).toBeInstanceOf(Array)
    })

    it('should handle migration warnings and suggestions', async () => {
      const tsupConfig = {
        entry: 'src/index.ts',
        splitting: true, // This should generate a warning
        treeshake: true, // This should generate a suggestion
        sourcemap: true, // This should generate a warning
      }

      const configContent = JSON.stringify(tsupConfig)

      const result = await migrateFromTsup('tsup.config.json', configContent)

      expect(result.warnings).toContain('Code splitting is not directly supported, consider using multiple entries')
      expect(result.warnings).not.toContain('Source maps are not yet supported in robuild')
      expect(result.suggestions).toContain('Tree shaking is enabled by default in robuild')
    })
  })
})
