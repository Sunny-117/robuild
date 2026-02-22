import { describe, expect, it } from 'vitest'
import {
  analyzeModuleFormat,
  createCjsDefaultPlugin,
  createCommonJSInteropPlugin,
  detectCommonJSExports,
  getRecommendedCjsDefaultMode,
  transformCommonJSExports,
  transformESModulesToCommonJS,
  addCommonJSWrapper,
} from '../../src/plugins/builtin/cjs-default'

describe('cjs-default plugin', () => {
  describe('detectCommonJSExports', () => {
    it('should detect module.exports', () => {
      const code = 'module.exports = { foo: "bar" }'
      const result = detectCommonJSExports(code)

      expect(result.hasModuleExports).toBe(true)
      expect(result.hasExportsAssignment).toBe(false)
    })

    it('should detect exports.name assignment', () => {
      const code = 'exports.foo = "bar"'
      const result = detectCommonJSExports(code)

      expect(result.hasModuleExports).toBe(false)
      expect(result.hasExportsAssignment).toBe(true)
    })

    it('should detect export default', () => {
      const code = 'export default { foo: "bar" }'
      const result = detectCommonJSExports(code)

      expect(result.hasDefaultExport).toBe(true)
      expect(result.hasNamedExports).toBe(false)
    })

    it('should detect named exports', () => {
      const code = 'export const foo = "bar"'
      const result = detectCommonJSExports(code)

      expect(result.hasDefaultExport).toBe(false)
      expect(result.hasNamedExports).toBe(true)
    })

    it('should detect export function', () => {
      const code = 'export function foo() {}'
      const result = detectCommonJSExports(code)

      expect(result.hasNamedExports).toBe(true)
    })

    it('should detect export class', () => {
      const code = 'export class Foo {}'
      const result = detectCommonJSExports(code)

      expect(result.hasNamedExports).toBe(true)
    })

    it('should detect export { }', () => {
      const code = 'export { foo, bar }'
      const result = detectCommonJSExports(code)

      expect(result.hasNamedExports).toBe(true)
    })

    it('should ignore patterns in comments', () => {
      const code = `
        // module.exports = something
        /* exports.foo = bar */
        const x = 1
      `
      const result = detectCommonJSExports(code)

      expect(result.hasModuleExports).toBe(false)
      expect(result.hasExportsAssignment).toBe(false)
    })

    it('should ignore patterns in strings', () => {
      const code = `
        const str1 = "module.exports = something"
        const str2 = 'exports.foo = bar'
        const str3 = \`export default x\`
      `
      const result = detectCommonJSExports(code)

      expect(result.hasModuleExports).toBe(false)
      expect(result.hasExportsAssignment).toBe(false)
      expect(result.hasDefaultExport).toBe(false)
    })
  })

  describe('transformCommonJSExports', () => {
    it('should transform module.exports to export default', () => {
      const code = 'module.exports = { foo: "bar" };'
      const result = transformCommonJSExports(code, true)

      expect(result).toContain('export default { foo: "bar" }')
    })

    it('should transform exports.name to export const', () => {
      const code = 'exports.foo = "bar";'
      const result = transformCommonJSExports(code, true)

      expect(result).toContain('export const foo = "bar"')
    })

    it('should return original code when mode is false', () => {
      const code = 'module.exports = { foo: "bar" }'
      const result = transformCommonJSExports(code, false)

      expect(result).toBe(code)
    })

    it('should transform in auto mode when CJS patterns detected', () => {
      const code = 'module.exports = { foo: "bar" }'
      const result = transformCommonJSExports(code, 'auto')

      expect(result).toContain('export default')
    })

    it('should not transform in auto mode when ESM patterns detected', () => {
      const code = 'export default { foo: "bar" }'
      const result = transformCommonJSExports(code, 'auto')

      expect(result).toBe(code)
    })

    it('should not transform in auto mode when no CJS patterns', () => {
      const code = 'const foo = "bar"'
      const result = transformCommonJSExports(code, 'auto')

      expect(result).toBe(code)
    })
  })

  describe('transformESModulesToCommonJS', () => {
    it('should transform export default to module.exports', () => {
      const code = 'export default { foo: "bar" };'
      const result = transformESModulesToCommonJS(code)

      expect(result).toContain('module.exports = { foo: "bar" }')
    })

    it('should transform export const to exports', () => {
      const code = 'export const foo = "bar";'
      const result = transformESModulesToCommonJS(code)

      expect(result).toContain('const foo = "bar"')
      expect(result).toContain('exports.foo = foo')
    })

    it('should transform export let', () => {
      const code = 'export let foo = "bar";'
      const result = transformESModulesToCommonJS(code)

      expect(result).toContain('const foo = "bar"')
      expect(result).toContain('exports.foo = foo')
    })

    it('should transform export var', () => {
      const code = 'export var foo = "bar";'
      const result = transformESModulesToCommonJS(code)

      expect(result).toContain('const foo = "bar"')
      expect(result).toContain('exports.foo = foo')
    })

    it('should transform export function', () => {
      const code = 'export function foo() {}'
      const result = transformESModulesToCommonJS(code)

      expect(result).toContain('function foo()')
    })

    it('should transform export class', () => {
      const code = 'export class Foo {}'
      const result = transformESModulesToCommonJS(code)

      expect(result).toContain('class Foo')
    })
  })

  describe('addCommonJSWrapper', () => {
    it('should add wrapper when hasDefaultExport is true', () => {
      const code = 'export default foo'
      const result = addCommonJSWrapper(code, true)

      expect(result).toContain('// CommonJS compatibility')
      expect(result).toContain('module.exports = exports.default')
    })

    it('should not add wrapper when hasDefaultExport is false', () => {
      const code = 'export const foo = "bar"'
      const result = addCommonJSWrapper(code, false)

      expect(result).toBe(code)
    })
  })

  describe('analyzeModuleFormat', () => {
    it('should detect CJS format', () => {
      const code = 'module.exports = { foo: "bar" }'
      const result = analyzeModuleFormat(code)

      expect(result.format).toBe('cjs')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should detect ES format', () => {
      const code = 'export default { foo: "bar" }'
      const result = analyzeModuleFormat(code)

      expect(result.format).toBe('es')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should detect mixed format', () => {
      const code = `
        module.exports = foo
        export default bar
      `
      const result = analyzeModuleFormat(code)

      expect(result.format).toBe('mixed')
    })

    it('should return unknown for code without exports', () => {
      const code = 'const foo = "bar"'
      const result = analyzeModuleFormat(code)

      expect(result.format).toBe('unknown')
      expect(result.confidence).toBe(0)
    })

    it('should have higher confidence for module.exports than exports.name', () => {
      const codeModuleExports = 'module.exports = foo'
      const codeExportsName = 'exports.foo = bar'

      const result1 = analyzeModuleFormat(codeModuleExports)
      const result2 = analyzeModuleFormat(codeExportsName)

      expect(result1.confidence).toBeGreaterThan(result2.confidence)
    })
  })

  describe('getRecommendedCjsDefaultMode', () => {
    it('should return true for high-confidence CJS', () => {
      const code = 'module.exports = { foo: "bar" }'
      const result = getRecommendedCjsDefaultMode(code)

      expect(result).toBe(true)
    })

    it('should return false for high-confidence ES', () => {
      const code = 'export default { foo: "bar" }'
      const result = getRecommendedCjsDefaultMode(code)

      expect(result).toBe(false)
    })

    it('should return auto for ambiguous code', () => {
      const code = 'const foo = "bar"'
      const result = getRecommendedCjsDefaultMode(code)

      expect(result).toBe('auto')
    })
  })

  describe('createCjsDefaultPlugin', () => {
    it('should create a plugin with transform hook', () => {
      const plugin = createCjsDefaultPlugin()

      expect(plugin.name).toBe('cjs-default')
      expect(plugin.transform).toBeDefined()
    })

    it('should skip non-JS files', async () => {
      const plugin = createCjsDefaultPlugin()
      const result = await (plugin.transform as any)('module.exports = foo', 'test.css')

      expect(result).toBeNull()
    })

    it('should process .js files', async () => {
      const plugin = createCjsDefaultPlugin(true)
      const result = await (plugin.transform as any)('module.exports = foo;', 'test.js')

      expect(result).toContain('export default foo')
    })

    it('should process .ts files', async () => {
      const plugin = createCjsDefaultPlugin(true)
      const result = await (plugin.transform as any)('module.exports = foo;', 'test.ts')

      expect(result).toContain('export default foo')
    })

    it('should process .mjs files', async () => {
      const plugin = createCjsDefaultPlugin(true)
      const result = await (plugin.transform as any)('module.exports = foo;', 'test.mjs')

      expect(result).toContain('export default foo')
    })

    it('should process .cjs files', async () => {
      const plugin = createCjsDefaultPlugin(true)
      const result = await (plugin.transform as any)('module.exports = foo;', 'test.cjs')

      expect(result).toContain('export default foo')
    })

    it('should process .jsx files', async () => {
      const plugin = createCjsDefaultPlugin(true)
      const result = await (plugin.transform as any)('module.exports = foo;', 'test.jsx')

      expect(result).toContain('export default foo')
    })

    it('should process .tsx files', async () => {
      const plugin = createCjsDefaultPlugin(true)
      const result = await (plugin.transform as any)('module.exports = foo;', 'test.tsx')

      expect(result).toContain('export default foo')
    })

    it('should skip in auto mode when no CJS patterns', async () => {
      const plugin = createCjsDefaultPlugin('auto')
      const result = await (plugin.transform as any)('const foo = "bar"', 'test.js')

      expect(result).toBeNull()
    })

    it('should skip in auto mode when ESM patterns exist', async () => {
      const plugin = createCjsDefaultPlugin('auto')
      const result = await (plugin.transform as any)('export default foo', 'test.js')

      expect(result).toBeNull()
    })

    it('should return null when code is unchanged', async () => {
      const plugin = createCjsDefaultPlugin(true)
      const result = await (plugin.transform as any)('const foo = "bar"', 'test.js')

      expect(result).toBeNull()
    })
  })

  describe('createCommonJSInteropPlugin', () => {
    it('should create a plugin', () => {
      const plugin = createCommonJSInteropPlugin()

      expect(plugin.name).toBe('cjs-interop')
      expect(plugin.transform).toBeDefined()
    })

    it('should skip non-JS files', async () => {
      const plugin = createCommonJSInteropPlugin()
      const result = await (plugin.transform as any)('export default foo', 'test.ts')

      expect(result).toBeNull()
    })

    it('should add __esModule marker for default exports', async () => {
      const plugin = createCommonJSInteropPlugin()
      const result = await (plugin.transform as any)('export default foo', 'test.js')

      expect(result).toContain('__esModule')
    })

    it('should add __esModule marker for named exports', async () => {
      const plugin = createCommonJSInteropPlugin()
      const result = await (plugin.transform as any)('export const foo = "bar"', 'test.js')

      expect(result).toContain('__esModule')
    })

    it('should skip files without exports', async () => {
      const plugin = createCommonJSInteropPlugin()
      const result = await (plugin.transform as any)('const foo = "bar"', 'test.js')

      expect(result).toBeNull()
    })
  })
})
