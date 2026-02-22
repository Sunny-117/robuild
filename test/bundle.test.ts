import { describe, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * Bundle mode tests
 * Tests for bundling TypeScript/JavaScript files into single output files
 */
describe('bundle mode', () => {
  describe('basic bundling', () => {
    it('should bundle simple file', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
        },
        config: {
          entries: [{ type: 'bundle', input: 'index.ts' }],
        },
      })
    })

    it('should bundle with TypeScript types', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export interface User {
              name: string
              age: number
            }
            export function greet(user: User): string {
              return \`Hello, \${user.name}!\`
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              dts: true,
            },
          ],
        },
      })
    })

    it('should bundle multiple entries', async (context) => {
      await testBuild({
        context,
        files: {
          'entry1.ts': `export const a = 1`,
          'entry2.ts': `export const b = 2`,
        },
        config: {
          entries: [
            { type: 'bundle', input: 'entry1.ts', outDir: 'dist/a' },
            { type: 'bundle', input: 'entry2.ts', outDir: 'dist/b' },
          ],
        },
        outDir: 'dist',
      })
    })
  })

  describe('output formats', () => {
    it('should output ESM format', async (context) => {
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
              format: 'esm',
            },
          ],
        },
      })
    })

    it('should output CJS format', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export default function hello() { return "hello" }`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'cjs',
            },
          ],
        },
      })
    })

    it('should output IIFE format', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const PI = 3.14`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'iife',
              globalName: 'MyLib',
              platform: 'browser',
            },
          ],
        },
      })
    })

    it('should output multiple formats', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export function add(a: number, b: number) { return a + b }`,
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
      })
    })
  })

  describe('optimization', () => {
    it('should minify output', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export function calculate(numbers: number[]): number {
              return numbers.reduce((sum, num) => sum + num, 0)
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              minify: true,
            },
          ],
        },
      })
    })

    it('should generate sourcemap', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const version = "1.0.0"`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              sourcemap: true,
            },
          ],
        },
      })
    })
  })

  describe('external dependencies', () => {
    it('should handle external dependencies', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import React from 'react'
            export { React }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              external: ['react'],
            },
          ],
        },
      })
    })

    it('should handle regex external patterns', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { foo } from '@scope/package'
            export { foo }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              external: [/^@scope\//],
            },
          ],
        },
      })
    })
  })

  describe('customization', () => {
    it('should add banner and footer', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const lib = "my-lib"`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              banner: '// Copyright 2024',
              footer: '// End',
            },
          ],
        },
      })
    })

    it('should handle environment variables', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const version = process.env.VERSION`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              env: { VERSION: '1.0.0' },
            },
          ],
        },
      })
    })

    it('should handle define constants', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const mode = BUILD_MODE`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              define: { BUILD_MODE: '"production"' },
            },
          ],
        },
      })
    })

    it('should use custom fileName', async (context) => {
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
              format: 'iife',
              globalName: 'MyLib',
              fileName: 'custom-bundle.min.js',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const { existsSync } = await import('node:fs')
          const { join } = await import('node:path')
          expect(existsSync(join(outputDir, 'custom-bundle.min.js'))).toBe(true)
        },
      })
    })
  })

  describe('platform specific', () => {
    it('should target node platform', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const platform = "node"`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              platform: 'node',
            },
          ],
        },
      })
    })

    it('should target browser platform', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const platform = "browser"`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              platform: 'browser',
            },
          ],
        },
      })
    })

    it('should handle node protocol', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { readFile } from 'fs/promises'
            export { readFile }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              nodeProtocol: true,
            },
          ],
        },
      })
    })
  })

  describe('dtsOnly mode', () => {
    it('should only generate .d.ts files when dtsOnly is true', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export interface User {
              name: string
              age: number
            }
            export function greet(user: User): string {
              return \`Hello, \${user.name}!\`
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              dtsOnly: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const { readdirSync } = await import('node:fs')
          const files = readdirSync(outputDir)
          // Should only have .d.ts files, no .mjs files
          const jsFiles = files.filter(f => f.endsWith('.mjs') || f.endsWith('.js') || f.endsWith('.cjs'))
          const dtsFiles = files.filter(f => f.endsWith('.d.ts') || f.endsWith('.d.mts'))
          expect(jsFiles.length).toBe(0)
          expect(dtsFiles.length).toBeGreaterThan(0)
        },
      })
    })

    it('should force ESM format in dtsOnly mode even if cjs is specified', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export const value = 42
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'cjs',
              dtsOnly: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const { readdirSync } = await import('node:fs')
          const files = readdirSync(outputDir)
          // Should only have .d.ts files
          const jsFiles = files.filter(f => f.endsWith('.mjs') || f.endsWith('.js') || f.endsWith('.cjs'))
          const dtsFiles = files.filter(f => f.endsWith('.d.ts') || f.endsWith('.d.mts'))
          expect(jsFiles.length).toBe(0)
          expect(dtsFiles.length).toBeGreaterThan(0)
        },
      })
    })
  })
})
