import type { TransformEntry } from '../../src/types'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getNodeModulesDependencies,
  isInNodeModules,
  unbundleTransform,
} from '../../src/builders/unbundle'

describe('unbundle', () => {
  const testDir = join(process.cwd(), 'test/temp/unbundle-test')

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  describe('isInNodeModules', () => {
    it('should return true for paths containing node_modules', () => {
      expect(isInNodeModules('/project/node_modules/pkg/index.js')).toBe(true)
      expect(isInNodeModules('node_modules/pkg')).toBe(true)
      expect(isInNodeModules('./node_modules/test')).toBe(true)
    })

    it('should return false for paths not containing node_modules', () => {
      expect(isInNodeModules('/project/src/index.js')).toBe(false)
      expect(isInNodeModules('./src/utils.ts')).toBe(false)
      expect(isInNodeModules('dist/bundle.js')).toBe(false)
    })
  })

  describe('getNodeModulesDependencies', () => {
    it('should return empty array when node_modules does not exist', async () => {
      const deps = await getNodeModulesDependencies('/non/existent/path')
      expect(deps).toEqual([])
    })

    it('should return regular dependencies', async () => {
      const nodeModulesPath = join(testDir, 'node_modules')
      await mkdir(join(nodeModulesPath, 'lodash'), { recursive: true })
      await mkdir(join(nodeModulesPath, 'express'), { recursive: true })

      const deps = await getNodeModulesDependencies(testDir)
      expect(deps).toContain('lodash')
      expect(deps).toContain('express')
    })

    it('should return scoped dependencies', async () => {
      const nodeModulesPath = join(testDir, 'node_modules')
      await mkdir(join(nodeModulesPath, '@types/node'), { recursive: true })
      await mkdir(join(nodeModulesPath, '@vue/reactivity'), { recursive: true })

      const deps = await getNodeModulesDependencies(testDir)
      expect(deps).toContain('@types/node')
      expect(deps).toContain('@vue/reactivity')
    })

    it('should handle mixed dependencies', async () => {
      const nodeModulesPath = join(testDir, 'node_modules')
      await mkdir(join(nodeModulesPath, 'lodash'), { recursive: true })
      await mkdir(join(nodeModulesPath, '@types/node'), { recursive: true })

      const deps = await getNodeModulesDependencies(testDir)
      expect(deps).toContain('lodash')
      expect(deps).toContain('@types/node')
    })

    it('should skip files (non-directories) in node_modules', async () => {
      const nodeModulesPath = join(testDir, 'node_modules')
      await mkdir(nodeModulesPath, { recursive: true })
      await writeFile(join(nodeModulesPath, '.package-lock.json'), '{}')
      await mkdir(join(nodeModulesPath, 'lodash'), { recursive: true })

      const deps = await getNodeModulesDependencies(testDir)
      expect(deps).toContain('lodash')
      expect(deps).not.toContain('.package-lock.json')
    })

    it('should skip files in scoped package directories', async () => {
      const nodeModulesPath = join(testDir, 'node_modules')
      const scopedPath = join(nodeModulesPath, '@types')
      await mkdir(scopedPath, { recursive: true })
      await writeFile(join(scopedPath, '.gitignore'), '')
      await mkdir(join(scopedPath, 'node'), { recursive: true })

      const deps = await getNodeModulesDependencies(testDir)
      expect(deps).toContain('@types/node')
      expect(deps).not.toContain('@types/.gitignore')
    })

    it('should return empty array on error', async () => {
      // Create a file instead of directory to cause an error
      await writeFile(join(testDir, 'node_modules'), 'not a directory')

      const deps = await getNodeModulesDependencies(testDir)
      expect(deps).toEqual([])
    })
  })

  describe('unbundleTransform', () => {
    it('should transform TypeScript files to JavaScript', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(
        join(inputDir, 'index.ts'),
        'export const value: number = 42;',
      )

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      expect(existsSync(join(outputDir, 'index.mjs'))).toBe(true)
      const content = await readFile(join(outputDir, 'index.mjs'), 'utf-8')
      expect(content).toContain('export const value')
    })

    it('should handle nested directories', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(join(inputDir, 'utils'), { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), 'export { helper } from "./utils/helper"')
      await writeFile(join(inputDir, 'utils/helper.ts'), 'export function helper() { return "help" }')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      expect(existsSync(join(outputDir, 'index.mjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'utils/helper.mjs'))).toBe(true)
    })

    it('should skip node_modules when configured', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(join(inputDir, 'node_modules/pkg'), { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), 'export const x = 1')
      await writeFile(join(inputDir, 'node_modules/pkg/index.ts'), 'export const y = 2')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
        skipNodeModules: true,
      }

      await unbundleTransform(ctx, entry)

      expect(existsSync(join(outputDir, 'index.mjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'node_modules'))).toBe(false)
    })

    it('should use default output directory when not specified', async () => {
      const inputDir = join(testDir, 'src')
      const defaultOutputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), 'export const x = 1')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
      }

      await unbundleTransform(ctx, entry)

      expect(existsSync(join(defaultOutputDir, 'index.mjs'))).toBe(true)
    })

    it('should skip non-transformable files', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), 'export const x = 1')
      await writeFile(join(inputDir, 'data.json'), '{"key": "value"}')
      await writeFile(join(inputDir, 'readme.md'), '# Readme')
      await writeFile(join(inputDir, 'styles.css'), '.class { color: red }')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      // TypeScript file should be transformed
      expect(existsSync(join(outputDir, 'index.mjs'))).toBe(true)
      // Non-transformable files should not be in output
      expect(existsSync(join(outputDir, 'data.json'))).toBe(false)
      expect(existsSync(join(outputDir, 'readme.md'))).toBe(false)
      expect(existsSync(join(outputDir, 'styles.css'))).toBe(false)
    })

    it('should transform all JS/TS extensions', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), 'export const ts = 1')
      await writeFile(join(inputDir, 'jsx.jsx'), 'export const jsx = 1')
      await writeFile(join(inputDir, 'tsx.tsx'), 'export const tsx = 1')
      await writeFile(join(inputDir, 'mjs.mjs'), 'export const mjs = 1')
      await writeFile(join(inputDir, 'cjs.cjs'), 'module.exports = { cjs: 1 }')
      await writeFile(join(inputDir, 'mts.mts'), 'export const mts = 1')
      await writeFile(join(inputDir, 'cts.cts'), 'export const cts = 1')
      await writeFile(join(inputDir, 'js.js'), 'export const js = 1')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      expect(existsSync(join(outputDir, 'index.mjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'jsx.mjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'tsx.mjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'mjs.mjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'cjs.cjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'mts.mjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'cts.cjs'))).toBe(true)
      expect(existsSync(join(outputDir, 'js.mjs'))).toBe(true)
    })

    it('should transform relative imports', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), `import { helper } from './helper.ts'\nexport { helper }`)
      await writeFile(join(inputDir, 'helper.ts'), 'export function helper() {}')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      const content = await readFile(join(outputDir, 'index.mjs'), 'utf-8')
      // Should transform .ts extension to .mjs
      expect(content).toContain('./helper.mjs')
    })

    it('should transform require calls', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.cjs'), `const helper = require('./helper.cts')`)
      await writeFile(join(inputDir, 'helper.cts'), 'module.exports = {}')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      const content = await readFile(join(outputDir, 'index.cjs'), 'utf-8')
      expect(content).toContain('./helper.cjs')
    })

    it('should add .js extension to imports without extension', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), `import { helper } from './helper'\nexport { helper }`)
      await writeFile(join(inputDir, 'helper.ts'), 'export function helper() {}')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      const content = await readFile(join(outputDir, 'index.mjs'), 'utf-8')
      expect(content).toContain('./helper.js')
    })

    it('should preserve non-relative imports', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), `import lodash from 'lodash'\nexport { lodash }`)

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      const content = await readFile(join(outputDir, 'index.mjs'), 'utf-8')
      expect(content).toContain(`from 'lodash'`)
    })

    it('should handle CJS format output', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), 'export const x = 1')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
        format: 'cjs',
      }

      await unbundleTransform(ctx, entry)

      expect(existsSync(join(outputDir, 'index.cjs'))).toBe(true)
    })

    it('should handle format array', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), 'export const x = 1')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
        format: ['cjs'],
      }

      await unbundleTransform(ctx, entry)

      expect(existsSync(join(outputDir, 'index.cjs'))).toBe(true)
    })

    it('should log warning on file processing error', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      // Create a directory with .ts extension to cause an error
      await mkdir(join(inputDir, 'broken.ts'), { recursive: true })

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      // Should not throw, just log warning
      await unbundleTransform(ctx, entry)
    })

    it('should preserve .mjs extension for .mts files', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), `import { helper } from './helper.mts'`)
      await writeFile(join(inputDir, 'helper.mts'), 'export function helper() {}')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      const content = await readFile(join(outputDir, 'index.mjs'), 'utf-8')
      expect(content).toContain('./helper.mjs')
    })

    it('should handle .tsx extension imports', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), `import { Component } from './Component.tsx'`)
      await writeFile(join(inputDir, 'Component.tsx'), 'export function Component() { return null }')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      const content = await readFile(join(outputDir, 'index.mjs'), 'utf-8')
      expect(content).toContain('./Component.mjs')
    })

    it('should preserve .js and .jsx extensions', async () => {
      const inputDir = join(testDir, 'src')
      const outputDir = join(testDir, 'dist')

      await mkdir(inputDir, { recursive: true })
      await writeFile(join(inputDir, 'index.ts'), `import { a } from './helper.js'\nimport { b } from './comp.jsx'`)
      await writeFile(join(inputDir, 'helper.js'), 'export const a = 1')
      await writeFile(join(inputDir, 'comp.jsx'), 'export const b = 2')

      const ctx = { pkgDir: testDir } as any
      const entry: TransformEntry = {
        type: 'transform',
        input: inputDir,
        outDir: outputDir,
      }

      await unbundleTransform(ctx, entry)

      const content = await readFile(join(outputDir, 'index.mjs'), 'utf-8')
      // .js and .jsx should be preserved as-is
      expect(content).toContain('./helper.js')
      expect(content).toContain('./comp.jsx')
    })
  })
})
