import { describe, expect, it } from 'vitest'
import {
  applyOutExtensions,
  createFilename,
  getFormatExtension,
  resolveDtsOutputExtension,
  resolveJsOutputExtension,
} from '../../src/utils/extensions'

describe('extensions utils', () => {
  describe('getFormatExtension', () => {
    it('should return .mjs for ES format', () => {
      expect(getFormatExtension('es')).toBe('.mjs')
      expect(getFormatExtension('esm')).toBe('.mjs')
      expect(getFormatExtension('module')).toBe('.mjs')
    })

    it('should return .cjs for CJS format on node', () => {
      expect(getFormatExtension('cjs', 'node')).toBe('.cjs')
      expect(getFormatExtension('commonjs', 'node')).toBe('.cjs')
    })

    it('should return .js for CJS format on browser', () => {
      expect(getFormatExtension('cjs', 'browser')).toBe('.js')
    })

    it('should return .js for iife format', () => {
      expect(getFormatExtension('iife')).toBe('.js')
    })

    it('should return .js for umd format', () => {
      expect(getFormatExtension('umd')).toBe('.js')
    })

    it('should return .js for unknown format', () => {
      expect(getFormatExtension('unknown')).toBe('.js')
    })

    it('should return fixed extensions when fixedExtension is true', () => {
      expect(getFormatExtension('es', 'node', true)).toBe('.mjs')
      expect(getFormatExtension('cjs', 'node', true)).toBe('.cjs')
      expect(getFormatExtension('commonjs', 'node', true)).toBe('.cjs')
      expect(getFormatExtension('iife', 'node', true)).toBe('.mjs')
    })
  })

  describe('resolveJsOutputExtension', () => {
    it('should return mjs for ES format on node', () => {
      expect(resolveJsOutputExtension('es', 'node')).toBe('mjs')
    })

    it('should return js for ES format on browser', () => {
      expect(resolveJsOutputExtension('es', 'browser')).toBe('js')
    })

    it('should return cjs for CJS format on node', () => {
      expect(resolveJsOutputExtension('cjs', 'node')).toBe('cjs')
    })

    it('should return js for CJS format on browser', () => {
      expect(resolveJsOutputExtension('cjs', 'browser')).toBe('js')
    })

    it('should return js for iife format', () => {
      expect(resolveJsOutputExtension('iife')).toBe('js')
    })

    it('should return js for umd format', () => {
      expect(resolveJsOutputExtension('umd')).toBe('js')
    })

    it('should return js for unknown format', () => {
      expect(resolveJsOutputExtension('unknown' as any)).toBe('js')
    })

    it('should return fixed extensions when fixedExtension is true', () => {
      expect(resolveJsOutputExtension('es', 'node', true)).toBe('mjs')
      expect(resolveJsOutputExtension('cjs', 'node', true)).toBe('cjs')
      expect(resolveJsOutputExtension('iife', 'node', true)).toBe('mjs')
    })
  })

  describe('resolveDtsOutputExtension', () => {
    it('should return d.mts for ES format', () => {
      expect(resolveDtsOutputExtension('es')).toBe('d.mts')
    })

    it('should return d.cts for CJS format', () => {
      expect(resolveDtsOutputExtension('cjs')).toBe('d.cts')
    })

    it('should return d.ts for other formats', () => {
      expect(resolveDtsOutputExtension('iife')).toBe('d.ts')
      expect(resolveDtsOutputExtension('umd')).toBe('d.ts')
    })

    it('should return fixed extensions when fixedExtension is true', () => {
      expect(resolveDtsOutputExtension('es', true)).toBe('d.mts')
      expect(resolveDtsOutputExtension('cjs', true)).toBe('d.cts')
      expect(resolveDtsOutputExtension('iife', true)).toBe('d.mts')
    })
  })

  describe('applyOutExtensions', () => {
    it('should return default extensions when no custom factory', () => {
      const result = applyOutExtensions('es')
      expect(result.js).toBe('mjs')
      expect(result.dts).toBe('d.mts')
    })

    it('should apply custom js extension', () => {
      const customExtensions = () => ({ js: 'custom.js' })
      const result = applyOutExtensions('es', customExtensions)
      expect(result.js).toBe('custom.js')
      expect(result.dts).toBe('d.mts') // default
    })

    it('should apply custom dts extension', () => {
      const customExtensions = () => ({ dts: 'custom.d.ts' })
      const result = applyOutExtensions('es', customExtensions)
      expect(result.js).toBe('mjs') // default
      expect(result.dts).toBe('custom.d.ts')
    })

    it('should apply both custom extensions', () => {
      const customExtensions = () => ({ js: 'custom.js', dts: 'custom.d.ts' })
      const result = applyOutExtensions('es', customExtensions)
      expect(result.js).toBe('custom.js')
      expect(result.dts).toBe('custom.d.ts')
    })

    it('should work with different formats', () => {
      const customExtensions = (format: string) => ({
        js: format === 'cjs' ? 'cjs' : 'mjs',
        dts: format === 'cjs' ? 'd.cts' : 'd.mts',
      })

      const esResult = applyOutExtensions('es', customExtensions)
      expect(esResult.js).toBe('mjs')

      const cjsResult = applyOutExtensions('cjs', customExtensions)
      expect(cjsResult.js).toBe('cjs')
    })
  })

  describe('createFilename', () => {
    it('should create filename with JS extension', () => {
      expect(createFilename('index', 'es')).toBe('index.mjs')
      expect(createFilename('index', 'cjs')).toBe('index.cjs')
    })

    it('should create filename with DTS extension', () => {
      expect(createFilename('index', 'es', true)).toBe('index.d.mts')
      expect(createFilename('index', 'cjs', true)).toBe('index.d.cts')
    })

    it('should respect platform option', () => {
      expect(createFilename('index', 'es', false, { platform: 'browser' })).toBe('index.js')
      expect(createFilename('index', 'cjs', false, { platform: 'browser' })).toBe('index.js')
    })

    it('should respect fixedExtension option', () => {
      expect(createFilename('index', 'es', false, { fixedExtension: true })).toBe('index.mjs')
      expect(createFilename('index', 'cjs', false, { fixedExtension: true })).toBe('index.cjs')
    })

    it('should apply custom outExtensions', () => {
      const outExtensions = () => ({ js: 'bundle.js', dts: 'types.d.ts' })
      expect(createFilename('index', 'es', false, { outExtensions })).toBe('index.bundle.js')
      expect(createFilename('index', 'es', true, { outExtensions })).toBe('index.types.d.ts')
    })
  })
})
