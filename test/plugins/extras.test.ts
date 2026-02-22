import { describe, expect, it } from 'vitest'
import { nodePolyfillsPlugin } from '../../src/plugins/extras/node-polyfills'
import { textPlugin } from '../../src/plugins/extras/text'
import { urlPlugin } from '../../src/plugins/extras/url'
import { virtualPlugin } from '../../src/plugins/extras/virtual'

describe('extra plugins', () => {
  describe('textPlugin', () => {
    it('should create plugin with default extensions', () => {
      const plugin = textPlugin()
      expect(plugin.name).toBe('text')
      expect(plugin.load).toBeDefined()
    })

    it('should create plugin with custom extensions', () => {
      const plugin = textPlugin(['.custom', '.doc'])
      expect(plugin.name).toBe('text')
    })

    it('should load .txt files', async () => {
      const plugin = textPlugin()
      // Returns null for non-existent files
      const result = await (plugin.load as any)('/nonexistent/file.txt')
      expect(result).toBeNull()
    })

    it('should load .md files', async () => {
      const plugin = textPlugin()
      const result = await (plugin.load as any)('/nonexistent/file.md')
      expect(result).toBeNull()
    })

    it('should skip non-matching extensions', async () => {
      const plugin = textPlugin()
      const result = await (plugin.load as any)('/path/file.js')
      expect(result).toBeNull()
    })

    it('should load custom extension files', async () => {
      const plugin = textPlugin(['.custom'])
      const result = await (plugin.load as any)('/nonexistent/file.custom')
      // Returns null for non-existent files
      expect(result).toBeNull()
    })
  })

  describe('urlPlugin', () => {
    it('should create plugin with default extensions', () => {
      const plugin = urlPlugin()
      expect(plugin.name).toBe('url')
      expect(plugin.load).toBeDefined()
    })

    it('should create plugin with custom extensions', () => {
      const plugin = urlPlugin(['.bmp', '.ico'])
      expect(plugin.name).toBe('url')
    })

    it('should load .png files', async () => {
      const plugin = urlPlugin()
      const result = await (plugin.load as any)('/path/to/image.png')
      expect(result).toContain('export default')
      expect(result).toContain('image.png')
    })

    it('should load .jpg files', async () => {
      const plugin = urlPlugin()
      const result = await (plugin.load as any)('/path/to/photo.jpg')
      expect(result).toContain('export default')
      expect(result).toContain('photo.jpg')
    })

    it('should load .svg files', async () => {
      const plugin = urlPlugin()
      const result = await (plugin.load as any)('/path/to/icon.svg')
      expect(result).toContain('export default')
      expect(result).toContain('icon.svg')
    })

    it('should skip non-matching extensions', async () => {
      const plugin = urlPlugin()
      const result = await (plugin.load as any)('/path/file.js')
      expect(result).toBeNull()
    })

    it('should load custom extension files', async () => {
      const plugin = urlPlugin(['.bmp'])
      const result = await (plugin.load as any)('/path/to/image.bmp')
      expect(result).toContain('image.bmp')
    })
  })

  describe('virtualPlugin', () => {
    it('should create plugin', () => {
      const plugin = virtualPlugin({})
      expect(plugin.name).toBe('virtual')
      expect(plugin.resolveId).toBeDefined()
      expect(plugin.load).toBeDefined()
    })

    it('should resolve virtual modules', async () => {
      const plugin = virtualPlugin({
        'virtual:config': 'export default { foo: "bar" }',
      })
      const result = await (plugin.resolveId as any)('virtual:config')
      expect(result).toBe('virtual:config')
    })

    it('should not resolve unknown modules', async () => {
      const plugin = virtualPlugin({
        'virtual:config': 'export default {}',
      })
      const result = await (plugin.resolveId as any)('unknown')
      expect(result).toBeNull()
    })

    it('should load virtual modules', async () => {
      const plugin = virtualPlugin({
        'virtual:config': 'export default { foo: "bar" }',
      })
      const result = await (plugin.load as any)('virtual:config')
      expect(result).toBe('export default { foo: "bar" }')
    })

    it('should not load unknown modules', async () => {
      const plugin = virtualPlugin({
        'virtual:config': 'export default {}',
      })
      const result = await (plugin.load as any)('unknown')
      expect(result).toBeNull()
    })

    it('should handle multiple virtual modules', async () => {
      const plugin = virtualPlugin({
        'virtual:a': 'export const a = 1',
        'virtual:b': 'export const b = 2',
        'virtual:c': 'export const c = 3',
      })

      expect(await (plugin.resolveId as any)('virtual:a')).toBe('virtual:a')
      expect(await (plugin.resolveId as any)('virtual:b')).toBe('virtual:b')
      expect(await (plugin.resolveId as any)('virtual:c')).toBe('virtual:c')

      expect(await (plugin.load as any)('virtual:a')).toBe('export const a = 1')
      expect(await (plugin.load as any)('virtual:b')).toBe('export const b = 2')
      expect(await (plugin.load as any)('virtual:c')).toBe('export const c = 3')
    })
  })

  describe('nodePolyfillsPlugin', () => {
    it('should create plugin', () => {
      const plugin = nodePolyfillsPlugin()
      expect(plugin.name).toBe('node-polyfills')
      expect(plugin.resolveId).toBeDefined()
    })

    it('should resolve path to path-browserify', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('path')
      expect(result).toBe('path-browserify')
    })

    it('should resolve fs to browserify-fs', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('fs')
      expect(result).toBe('browserify-fs')
    })

    it('should resolve crypto to crypto-browserify', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('crypto')
      expect(result).toBe('crypto-browserify')
    })

    it('should resolve stream to stream-browserify', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('stream')
      expect(result).toBe('stream-browserify')
    })

    it('should resolve buffer', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('buffer')
      expect(result).toBe('buffer')
    })

    it('should resolve process', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('process')
      expect(result).toBe('process/browser')
    })

    it('should resolve util', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('util')
      expect(result).toBe('util')
    })

    it('should resolve url', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('url')
      expect(result).toBe('url')
    })

    it('should resolve querystring', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('querystring')
      expect(result).toBe('querystring-es3')
    })

    it('should not resolve unknown modules', async () => {
      const plugin = nodePolyfillsPlugin()
      const result = await (plugin.resolveId as any)('unknown-module')
      expect(result).toBeNull()
    })
  })
})
