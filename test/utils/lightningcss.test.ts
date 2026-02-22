import { describe, expect, it } from 'vitest'
import { esbuildTargetToLightningCSS } from '../../src/utils/lightningcss'

describe('lightningcss utils', () => {
  describe('esbuildTargetToLightningCSS', () => {
    it('should convert single browser target', () => {
      const result = esbuildTargetToLightningCSS(['chrome90'])
      expect(result).toEqual({
        chrome: (90 << 16) | (0 << 8) | 0, // 90.0.0
      })
    })

    it('should convert multiple browser targets', () => {
      const result = esbuildTargetToLightningCSS(['chrome90', 'firefox88', 'safari14'])
      expect(result).toEqual({
        chrome: (90 << 16) | (0 << 8) | 0,
        firefox: (88 << 16) | (0 << 8) | 0,
        safari: (14 << 16) | (0 << 8) | 0,
      })
    })

    it('should handle versions with minor and patch numbers', () => {
      const result = esbuildTargetToLightningCSS(['chrome90.1.2'])
      expect(result).toEqual({
        chrome: (90 << 16) | (1 << 8) | 2,
      })
    })

    it('should handle ios target (mapped to ios_saf)', () => {
      const result = esbuildTargetToLightningCSS(['ios14'])
      expect(result).toEqual({
        ios_saf: (14 << 16) | (0 << 8) | 0,
      })
    })

    it('should handle edge and opera targets', () => {
      const result = esbuildTargetToLightningCSS(['edge90', 'opera80'])
      expect(result).toEqual({
        edge: (90 << 16) | (0 << 8) | 0,
        opera: (80 << 16) | (0 << 8) | 0,
      })
    })

    it('should handle ie target', () => {
      const result = esbuildTargetToLightningCSS(['ie11'])
      expect(result).toEqual({
        ie: (11 << 16) | (0 << 8) | 0,
      })
    })

    it('should return undefined for empty array', () => {
      const result = esbuildTargetToLightningCSS([])
      expect(result).toBeUndefined()
    })

    it('should skip unknown browser names', () => {
      const result = esbuildTargetToLightningCSS(['unknown90', 'chrome80'])
      expect(result).toEqual({
        chrome: (80 << 16) | (0 << 8) | 0,
      })
    })

    it('should return undefined when all targets are unknown', () => {
      const result = esbuildTargetToLightningCSS(['unknown90', 'node16'])
      expect(result).toBeUndefined()
    })

    it('should handle mixed case targets', () => {
      const result = esbuildTargetToLightningCSS(['Chrome90', 'FIREFOX88'])
      expect(result).toEqual({
        chrome: (90 << 16) | (0 << 8) | 0,
        firefox: (88 << 16) | (0 << 8) | 0,
      })
    })

    it('should handle targets with dash in version', () => {
      // Some tools might output versions like "90-beta"
      const result = esbuildTargetToLightningCSS(['chrome90-beta'])
      expect(result).toEqual({
        chrome: (90 << 16) | (0 << 8) | 0,
      })
    })

    it('should handle string with spaces between targets', () => {
      const result = esbuildTargetToLightningCSS(['chrome90 firefox88'])
      expect(result).toEqual({
        chrome: (90 << 16) | (0 << 8) | 0,
        firefox: (88 << 16) | (0 << 8) | 0,
      })
    })

    it('should skip targets without version number', () => {
      const result = esbuildTargetToLightningCSS(['chrome', 'firefox88'])
      expect(result).toEqual({
        firefox: (88 << 16) | (0 << 8) | 0,
      })
    })

    it('should handle esXXXX targets (skip them)', () => {
      // ES targets like 'es2020' should be skipped as they don't map to browser versions
      const result = esbuildTargetToLightningCSS(['es2020', 'chrome90'])
      expect(result).toEqual({
        chrome: (90 << 16) | (0 << 8) | 0,
      })
    })
  })
})
