import { describe, expect, it } from 'vitest'
import {
  analyzeShimRequirements,
  createBrowserShimsPlugin,
  createNodeShimsPlugin,
  createShimsPlugin,
  DEFAULT_SHIMS_CONFIG,
  detectShimNeeds,
  generateShims,
  getPlatformShimsConfig,
  MODULE_EXPORTS_SHIM,
  NODE_GLOBALS_SHIM,
  PROCESS_ENV_SHIM,
  transformWithShims,
} from '../../src/plugins/builtin/shims'

describe('shims plugin', () => {
  describe('DEFAULT_SHIMS_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_SHIMS_CONFIG.dirname).toBe(true)
      expect(DEFAULT_SHIMS_CONFIG.require).toBe(true)
      expect(DEFAULT_SHIMS_CONFIG.exports).toBe(true)
      expect(DEFAULT_SHIMS_CONFIG.env).toBe(false)
    })
  })

  describe('constants', () => {
    it('should export NODE_GLOBALS_SHIM', () => {
      expect(NODE_GLOBALS_SHIM).toContain('fileURLToPath')
      expect(NODE_GLOBALS_SHIM).toContain('__filename')
      expect(NODE_GLOBALS_SHIM).toContain('__dirname')
      expect(NODE_GLOBALS_SHIM).toContain('createRequire')
    })

    it('should export PROCESS_ENV_SHIM', () => {
      expect(PROCESS_ENV_SHIM).toContain('process')
      expect(PROCESS_ENV_SHIM).toContain('env')
    })

    it('should export MODULE_EXPORTS_SHIM', () => {
      expect(MODULE_EXPORTS_SHIM).toContain('module')
      expect(MODULE_EXPORTS_SHIM).toContain('exports')
    })
  })

  describe('detectShimNeeds', () => {
    it('should detect __dirname usage', () => {
      const result = detectShimNeeds('const dir = __dirname')
      expect(result.needsDirname).toBe(true)
    })

    it('should detect __filename usage', () => {
      const result = detectShimNeeds('const file = __filename')
      expect(result.needsDirname).toBe(true)
    })

    it('should detect require usage', () => {
      const result = detectShimNeeds('const fs = require("fs")')
      expect(result.needsRequire).toBe(true)
    })

    it('should detect module.exports usage', () => {
      const result = detectShimNeeds('module.exports = foo')
      expect(result.needsExports).toBe(true)
    })

    it('should detect exports.name usage', () => {
      const result = detectShimNeeds('exports.foo = bar')
      expect(result.needsExports).toBe(true)
    })

    it('should detect process.env usage', () => {
      const result = detectShimNeeds('const mode = process.env.NODE_ENV')
      expect(result.needsEnv).toBe(true)
    })

    it('should ignore patterns in comments', () => {
      const code = `
        // const dir = __dirname
        /* require("fs") */
        const x = 1
      `
      const result = detectShimNeeds(code)
      expect(result.needsDirname).toBe(false)
      expect(result.needsRequire).toBe(false)
    })

    it('should ignore patterns in strings', () => {
      const code = `
        const str1 = "__dirname"
        const str2 = 'require("fs")'
        const str3 = \`module.exports\`
      `
      const result = detectShimNeeds(code)
      expect(result.needsDirname).toBe(false)
      expect(result.needsRequire).toBe(false)
      expect(result.needsExports).toBe(false)
    })

    it('should detect multiple needs', () => {
      const code = `
        const dir = __dirname
        const fs = require("fs")
        module.exports = { dir, fs }
        console.log(process.env.NODE_ENV)
      `
      const result = detectShimNeeds(code)
      expect(result.needsDirname).toBe(true)
      expect(result.needsRequire).toBe(true)
      expect(result.needsExports).toBe(true)
      expect(result.needsEnv).toBe(true)
    })
  })

  describe('generateShims', () => {
    it('should generate dirname shims when needed', () => {
      const needs = { needsDirname: true, needsRequire: false, needsExports: false, needsEnv: false }
      const result = generateShims(DEFAULT_SHIMS_CONFIG, needs)
      expect(result).toContain('__dirname')
    })

    it('should generate require shims when needed', () => {
      const needs = { needsDirname: false, needsRequire: true, needsExports: false, needsEnv: false }
      const result = generateShims(DEFAULT_SHIMS_CONFIG, needs)
      expect(result).toContain('createRequire')
    })

    it('should generate exports shims when needed', () => {
      const needs = { needsDirname: false, needsRequire: false, needsExports: true, needsEnv: false }
      const result = generateShims(DEFAULT_SHIMS_CONFIG, needs)
      expect(result).toContain('module.exports')
    })

    it('should generate env shims when needed and enabled', () => {
      const config = { ...DEFAULT_SHIMS_CONFIG, env: true }
      const needs = { needsDirname: false, needsRequire: false, needsExports: false, needsEnv: true }
      const result = generateShims(config, needs)
      expect(result).toContain('process')
    })

    it('should not generate env shims when disabled', () => {
      const needs = { needsDirname: false, needsRequire: false, needsExports: false, needsEnv: true }
      const result = generateShims(DEFAULT_SHIMS_CONFIG, needs)
      expect(result).not.toContain('process')
    })

    it('should return empty string when no shims needed', () => {
      const needs = { needsDirname: false, needsRequire: false, needsExports: false, needsEnv: false }
      const result = generateShims(DEFAULT_SHIMS_CONFIG, needs)
      expect(result).toBe('')
    })
  })

  describe('transformWithShims', () => {
    it('should prepend shims to code', () => {
      const code = 'const dir = __dirname'
      const result = transformWithShims(code, DEFAULT_SHIMS_CONFIG)
      expect(result).toContain(NODE_GLOBALS_SHIM)
      expect(result).toContain(code)
    })

    it('should return original code when no shims needed', () => {
      const code = 'const x = 1'
      const result = transformWithShims(code, DEFAULT_SHIMS_CONFIG)
      expect(result).toBe(code)
    })
  })

  describe('createShimsPlugin', () => {
    it('should create plugin with default config when true', () => {
      const plugin = createShimsPlugin(true)
      expect(plugin.name).toBe('shims')
      expect(plugin.transform).toBeDefined()
    })

    it('should create disabled plugin when false', () => {
      const plugin = createShimsPlugin(false)
      expect(plugin.name).toBe('shims')
    })

    it('should create plugin with custom config', () => {
      const plugin = createShimsPlugin({ dirname: false, require: true })
      expect(plugin.name).toBe('shims')
    })

    it('should skip non-JS files', async () => {
      const plugin = createShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.css')
      expect(result).toBeNull()
    })

    it('should process .js files', async () => {
      const plugin = createShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.js')
      expect(result).toContain('__dirname')
    })

    it('should process .ts files', async () => {
      const plugin = createShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.ts')
      expect(result).toContain('__dirname')
    })

    it('should process .mjs files', async () => {
      const plugin = createShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.mjs')
      expect(result).toContain('__dirname')
    })

    it('should process .cjs files', async () => {
      const plugin = createShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.cjs')
      expect(result).toContain('__dirname')
    })

    it('should process .jsx files', async () => {
      const plugin = createShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.jsx')
      expect(result).toContain('__dirname')
    })

    it('should process .tsx files', async () => {
      const plugin = createShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.tsx')
      expect(result).toContain('__dirname')
    })

    it('should skip when no shims needed', async () => {
      const plugin = createShimsPlugin()
      const result = await (plugin.transform as any)('const x = 1', 'test.js')
      expect(result).toBeNull()
    })

    it('should return null when code unchanged', async () => {
      const plugin = createShimsPlugin({ dirname: false, require: false, exports: false, env: false })
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.js')
      expect(result).toBeNull()
    })
  })

  describe('createBrowserShimsPlugin', () => {
    it('should create plugin', () => {
      const plugin = createBrowserShimsPlugin()
      expect(plugin.name).toBe('browser-shims')
    })

    it('should skip non-JS files', async () => {
      const plugin = createBrowserShimsPlugin()
      const result = await (plugin.transform as any)('process.env.NODE_ENV', 'test.css')
      expect(result).toBeNull()
    })

    it('should add env shim when process.env detected', async () => {
      const plugin = createBrowserShimsPlugin()
      const result = await (plugin.transform as any)('const mode = process.env.NODE_ENV', 'test.js')
      expect(result).toContain(PROCESS_ENV_SHIM)
    })

    it('should skip when no env usage', async () => {
      const plugin = createBrowserShimsPlugin()
      const result = await (plugin.transform as any)('const x = 1', 'test.js')
      expect(result).toBeNull()
    })

    it('should process .tsx files', async () => {
      const plugin = createBrowserShimsPlugin()
      const result = await (plugin.transform as any)('const mode = process.env.NODE_ENV', 'test.tsx')
      expect(result).toContain(PROCESS_ENV_SHIM)
    })
  })

  describe('createNodeShimsPlugin', () => {
    it('should create plugin', () => {
      const plugin = createNodeShimsPlugin()
      expect(plugin.name).toBe('node-shims')
    })

    it('should skip non-ESM files', async () => {
      const plugin = createNodeShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.ts')
      expect(result).toBeNull()
    })

    it('should add node globals shim for .mjs', async () => {
      const plugin = createNodeShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.mjs')
      expect(result).toContain(NODE_GLOBALS_SHIM)
    })

    it('should add node globals shim for .js', async () => {
      const plugin = createNodeShimsPlugin()
      const result = await (plugin.transform as any)('const dir = __dirname', 'test.js')
      expect(result).toContain(NODE_GLOBALS_SHIM)
    })

    it('should add exports shim when needed', async () => {
      const plugin = createNodeShimsPlugin()
      const result = await (plugin.transform as any)('module.exports = foo', 'test.mjs')
      expect(result).toContain(MODULE_EXPORTS_SHIM)
    })

    it('should skip when no shims needed', async () => {
      const plugin = createNodeShimsPlugin()
      const result = await (plugin.transform as any)('const x = 1', 'test.mjs')
      expect(result).toBeNull()
    })
  })

  describe('analyzeShimRequirements', () => {
    it('should analyze multiple files', () => {
      const codes = [
        'const dir = __dirname',
        'const fs = require("fs")',
        'module.exports = foo',
        'const mode = process.env.NODE_ENV',
      ]
      const result = analyzeShimRequirements(codes)

      expect(result.totalFiles).toBe(4)
      expect(result.filesNeedingShims).toBe(4)
      expect(result.shimTypes.dirname).toBe(1)
      expect(result.shimTypes.require).toBe(1)
      expect(result.shimTypes.exports).toBe(1)
      expect(result.shimTypes.env).toBe(1)
    })

    it('should count files without shim needs', () => {
      const codes = [
        'const x = 1',
        'const y = 2',
        'const dir = __dirname',
      ]
      const result = analyzeShimRequirements(codes)

      expect(result.totalFiles).toBe(3)
      expect(result.filesNeedingShims).toBe(1)
    })

    it('should provide recommendations based on threshold', () => {
      // 10 files, 2 needing dirname (20%) - should recommend
      const codes = Array(10).fill('const x = 1')
      codes[0] = 'const dir = __dirname'
      codes[1] = 'const file = __filename'

      const result = analyzeShimRequirements(codes)
      expect(result.recommendations.dirname).toBe(true)
    })

    it('should not recommend when below threshold', () => {
      // 20 files, 1 needing dirname (5%) - should not recommend
      const codes = Array(20).fill('const x = 1')
      codes[0] = 'const dir = __dirname'

      const result = analyzeShimRequirements(codes)
      expect(result.recommendations.dirname).toBe(false)
    })
  })

  describe('getPlatformShimsConfig', () => {
    it('should return browser config', () => {
      const config = getPlatformShimsConfig('browser')
      expect(config.dirname).toBe(false)
      expect(config.require).toBe(false)
      expect(config.exports).toBe(false)
      expect(config.env).toBe(true)
    })

    it('should return node config', () => {
      const config = getPlatformShimsConfig('node')
      expect(config.dirname).toBe(true)
      expect(config.require).toBe(true)
      expect(config.exports).toBe(true)
      expect(config.env).toBe(false)
    })

    it('should return neutral config', () => {
      const config = getPlatformShimsConfig('neutral')
      expect(config.dirname).toBe(false)
      expect(config.require).toBe(false)
      expect(config.exports).toBe(false)
      expect(config.env).toBe(false)
    })
  })
})
