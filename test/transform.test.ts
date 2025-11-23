import { describe, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * Transform mode tests
 * Tests for transforming files while preserving directory structure
 */
describe('transform mode', () => {
  describe('basic transformation', () => {
    it('should transform directory structure', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `export { add } from './math'`,
          'src/math.ts': `export function add(a: number, b: number) { return a + b }`,
          'src/utils/format.ts': `export function format(v: any) { return String(v) }`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
            },
          ],
        },
      })
    })

    it('should transform single file', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `export const value = 42`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
            },
          ],
        },
      })
    })

    it('should copy non-TypeScript files', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `export const version = "1.0.0"`,
          'src/data.json': `{"key": "value"}`,
          'src/README.md': `# Documentation`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
            },
          ],
        },
      })
    })
  })

  describe('typeScript/JSX support', () => {
    it('should transform TSX files', async (context) => {
      await testBuild({
        context,
        files: {
          'src/Button.tsx': `
            export interface ButtonProps {
              label: string
            }
            export default function Button(props: ButtonProps) {
              return <button>{props.label}</button>
            }
          `,
          'src/index.ts': `export { default as Button } from './Button'`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
            },
          ],
        },
      })
    })

    it('should transform JSX files', async (context) => {
      await testBuild({
        context,
        files: {
          'src/Component.jsx': `
            export default function Component() {
              return <div>Hello</div>
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
            },
          ],
        },
      })
    })
  })

  describe('optimization', () => {
    it('should minify transformed files', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `
            export function longFunctionName(parameter: string): string {
              const result = parameter.toUpperCase()
              return result
            }
          `,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              minify: true,
            },
          ],
        },
      })
    })

    it('should generate sourcemaps', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `export const value = 42`,
          'src/helper.ts': `export function double(n: number) { return n * 2 }`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              sourcemap: true,
            },
          ],
        },
      })
    })
  })

  describe('path resolution', () => {
    it('should handle path aliases', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `import { helper } from '@/utils/helper'\nexport { helper }`,
          'src/utils/helper.ts': `export function helper() { return 'help' }`,
        },
        config: cwd => ({
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              alias: {
                '@': `${cwd}/src`,
              },
            },
          ],
        }),
      })
    })

    it('should resolve relative imports', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `export { util } from './utils/util'`,
          'src/utils/util.ts': `export const util = 'utility'`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
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
          'src/index.ts': `export const lib = "my-lib"`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              banner: '// Copyright 2024',
              footer: '// End',
            },
          ],
        },
      })
    })

    it('should handle target option', async (context) => {
      await testBuild({
        context,
        files: {
          'src/modern.ts': `
            export const arrow = () => 'arrow'
            export const optional = (x?: string) => x ?? 'default'
          `,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              target: 'es2015',
            },
          ],
        },
      })
    })

    it('should handle node protocol', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `
            import { readFile } from 'fs/promises'
            import path from 'path'
            export { readFile, path }
          `,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              nodeProtocol: true,
            },
          ],
        },
      })
    })
  })

  describe('clean option', () => {
    it('should clean output directory', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `export const value = 1`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              clean: false,
            },
          ],
        },
      })

      // Build again with clean
      await testBuild({
        context,
        files: {
          'src/index.ts': `export const value = 2`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              clean: true,
            },
          ],
        },
        clean: false, // Don't clean test dir
      })
    })
  })
})
