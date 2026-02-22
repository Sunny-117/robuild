import { describe, expect, it, vi } from 'vitest'
import {
  createGlobImportPlugin,
  createGlobVirtualModule,
  extractGlobPatterns,
  hasGlobImports,
  resolveGlobPatterns,
  transformGlobImports,
} from '../../src/plugins/builtin/glob-import'

describe('glob-import plugin', () => {
  describe('hasGlobImports', () => {
    it('should detect import.meta.glob', () => {
      const code = 'const modules = import.meta.glob("./modules/*.js")'
      expect(hasGlobImports(code)).toBe(true)
    })

    it('should detect import.meta.glob with options', () => {
      const code = 'const modules = import.meta.glob("./modules/*.js", { eager: true })'
      expect(hasGlobImports(code)).toBe(true)
    })

    it('should return false when no glob imports', () => {
      const code = 'import foo from "./foo"'
      expect(hasGlobImports(code)).toBe(false)
    })
  })

  describe('extractGlobPatterns', () => {
    it('should extract single pattern', () => {
      const code = 'const modules = import.meta.glob("./modules/*.js")'
      const patterns = extractGlobPatterns(code)
      expect(patterns).toEqual(['./modules/*.js'])
    })

    it('should extract multiple patterns', () => {
      const code = `
        const modules = import.meta.glob("./modules/*.js")
        const utils = import.meta.glob("./utils/*.ts")
      `
      const patterns = extractGlobPatterns(code)
      expect(patterns).toEqual(['./modules/*.js', './utils/*.ts'])
    })

    it('should handle different quote styles', () => {
      const code = `
        const a = import.meta.glob("./a/*.js")
        const b = import.meta.glob('./b/*.js')
        const c = import.meta.glob(\`./c/*.js\`)
      `
      const patterns = extractGlobPatterns(code)
      expect(patterns).toHaveLength(3)
    })

    it('should return empty array when no patterns', () => {
      const code = 'const x = 1'
      const patterns = extractGlobPatterns(code)
      expect(patterns).toEqual([])
    })
  })

  describe('createGlobImportPlugin', () => {
    it('should create disabled plugin when not enabled', () => {
      const plugin = createGlobImportPlugin({ enabled: false })
      expect(plugin.name).toBe('glob-import-disabled')
      expect(plugin.transform).toBeUndefined()
    })

    it('should create enabled plugin', () => {
      const plugin = createGlobImportPlugin({ enabled: true })
      expect(plugin.name).toBe('glob-import')
      expect(plugin.transform).toBeDefined()
    })

    it('should return null when no glob imports', async () => {
      const plugin = createGlobImportPlugin({ enabled: true })
      const result = await (plugin.transform as any)('const x = 1', 'test.js')
      expect(result).toBeNull()
    })

    it('should transform glob imports', async () => {
      const plugin = createGlobImportPlugin({ enabled: true })
      const code = 'const modules = import.meta.glob("./modules/*.js")'
      const result = await (plugin.transform as any)(code, '/test/index.js')
      // Should have transformed (even if to empty object)
      expect(result).not.toBeNull()
    })
  })

  describe('createGlobVirtualModule', () => {
    it('should generate lazy import code', () => {
      const files = ['/src/a.js', '/src/b.js']
      const result = createGlobVirtualModule('./src/*.js', files, { eager: false })
      expect(result).toContain('() => import')
    })

    it('should generate eager import code', () => {
      const files = ['/src/a.js', '/src/b.js']
      const result = createGlobVirtualModule('./src/*.js', files, { eager: true })
      expect(result).toContain('import *')
    })

    it('should generate URL exports', () => {
      const files = ['/src/a.js']
      const result = createGlobVirtualModule('./src/*.js', files, { asUrls: true })
      expect(result).not.toContain('import')
    })

    it('should handle empty files array', () => {
      const result = createGlobVirtualModule('./src/*.js', [], {})
      expect(result).toContain('{')
      expect(result).toContain('}')
    })
  })

  describe('transformGlobImports', () => {
    it('should return null when disabled', async () => {
      const result = await transformGlobImports('const x = import.meta.glob("*.js")', 'test.js', { enabled: false })
      expect(result).toBeNull()
    })

    it('should return null when no glob imports', async () => {
      const result = await transformGlobImports('const x = 1', 'test.js', { enabled: true })
      expect(result).toBeNull()
    })

    it('should transform glob imports when enabled', async () => {
      const code = 'const modules = import.meta.glob("./modules/*.js")'
      const result = await transformGlobImports(code, '/test/index.js', { enabled: true })
      expect(result).not.toBeNull()
    })
  })

  describe('resolveGlobPatterns', () => {
    it('should resolve patterns to files', async () => {
      const patterns = ['*.test.ts']
      const result = await resolveGlobPatterns(patterns, process.cwd())
      expect(result).toHaveProperty('*.test.ts')
      expect(Array.isArray(result['*.test.ts'])).toBe(true)
    })

    it('should handle multiple patterns', async () => {
      const patterns = ['*.ts', '*.js']
      const result = await resolveGlobPatterns(patterns, process.cwd())
      expect(Object.keys(result)).toHaveLength(2)
    })

    it('should handle patterns with no matches', async () => {
      const patterns = ['nonexistent-pattern-xyz-123/*.xyz']
      const result = await resolveGlobPatterns(patterns, process.cwd())
      expect(result['nonexistent-pattern-xyz-123/*.xyz']).toEqual([])
    })
  })
})
