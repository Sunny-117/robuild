import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { testBuild } from './helpers'

describe('advanced build features', () => {
  describe('file loaders', () => {
    it('should handle different file types with loaders', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import config from './config.json'
            import styles from './styles.css'
            import readme from './README.md'
            import logo from './logo.png'
            import icon from './icon.svg'

            export { config, styles, readme, logo, icon }
          `,
          'config.json': JSON.stringify({ version: '1.0.0', name: 'test' }),
          'styles.css': '.button { color: blue; }',
          'README.md': '# Hello World\nThis is a test.',
          'logo.png': 'fake-png-data',
          'icon.svg': '<svg><circle r="10"/></svg>',
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              loaders: {
                '.json': { loader: 'json' },
                '.css': { loader: 'text' },
                '.md': { loader: 'text' },
                '.png': { loader: 'asset' },
                '.svg': { loader: 'dataurl' },
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('version')
          expect(output).toContain('color: blue')
          expect(output).toContain('Hello World')
        },
      })
    })

    it('should handle custom loader options', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import styles from './styles.css'
            import image from './image.png'
            export { styles, image }
          `,
          'styles.css': '.test { background: red; }',
          'image.png': 'fake-image-data',
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              loaders: {
                '.css': {
                  loader: 'text',
                  options: { minify: true },
                },
                '.png': {
                  loader: 'asset',
                  options: { publicPath: '/assets/' },
                },
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('background: red')
        },
      })
    })
  })

  describe('CommonJS default export handling', () => {
    it('should handle cjsDefault auto mode', async (context) => {
      await testBuild({
        context,
        files: {
          'index.js': `
            module.exports = { hello: 'world' }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.js',
              format: ['esm'],
              cjsDefault: 'auto',
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('export')
        },
      })
    })

    it('should handle mixed CommonJS exports', async (context) => {
      await testBuild({
        context,
        files: {
          'index.js': `
            exports.name = 'robuild'
            exports.version = '1.0.0'
            module.exports.default = 'main'
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.js',
              format: ['esm'],
              cjsDefault: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('export')
        },
      })
    })
  })

  describe('compatibility shims', () => {
    it('should add Node.js shims for browser platform', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            const path = __dirname
            const file = __filename
            const env = process.env.NODE_ENV
            export { path, file, env }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              platform: 'browser',
              shims: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('__dirname')
          expect(output).toContain('process')
        },
      })
    })

    it('should handle selective shims', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            const dir = __dirname
            const req = require
            export { dir, req }
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              platform: 'neutral',
              shims: {
                dirname: true,
                require: true,
                exports: false,
                env: false,
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('__dirname')
        },
      })
    })
  })

  describe('skip node modules', () => {
    it('should skip node_modules when enabled', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import lodash from 'lodash'
            import { helper } from './utils'
            export { lodash, helper }
          `,
          'utils.ts': `export const helper = () => 'help'`,
          'package.json': JSON.stringify({
            dependencies: { lodash: '^4.0.0' },
          }),
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              skipNodeModules: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('import lodash from "lodash"')
          expect(output).toContain('helper')
        },
      })
    })

    it('should bundle everything when skipNodeModules is false', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { helper } from './utils'
            export { helper }
          `,
          'utils.ts': `export const helper = () => 'help'`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              skipNodeModules: false,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('helper')
          expect(output).not.toContain('import')
        },
      })
    })
  })

  describe('unbundle mode', () => {
    it('should preserve file structure in unbundle mode', async (context) => {
      await testBuild({
        context,
        files: {
          'src/index.ts': `export { helper } from './utils/helper'`,
          'src/utils/helper.ts': `export const helper = () => 'help'`,
          'src/components/Button.tsx': `export const Button = () => <button>Click</button>`,
        },
        config: {
          entries: [
            {
              type: 'transform',
              input: './src/',
              outDir: './dist/',
              unbundle: true,
            },
          ],
        },
        afterBuild: async (outputDir) => {
          // Unbundle mode outputs .mjs files for ESM format
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'utils/helper.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'components/Button.mjs'))).toBe(true)
        },
      })
    })
  })

  describe('rolldown config passthrough', () => {
    it('should pass through rolldown config with highest priority', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { helper } from './utils'
            export { helper }
          `,
          'utils.ts': `export const helper = () => 'help'`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              platform: 'node', // This should be overridden
              rolldown: {
                platform: 'neutral', // This should take precedence
                logLevel: 'debug',
                treeshake: false,
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('helper')
        },
      })
    })

    it('should handle advanced tree shaking config', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            import { used } from './utils'
            export { used }
          `,
          'utils.ts': `
            export const used = 'used'
            export const unused = 'unused'
          `,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              rolldown: {
                treeshake: {
                  moduleSideEffects: false,
                  propertyReadSideEffects: false,
                },
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('used')
          expect(output).not.toContain('unused')
        },
      })
    })

    it('should handle output configuration', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `export const hello = 'world'`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: ['esm'],
              rolldown: {
                output: {
                  sourcemap: true,
                },
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          expect(existsSync(path.join(outputDir, 'index.mjs'))).toBe(true)
          expect(existsSync(path.join(outputDir, 'index.mjs.map'))).toBe(true)
          const output = await readFile(path.join(outputDir, 'index.mjs'), 'utf-8')
          expect(output).toContain('hello')
        },
      })
    })
  })
})
