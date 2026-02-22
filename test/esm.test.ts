import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * ESM compatibility tests
 * Tests for ESM output, multi-format builds, extensions, and ESM-specific features
 */
describe('esm compatibility', () => {
  describe('native ESM output', () => {
    it('should generate ESM format by default', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export function add(a: number, b: number): number {
              return a + b
            }
            export const version = '1.0.0'
          `,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('export')
          expect(output).toContain('function add')
        },
      })
    })

    it('should use .mjs extension for ESM output', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })
  })

  describe('multi-format support', () => {
    it('should output ESM and CJS formats together', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export function greet(name: string): string {
              return \`Hello, \${name}!\`
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm', 'cjs'],
            },
          ],
        },
        afterBuild: async (outputDir) => {
          // Should generate both formats
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.cjs'))).toBe(true)

          // ESM should use export
          const esmOutput = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(esmOutput).toContain('export')

          // CJS should use exports
          const cjsOutput = await readFile(path.join(outputDir, 'index.cjs'), 'utf-8')
          expect(cjsOutput).toContain('exports.greet')
        },
      })
    })

    it('should output ESM, CJS, and IIFE formats', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const PI = 3.14159`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm', 'cjs', 'iife'],
              globalName: 'MyMath',
              platform: 'browser',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.cjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.js'))).toBe(true)

          // IIFE should wrap in function
          const iifeOutput = await readFile(path.join(outputDir, 'index.js'), 'utf-8')
          expect(iifeOutput).toContain('MyMath')
        },
      })
    })
  })

  describe('file extensions', () => {
    it('should use .mjs for ESM and .cjs for CJS', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const value = 42`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm', 'cjs'],
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.cjs'))).toBe(true)
        },
      })
    })

    it('should generate .d.mts for ESM type declarations', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export interface Config {
              name: string
              version: string
            }
            export function getConfig(): Config {
              return { name: 'test', version: '1.0.0' }
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              dts: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.d.mts'))).toBe(true)
        },
      })
    })
  })

  describe('package exports', () => {
    it('should generate correct exports for ESM-only build', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const main = "main"`,
          'package.json': JSON.stringify({
            name: 'test-esm-pkg',
            version: '1.0.0',
            type: 'module',
          }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
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
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          expect(pkg.exports).toBeDefined()
          expect(pkg.exports['.']).toBeDefined()
          expect(pkg.exports['.'].import).toContain('.mjs')
          expect(pkg.exports['.'].types).toContain('.d.mts')
        },
      })
    })

    it('should generate conditional exports for dual-format build', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const value = 42`,
          'package.json': JSON.stringify({
            name: 'test-dual-pkg',
            version: '1.0.0',
          }),
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
          const pkgPath = path.join(path.dirname(outputDir), 'package.json')
          const pkgContent = await readFile(pkgPath, 'utf-8')
          const pkg = JSON.parse(pkgContent)

          expect(pkg.exports).toBeDefined()
          expect(pkg.exports['.'].import).toContain('.mjs')
          expect(pkg.exports['.'].require).toContain('.cjs')
          expect(pkg.exports['.'].types).toContain('.d.mts')
        },
      })
    })
  })

  describe('tree shaking', () => {
    it('should remove unused exports with tree shaking', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { used } from './utils'
            export { used }
          `,
          'utils.ts': `
            export const used = 'used value'
            export const unused = 'unused value'
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              treeshake: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('used')
          expect(output).not.toContain('unused value')
        },
      })
    })

    it('should support advanced tree shaking config', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { helper } from './lib'
            export { helper }
          `,
          'lib.ts': `
            export const helper = () => 'helper'
            export const unused = () => 'unused'
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              rolldown: {
                treeshake: {
                  moduleSideEffects: false,
                },
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('helper')
          // unused export should be removed
          expect(output).not.toContain('unused')
        },
      })
    })
  })

  describe('dynamic imports', () => {
    it('should support dynamic import syntax', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export async function loadModule(name: string) {
              const mod = await import(\`./modules/\${name}.js\`)
              return mod.default
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('import(')
        },
      })
    })

    it('should support code splitting with dynamic imports', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export const loadFeature = () => import('./feature')
          `,
          'feature.ts': `
            export const feature = 'feature module'
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              splitting: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          // Check that dynamic import is preserved or chunk is created
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('import(')
        },
      })
    })
  })

  describe('import.meta support', () => {
    it('should preserve import.meta.url', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export const currentUrl = import.meta.url
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('import.meta')
        },
      })
    })
  })

  describe('ESM interoperability', () => {
    it('should handle external ESM dependencies', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import lodash from 'lodash-es'
            export { lodash }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              external: ['lodash-es'],
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('import lodash from "lodash-es"')
        },
      })
    })

    it('should handle named imports from ESM', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { debounce, throttle } from 'lodash-es'
            export { debounce, throttle }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              external: ['lodash-es'],
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('import { debounce, throttle }')
        },
      })
    })
  })

  describe('browser compatibility', () => {
    it('should generate browser-compatible ESM', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export function add(a: number, b: number): number {
              return a + b
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              platform: 'browser',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('export')
          // Should not contain Node.js specific code
          expect(output).not.toContain('require(')
          expect(output).not.toContain('__dirname')
        },
      })
    })

    it('should generate IIFE for legacy browser support', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export const multiply = (a: number, b: number) => a * b
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'iife',
              globalName: 'MathLib',
              platform: 'browser',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.js'), 'utf-8')
          expect(output).toContain('MathLib')
          expect(output).toContain('function')
        },
      })
    })
  })
})
