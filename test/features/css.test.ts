import { describe, expect, it } from 'vitest'
import {
  defaultCssBundleName,
  resolveCssOptions,
} from '../../src/features/css'

describe('css options', () => {
  describe('resolveCssOptions', () => {
    it('should return default options when no options provided', () => {
      const result = resolveCssOptions()
      expect(result).toEqual({
        splitting: true,
        fileName: 'style.css',
        lightningcss: false,
      })
    })

    it('should return default options for empty object', () => {
      const result = resolveCssOptions({})
      expect(result).toEqual({
        splitting: true,
        fileName: 'style.css',
        lightningcss: false,
      })
    })

    it('should override splitting option', () => {
      const result = resolveCssOptions({ splitting: false })
      expect(result).toEqual({
        splitting: false,
        fileName: 'style.css',
        lightningcss: false,
      })
    })

    it('should override fileName option', () => {
      const result = resolveCssOptions({ fileName: 'bundle.css' })
      expect(result).toEqual({
        splitting: true,
        fileName: 'bundle.css',
        lightningcss: false,
      })
    })

    it('should override lightningcss option', () => {
      const result = resolveCssOptions({ lightningcss: true })
      expect(result).toEqual({
        splitting: true,
        fileName: 'style.css',
        lightningcss: true,
      })
    })

    it('should handle all options together', () => {
      const result = resolveCssOptions({
        splitting: false,
        fileName: 'app.css',
        lightningcss: true,
      })
      expect(result).toEqual({
        splitting: false,
        fileName: 'app.css',
        lightningcss: true,
      })
    })
  })

  describe('defaultCssBundleName', () => {
    it('should be style.css', () => {
      expect(defaultCssBundleName).toBe('style.css')
    })
  })
})
