import { describe, expect, it } from 'vitest'
import {
  createLoaderPlugin,
  DEFAULT_LOADERS,
  getDefaultLoaderConfig,
  getLoaderForFile,
  mergeLoaderConfigs,
  transformWithLoader,
} from '../../src/plugins/builtin/loaders'

describe('loaders plugin', () => {
  describe('DEFAULT_LOADERS', () => {
    it('should have JS/TS loaders', () => {
      expect(DEFAULT_LOADERS['.js']).toBe('js')
      expect(DEFAULT_LOADERS['.mjs']).toBe('js')
      expect(DEFAULT_LOADERS['.cjs']).toBe('js')
      expect(DEFAULT_LOADERS['.jsx']).toBe('jsx')
      expect(DEFAULT_LOADERS['.ts']).toBe('ts')
      expect(DEFAULT_LOADERS['.mts']).toBe('ts')
      expect(DEFAULT_LOADERS['.cts']).toBe('ts')
      expect(DEFAULT_LOADERS['.tsx']).toBe('tsx')
    })

    it('should have JSON loader', () => {
      expect(DEFAULT_LOADERS['.json']).toBe('json')
    })

    it('should have CSS loaders', () => {
      expect(DEFAULT_LOADERS['.css']).toBe('css')
      expect(DEFAULT_LOADERS['.scss']).toBe('css')
      expect(DEFAULT_LOADERS['.sass']).toBe('css')
      expect(DEFAULT_LOADERS['.less']).toBe('css')
      expect(DEFAULT_LOADERS['.styl']).toBe('css')
    })

    it('should have text loaders', () => {
      expect(DEFAULT_LOADERS['.txt']).toBe('text')
      expect(DEFAULT_LOADERS['.md']).toBe('text')
      expect(DEFAULT_LOADERS['.html']).toBe('text')
      expect(DEFAULT_LOADERS['.xml']).toBe('text')
      expect(DEFAULT_LOADERS['.svg']).toBe('text')
    })

    it('should have image loaders', () => {
      expect(DEFAULT_LOADERS['.png']).toBe('asset')
      expect(DEFAULT_LOADERS['.jpg']).toBe('asset')
      expect(DEFAULT_LOADERS['.jpeg']).toBe('asset')
      expect(DEFAULT_LOADERS['.gif']).toBe('asset')
      expect(DEFAULT_LOADERS['.webp']).toBe('asset')
    })

    it('should have font loaders', () => {
      expect(DEFAULT_LOADERS['.woff']).toBe('asset')
      expect(DEFAULT_LOADERS['.woff2']).toBe('asset')
      expect(DEFAULT_LOADERS['.ttf']).toBe('asset')
      expect(DEFAULT_LOADERS['.eot']).toBe('asset')
    })

    it('should have media loaders', () => {
      expect(DEFAULT_LOADERS['.mp4']).toBe('file')
      expect(DEFAULT_LOADERS['.webm']).toBe('file')
      expect(DEFAULT_LOADERS['.mp3']).toBe('file')
    })

    it('should have binary loaders', () => {
      expect(DEFAULT_LOADERS['.zip']).toBe('binary')
      expect(DEFAULT_LOADERS['.wasm']).toBe('binary')
    })
  })

  describe('getLoaderForFile', () => {
    it('should return loader for known extension', () => {
      expect(getLoaderForFile('/path/to/file.ts')).toBe('ts')
      expect(getLoaderForFile('/path/to/file.json')).toBe('json')
    })

    it('should return file loader for unknown extension', () => {
      expect(getLoaderForFile('/path/to/file.xyz')).toBe('file')
    })

    it('should use custom loaders if provided', () => {
      const customLoaders = {
        '.custom': { loader: 'text' as const },
      }
      expect(getLoaderForFile('/path/to/file.custom', customLoaders)).toBe('text')
    })

    it('should prioritize custom loaders over default', () => {
      const customLoaders = {
        '.json': { loader: 'text' as const },
      }
      expect(getLoaderForFile('/path/to/file.json', customLoaders)).toBe('text')
    })

    it('should handle uppercase extensions', () => {
      expect(getLoaderForFile('/path/to/file.JSON')).toBe('json')
      expect(getLoaderForFile('/path/to/file.TS')).toBe('ts')
    })
  })

  describe('transformWithLoader', () => {
    it('should pass through JS/TS content', async () => {
      const content = 'const x = 1'
      expect(await transformWithLoader('file.js', content, 'js')).toBe(content)
      expect(await transformWithLoader('file.ts', content, 'ts')).toBe(content)
      expect(await transformWithLoader('file.jsx', content, 'jsx')).toBe(content)
      expect(await transformWithLoader('file.tsx', content, 'tsx')).toBe(content)
    })

    it('should transform JSON content', async () => {
      const content = '{"foo": "bar"}'
      const result = await transformWithLoader('file.json', content, 'json')
      expect(result).toContain('export default')
      expect(result).toContain('"foo"')
    })

    it('should handle invalid JSON gracefully', async () => {
      const content = 'invalid json'
      const result = await transformWithLoader('file.json', content, 'json')
      expect(result).toContain('export default')
    })

    it('should transform text content', async () => {
      const content = 'Hello World'
      const result = await transformWithLoader('file.txt', content, 'text')
      expect(result).toBe('export default "Hello World"')
    })

    it('should transform CSS content', async () => {
      const content = '.foo { color: red; }'
      const result = await transformWithLoader('file.css', content, 'css')
      expect(result).toContain('export default')
    })

    it('should transform CSS with modules option', async () => {
      const content = '.foo { color: red; } .bar { color: blue; }'
      const result = await transformWithLoader('file.css', content, 'css', { modules: true })
      expect(result).toContain('export default')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
    })

    it('should transform file content to URL', async () => {
      const result = await transformWithLoader('/path/to/image.png', '', 'file')
      expect(result).toContain('export default')
      expect(result).toContain('image.png')
    })

    it('should transform file with custom publicPath', async () => {
      const result = await transformWithLoader('/path/to/image.png', '', 'file', { publicPath: '/assets/' })
      expect(result).toContain('/assets/')
    })

    it('should transform dataurl content', async () => {
      const content = 'test'
      const result = await transformWithLoader('file.png', content, 'dataurl')
      expect(result).toContain('data:')
      expect(result).toContain('base64')
    })

    it('should transform binary content', async () => {
      const result = await transformWithLoader('/path/to/file.wasm', '', 'binary')
      expect(result).toContain('export default')
    })

    it('should transform empty loader', async () => {
      const result = await transformWithLoader('file.empty', '', 'empty')
      expect(result).toBe('export default {}')
    })

    it('should throw for unknown loader', async () => {
      await expect(transformWithLoader('file.xyz', '', 'unknown' as any)).rejects.toThrow('Unknown loader type')
    })
  })

  describe('createLoaderPlugin', () => {
    it('should create plugin with load hook', () => {
      const plugin = createLoaderPlugin()
      expect(plugin.name).toBe('loaders')
      expect(plugin.load).toBeDefined()
    })

    it('should return null for JS/TS files', async () => {
      const plugin = createLoaderPlugin()
      expect(await (plugin.load as any)('file.js')).toBeNull()
      expect(await (plugin.load as any)('file.ts')).toBeNull()
      expect(await (plugin.load as any)('file.jsx')).toBeNull()
      expect(await (plugin.load as any)('file.tsx')).toBeNull()
    })

    it('should return null for JSON without custom loader', async () => {
      const plugin = createLoaderPlugin()
      expect(await (plugin.load as any)('file.json')).toBeNull()
    })

    it('should handle JSON with custom loader', async () => {
      const plugin = createLoaderPlugin({
        '.json': { loader: 'json' },
      })
      // Will return null because file doesn't exist, but at least it tries
      expect(await (plugin.load as any)('/nonexistent/file.json')).toBeNull()
    })
  })

  describe('getDefaultLoaderConfig', () => {
    it('should return config for all default loaders', () => {
      const config = getDefaultLoaderConfig()
      expect(config['.js'].loader).toBe('js')
      expect(config['.ts'].loader).toBe('ts')
      expect(config['.json'].loader).toBe('json')
      expect(config['.css'].loader).toBe('css')
    })
  })

  describe('mergeLoaderConfigs', () => {
    it('should merge configs', () => {
      const base = { '.js': { loader: 'js' as const } }
      const override = { '.ts': { loader: 'ts' as const } }
      const result = mergeLoaderConfigs(base, override)
      expect(result['.js'].loader).toBe('js')
      expect(result['.ts'].loader).toBe('ts')
    })

    it('should override base with override', () => {
      const base = { '.json': { loader: 'json' as const } }
      const override = { '.json': { loader: 'text' as const } }
      const result = mergeLoaderConfigs(base, override)
      expect(result['.json'].loader).toBe('text')
    })
  })
})
