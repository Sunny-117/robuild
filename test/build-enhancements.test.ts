import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * Build enhancements tests
 * Tests for copy, hash, fixedExtension, outExtensions, and advanced banner/footer
 */
describe('build enhancements', () => {
  describe('file copy functionality', () => {
    it('should copy simple file paths', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
          'README.md': '# My Library\n\nDocumentation here.',
          'LICENSE': 'MIT License',
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              copy: ['README.md', 'LICENSE'],
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'README.md'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'LICENSE'))).toBe(true)
          expect(readFileSync(path.join(outputDir, 'README.md'), 'utf-8')).toContain('My Library')
        },
      })
    })

    it('should copy with object config (from/to)', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = "world"`,
          'config.example.json': '{"key": "value"}',
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              // Note: when using {from, to}, 'to' is relative to cwd, not outDir
              copy: [
                { from: 'config.example.json', to: 'dist/config.json' },
              ],
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'config.json'))).toBe(true)
          expect(readFileSync(path.join(outputDir, 'config.json'), 'utf-8')).toContain('"key"')
        },
      })
    })

    it('should copy in transform mode', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `export const value = 42`,
          'assets/logo.txt': 'LOGO_PLACEHOLDER',
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: 'src',
              outDir: 'dist',
              // Simple string paths are copied to outDir with basename
              copy: ['assets/logo.txt'],
            },
          ],
        },
        afterBuild: async (outputDir) => {
          // Simple paths are copied to outDir with basename only
          expect(existsSync(path.join(outputDir, 'logo.txt'))).toBe(true)
        },
      })
    })
  })

  describe('file hash support', () => {
    it('should add hash to output filename', async (context) => {
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
              hash: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const { readdirSync } = await import('node:fs')
          const files = readdirSync(outputDir)
          // Should have a file with hash pattern: index-xxxxxxxx.mjs
          const hashedFile = files.find(f => /^index-[a-f0-9]{8}\.mjs$/.test(f))
          expect(hashedFile).toBeDefined()
        },
      })
    })

    it('should generate different hash for different content', async (context) => {
      const hashes: string[] = []

      // Build first version
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
              hash: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const { readdirSync } = await import('node:fs')
          const files = readdirSync(outputDir)
          const hashedFile = files.find(f => /^index-[a-f0-9]{8}\.mjs$/.test(f))
          if (hashedFile) {
            const match = hashedFile.match(/index-([a-f0-9]{8})\.mjs/)
            if (match)
              hashes.push(match[1])
          }
        },
      })

      // Build second version with different content
      await testBuild({
        context,
        files: {
          'index.ts': `export const version = "2.0.0"`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              hash: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const { readdirSync } = await import('node:fs')
          const files = readdirSync(outputDir)
          const hashedFile = files.find(f => /^index-[a-f0-9]{8}\.mjs$/.test(f))
          if (hashedFile) {
            const match = hashedFile.match(/index-([a-f0-9]{8})\.mjs/)
            if (match)
              hashes.push(match[1])
          }
        },
        clean: false,
      })

      // Hashes should be different
      expect(hashes.length).toBe(2)
      expect(hashes[0]).not.toBe(hashes[1])
    })
  })

  describe('extension control', () => {
    it('should use fixed extensions (.mjs/.cjs)', async (context) => {
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
              format: ['esm', 'cjs'],
              fixedExtension: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.cjs'))).toBe(true)
        },
      })
    })

    // Note: outExtensions function is defined in types but not implemented in bundle.ts
    // This test is skipped until the feature is implemented
    it.skip('should use custom extensions via outExtensions function', async (context) => {
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
              format: ['esm', 'cjs'],
              // outExtensions returns { js?: string, dts?: string }
              outExtensions: (format: string) => {
                if (format === 'esm')
                  return { js: 'esm.js' }
                if (format === 'cjs')
                  return { js: 'common.js' }
                return {}
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.esm.js'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.common.js'))).toBe(true)
        },
      })
    })
  })

  describe('advanced banner/footer', () => {
    it('should add format-specific banner', async (context) => {
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
              format: ['esm', 'cjs'],
              banner: {
                js: '/* Universal Banner */',
                cjs: '/* CommonJS Banner */',
                esm: '/* ES Module Banner */',
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const esmContent = readFileSync(path.join(outputDir, 'index.mjs'), 'utf-8')
          const cjsContent = readFileSync(path.join(outputDir, 'index.cjs'), 'utf-8')

          expect(esmContent).toContain('/* ES Module Banner */')
          expect(cjsContent).toContain('/* CommonJS Banner */')
        },
      })
    })

    it('should add format-specific footer', async (context) => {
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
              format: ['esm', 'cjs'],
              footer: {
                esm: '/* ESM End */',
                cjs: '/* CJS End */',
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const esmContent = readFileSync(path.join(outputDir, 'index.mjs'), 'utf-8')
          const cjsContent = readFileSync(path.join(outputDir, 'index.cjs'), 'utf-8')

          expect(esmContent).toContain('/* ESM End */')
          expect(cjsContent).toContain('/* CJS End */')
        },
      })
    })

    it('should support dynamic banner with package info', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const lib = "my-lib"`,
          'package.json': JSON.stringify({
            name: 'test-lib',
            version: '1.2.3',
            author: 'Test Author',
            license: 'MIT',
          }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              banner: `/*!
 * test-lib v1.2.3
 * (c) ${new Date().getFullYear()} Test Author
 * Released under the MIT License.
 */`,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const content = readFileSync(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(content).toContain('test-lib v1.2.3')
          expect(content).toContain('MIT License')
        },
      })
    })
  })

  describe('node protocol handling', () => {
    it('should add node: prefix to built-in modules', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { resolve } from 'path'
            import { createHash } from 'crypto'
            export { resolve, createHash }
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
        afterBuild: async (outputDir) => {
          const content = readFileSync(path.join(outputDir, 'index.mjs'), 'utf-8')
          // nodeProtocol adds 'node:' prefix to top-level builtin modules
          expect(content).toContain('node:path')
          expect(content).toContain('node:crypto')
        },
      })
    })

    it('should strip node: prefix when nodeProtocol is strip', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { resolve } from 'node:path'
            import { createHash } from 'node:crypto'
            export { resolve, createHash }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              nodeProtocol: 'strip',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const content = readFileSync(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(content).not.toContain('node:path')
          expect(content).not.toContain('node:crypto')
          expect(content).toContain('"path"')
          expect(content).toContain('"crypto"')
        },
      })
    })
  })

  describe('combined build flow', () => {
    it('should handle complete build flow with all enhancements', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { resolve } from 'path'
            export { resolve }
            export const version = "1.0.0"
          `,
          'README.md': '# My Library',
          'LICENSE': 'MIT',
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm', 'cjs'],
              banner: '/* My Library v1.0.0 */',
              footer: '/* End */',
              fixedExtension: true,
              nodeProtocol: true,
              copy: ['README.md', 'LICENSE'],
            },
          ],
        },
        afterBuild: async (outputDir) => {
          // Check ESM output
          const esmContent = readFileSync(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(esmContent).toContain('/* My Library v1.0.0 */')
          expect(esmContent).toContain('/* End */')
          expect(esmContent).toContain('node:path')

          // Check CJS output
          expect(existsSync(path.join(outputDir, 'index.cjs'))).toBe(true)

          // Check copied files
          expect(existsSync(path.join(outputDir, 'README.md'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'LICENSE'))).toBe(true)
        },
      })
    })
  })
})
