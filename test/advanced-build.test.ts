import { describe, it, expect } from 'vitest'
import { 
  getLoaderForFile, 
  transformWithLoader, 
  createLoaderPlugin,
  DEFAULT_LOADERS 
} from '../src/features/loaders'
import { 
  detectCommonJSExports, 
  transformCommonJSExports, 
  createCjsDefaultPlugin,
  analyzeModuleFormat 
} from '../src/features/cjs-default'
import { 
  detectShimNeeds, 
  generateShims, 
  createShimsPlugin,
  DEFAULT_SHIMS_CONFIG 
} from '../src/features/shims'
import { 
  isInNodeModules, 
  createSkipNodeModulesPlugin,
  analyzeProjectStructure,
  isUnbundleSuitable 
} from '../src/features/advanced-build'
import { testBuild } from './utils'

describe('Advanced Build Options', () => {
  describe('Loaders', () => {
    it('should detect correct loader for file extensions', () => {
      expect(getLoaderForFile('test.js')).toBe('js')
      expect(getLoaderForFile('test.ts')).toBe('ts')
      expect(getLoaderForFile('test.json')).toBe('json')
      expect(getLoaderForFile('test.css')).toBe('css')
      expect(getLoaderForFile('test.png')).toBe('file')
      expect(getLoaderForFile('test.txt')).toBe('text')
      expect(getLoaderForFile('test.unknown')).toBe('file')
    })

    it('should use custom loaders when provided', () => {
      const customLoaders = {
        '.custom': { loader: 'text' as const }
      }
      
      expect(getLoaderForFile('test.custom', customLoaders)).toBe('text')
      expect(getLoaderForFile('test.js', customLoaders)).toBe('js')
    })

    it('should transform JSON content', async () => {
      const content = '{"name": "test", "version": "1.0.0"}'
      const result = await transformWithLoader('test.json', content, 'json')
      
      expect(result).toBe('export default {"name": "test", "version": "1.0.0"}')
    })

    it('should transform CSS content', async () => {
      const content = '.test { color: red; }'
      const result = await transformWithLoader('test.css', content, 'css')
      
      expect(result).toContain('export default')
      expect(result).toContain('.test { color: red; }')
    })

    it('should transform text content', async () => {
      const content = 'Hello, world!'
      const result = await transformWithLoader('test.txt', content, 'text')
      
      expect(result).toBe('export default "Hello, world!"')
    })

    it('should create loader plugin', () => {
      const plugin = createLoaderPlugin()
      
      expect(plugin.name).toBe('loaders')
      expect(plugin.load).toBeDefined()
    })
  })

  describe('CJS Default Export', () => {
    it('should detect CommonJS exports', () => {
      const cjsCode = 'module.exports = { test: true }'
      const esmCode = 'export default { test: true }'
      const mixedCode = 'module.exports = {}; export const test = 1'
      
      const cjsDetection = detectCommonJSExports(cjsCode)
      const esmDetection = detectCommonJSExports(esmCode)
      const mixedDetection = detectCommonJSExports(mixedCode)
      
      expect(cjsDetection.hasModuleExports).toBe(true)
      expect(cjsDetection.hasDefaultExport).toBe(false)
      
      expect(esmDetection.hasModuleExports).toBe(false)
      expect(esmDetection.hasDefaultExport).toBe(true)
      
      expect(mixedDetection.hasModuleExports).toBe(true)
      expect(mixedDetection.hasNamedExports).toBe(true)
    })

    it('should transform CommonJS to ES modules', () => {
      const cjsCode = 'module.exports = { test: true }'
      const result = transformCommonJSExports(cjsCode, true)
      
      expect(result).toContain('export default')
      expect(result).not.toContain('module.exports')
    })

    it('should transform named exports', () => {
      const cjsCode = 'exports.test = true; exports.value = 42'
      const result = transformCommonJSExports(cjsCode, true)
      
      expect(result).toContain('export const test = true')
      expect(result).toContain('export const value = 42')
    })

    it('should not transform in auto mode when ES modules detected', () => {
      const esmCode = 'export default { test: true }'
      const result = transformCommonJSExports(esmCode, 'auto')
      
      expect(result).toBe(esmCode)
    })

    it('should analyze module format', () => {
      const cjsAnalysis = analyzeModuleFormat('module.exports = {}')
      const esmAnalysis = analyzeModuleFormat('export default {}')
      const unknownAnalysis = analyzeModuleFormat('const test = 1')
      
      expect(cjsAnalysis.format).toBe('cjs')
      expect(esmAnalysis.format).toBe('esm')
      expect(unknownAnalysis.format).toBe('unknown')
    })

    it('should create CJS default plugin', () => {
      const plugin = createCjsDefaultPlugin()
      
      expect(plugin.name).toBe('cjs-default')
      expect(plugin.transform).toBeDefined()
    })
  })

  describe('Shims', () => {
    it('should detect shim needs', () => {
      const nodeCode = 'const path = __dirname; require("fs")'
      const browserCode = 'console.log(process.env.NODE_ENV)'
      const cjsCode = 'module.exports = {}; exports.test = 1'
      
      const nodeNeeds = detectShimNeeds(nodeCode)
      const browserNeeds = detectShimNeeds(browserCode)
      const cjsNeeds = detectShimNeeds(cjsCode)
      
      expect(nodeNeeds.needsDirname).toBe(true)
      expect(nodeNeeds.needsRequire).toBe(true)
      
      expect(browserNeeds.needsEnv).toBe(true)
      
      expect(cjsNeeds.needsExports).toBe(true)
    })

    it('should generate appropriate shims', () => {
      const needs = {
        needsDirname: true,
        needsRequire: false,
        needsExports: false,
        needsEnv: false
      }
      
      const shims = generateShims(DEFAULT_SHIMS_CONFIG, needs)
      
      expect(shims).toContain('__dirname')
      expect(shims).toContain('__filename')
      expect(shims).toContain('createRequire')
    })

    it('should create shims plugin', () => {
      const plugin = createShimsPlugin()
      
      expect(plugin.name).toBe('shims')
      expect(plugin.transform).toBeDefined()
    })

    it('should handle different shim configurations', () => {
      const browserPlugin = createShimsPlugin({ env: true, dirname: false, require: false, exports: false })
      const nodePlugin = createShimsPlugin({ dirname: true, require: true, exports: true, env: false })
      
      expect(browserPlugin.name).toBe('shims')
      expect(nodePlugin.name).toBe('shims')
    })
  })

  describe('Skip Node Modules', () => {
    it('should detect node_modules paths', () => {
      expect(isInNodeModules('/project/node_modules/package/index.js')).toBe(true)
      expect(isInNodeModules('/project/src/index.js')).toBe(false)
      expect(isInNodeModules('node_modules/package')).toBe(true)
    })

    it('should create skip node_modules plugin', () => {
      const plugin = createSkipNodeModulesPlugin()
      
      expect(plugin.name).toBe('skip-node-modules')
      expect(plugin.resolveId).toBeDefined()
    })
  })

  describe('Project Analysis', () => {
    it('should determine unbundle suitability', () => {
      const smallProject = {
        totalFiles: 10,
        jsFiles: 3,
        tsFiles: 2,
        directories: 1,
        hasNodeModules: false,
        recommendUnbundle: false,
        recommendSkipNodeModules: false
      }
      
      const mediumProject = {
        totalFiles: 50,
        jsFiles: 20,
        tsFiles: 15,
        directories: 5,
        hasNodeModules: true,
        recommendUnbundle: true,
        recommendSkipNodeModules: false
      }
      
      expect(isUnbundleSuitable(smallProject)).toBe(false)
      expect(isUnbundleSuitable(mediumProject)).toBe(true)
    })
  })

  describe('Integration Tests', () => {
    it('should build with loader configuration', async (ctx) => {
      await testBuild({
        context: ctx,
        files: {
          'src/index.ts': `
            import data from './data.json'
            import styles from './styles.css'
            export { data, styles }
          `,
          'src/data.json': '{"name": "test", "version": "1.0.0"}',
          'src/styles.css': '.test { color: red; }',
        },
        options: {
          loaders: {
            '.json': { loader: 'json' },
            '.css': { loader: 'css' }
          },
          entries: [{
            type: 'bundle',
            input: 'src/index.ts',
            format: 'esm'
          }]
        }
      })
    })

    it('should build with CJS default handling', async (ctx) => {
      await testBuild({
        context: ctx,
        files: {
          'src/index.js': `
            module.exports = { test: true }
          `,
        },
        options: {
          cjsDefault: true,
          entries: [{
            type: 'bundle',
            input: 'src/index.js',
            format: 'esm'
          }]
        }
      })
    })

    it('should build with shims enabled', async (ctx) => {
      await testBuild({
        context: ctx,
        files: {
          'src/index.js': `
            const path = __dirname
            const fs = require('fs')
            export { path, fs }
          `,
        },
        options: {
          shims: true,
          entries: [{
            type: 'bundle',
            input: 'src/index.js',
            format: 'esm'
          }]
        }
      })
    })

    it('should build with skip node_modules', async (ctx) => {
      await testBuild({
        context: ctx,
        files: {
          'src/index.ts': `
            import { external } from 'external-package'
            export { external }
          `,
        },
        options: {
          skipNodeModules: true,
          entries: [{
            type: 'bundle',
            input: 'src/index.ts',
            format: 'esm'
          }]
        }
      })
    })

    it('should transform with unbundle mode', async (ctx) => {
      await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
          'src/utils/helper.ts': 'export const helper = "world"',
        },
        options: {
          unbundle: true,
          entries: [{
            type: 'transform',
            input: 'src/',
            format: 'esm'
          }]
        }
      })
    })
  })
})
