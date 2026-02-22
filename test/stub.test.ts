import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * Stub mode tests
 * Tests for development stub mode that creates re-export files instead of bundling
 */
describe('stub mode', () => {
  describe('bundle stub', () => {
    it('should create stub file that re-exports source', async (context) => {
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
              stub: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const stubPath = path.join(outputDir, 'index.mjs')
          expect(existsSync(stubPath)).toBe(true)

          const content = readFileSync(stubPath, 'utf-8')
          // Stub should re-export from source file with absolute path
          expect(content).toContain('export * from')
          expect(content).toContain('index.ts')
        },
      })
    })

    it('should create .d.mts stub for types', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export interface User {
              name: string
            }
            export const version = "1.0.0"
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              stub: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const dtsPath = path.join(outputDir, 'index.d.mts')
          expect(existsSync(dtsPath)).toBe(true)

          const content = readFileSync(dtsPath, 'utf-8')
          expect(content).toContain('export * from')
        },
      })
    })

    it('should handle default export in stub', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            export function greet(name: string) {
              return \`Hello, \${name}!\`
            }
            export default greet
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              stub: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const stubPath = path.join(outputDir, 'index.mjs')
          const content = readFileSync(stubPath, 'utf-8')

          // Should export both named and default
          expect(content).toContain('export * from')
          expect(content).toContain('export { default }')
        },
      })
    })

    it('should preserve shebang in stub file', async (context) => {
      await testBuild({
        context,
        files: {
          'cli.ts': `#!/usr/bin/env node
export function main() {
  console.log("Hello CLI")
}
main()
`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'cli.ts',
              stub: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const stubPath = path.join(outputDir, 'cli.mjs')
          const content = readFileSync(stubPath, 'utf-8')

          // Shebang should be preserved
          expect(content.startsWith('#!/usr/bin/env node')).toBe(true)
        },
      })
    })

    it('should make stub executable when source has shebang', async (context) => {
      await testBuild({
        context,
        files: {
          'cli.ts': `#!/usr/bin/env node
export const cli = true
`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'cli.ts',
              stub: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const stubPath = path.join(outputDir, 'cli.mjs')
          const stats = statSync(stubPath)

          // Check if file has executable permission (on Unix-like systems)
          if (process.platform !== 'win32') {
            const isExecutable = (stats.mode & 0o111) !== 0
            expect(isExecutable).toBe(true)
          }
        },
      })
    })
  })

  describe('stub with multiple entries', () => {
    it('should create stubs for multiple entries', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const main = "main"`,
          'utils.ts': `export const util = "util"`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: { index: 'index.ts', utils: 'utils.ts' },
              stub: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'utils.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.d.mts'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'utils.d.mts'))).toBe(true)
        },
      })
    })
  })

  describe('stub uses absolute paths', () => {
    it('should use absolute path in re-export', async (context) => {
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
              stub: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const stubPath = path.join(outputDir, 'index.mjs')
          const content = readFileSync(stubPath, 'utf-8')

          // Should use absolute path (starts with /)
          expect(content).toMatch(/export \* from ["']\//)
        },
      })
    })
  })
})
