import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createWatchFilter,
  DEFAULT_IGNORE_PATTERNS,
  filterIgnoredFiles,
  normalizeIgnorePatterns,
  shouldIgnoreFile,
} from '../../src/config/ignore-watch'

describe('ignore-watch config', () => {
  describe('DEFAULT_IGNORE_PATTERNS', () => {
    it('should include common ignore patterns', () => {
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/node_modules/**')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/dist/**')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/build/**')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/.git/**')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/.DS_Store')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/Thumbs.db')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/*.log')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/coverage/**')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/.nyc_output/**')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/.cache/**')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/tmp/**')
      expect(DEFAULT_IGNORE_PATTERNS).toContain('**/temp/**')
    })
  })

  describe('shouldIgnoreFile', () => {
    const cwd = '/project'

    it('should ignore node_modules', () => {
      expect(shouldIgnoreFile(join(cwd, 'node_modules/lodash/index.js'), cwd)).toBe(true)
    })

    it('should ignore dist folder', () => {
      expect(shouldIgnoreFile(join(cwd, 'dist/index.js'), cwd)).toBe(true)
    })

    it('should ignore build folder', () => {
      expect(shouldIgnoreFile(join(cwd, 'build/bundle.js'), cwd)).toBe(true)
    })

    it('should ignore .git folder', () => {
      expect(shouldIgnoreFile(join(cwd, '.git/config'), cwd)).toBe(true)
    })

    it('should ignore .DS_Store', () => {
      expect(shouldIgnoreFile(join(cwd, '.DS_Store'), cwd)).toBe(true)
      expect(shouldIgnoreFile(join(cwd, 'src/.DS_Store'), cwd)).toBe(true)
    })

    it('should ignore log files', () => {
      expect(shouldIgnoreFile(join(cwd, 'debug.log'), cwd)).toBe(true)
      expect(shouldIgnoreFile(join(cwd, 'npm-debug.log'), cwd)).toBe(true)
    })

    it('should ignore coverage folder', () => {
      expect(shouldIgnoreFile(join(cwd, 'coverage/lcov.info'), cwd)).toBe(true)
    })

    it('should ignore cache folder', () => {
      expect(shouldIgnoreFile(join(cwd, '.cache/data.json'), cwd)).toBe(true)
    })

    it('should ignore temp folders', () => {
      expect(shouldIgnoreFile(join(cwd, 'tmp/file.txt'), cwd)).toBe(true)
      expect(shouldIgnoreFile(join(cwd, 'temp/file.txt'), cwd)).toBe(true)
    })

    it('should not ignore source files', () => {
      expect(shouldIgnoreFile(join(cwd, 'src/index.ts'), cwd)).toBe(false)
      expect(shouldIgnoreFile(join(cwd, 'lib/utils.js'), cwd)).toBe(false)
    })

    it('should respect custom ignore patterns', () => {
      expect(shouldIgnoreFile(join(cwd, 'custom/file.txt'), cwd, ['**/custom/**'])).toBe(true)
    })

    it('should handle invalid patterns gracefully', () => {
      // Invalid pattern should be ignored
      expect(shouldIgnoreFile(join(cwd, 'src/index.ts'), cwd, ['[invalid'])).toBe(false)
    })
  })

  describe('filterIgnoredFiles', () => {
    const cwd = '/project'

    it('should filter out ignored files', () => {
      const files = [
        join(cwd, 'src/index.ts'),
        join(cwd, 'node_modules/lodash/index.js'),
        join(cwd, 'dist/bundle.js'),
        join(cwd, 'lib/utils.ts'),
      ]
      const result = filterIgnoredFiles(files, cwd)

      expect(result).toContain(join(cwd, 'src/index.ts'))
      expect(result).toContain(join(cwd, 'lib/utils.ts'))
      expect(result).not.toContain(join(cwd, 'node_modules/lodash/index.js'))
      expect(result).not.toContain(join(cwd, 'dist/bundle.js'))
    })

    it('should respect custom ignore patterns', () => {
      const files = [
        join(cwd, 'src/index.ts'),
        join(cwd, 'src/test.ts'),
      ]
      const result = filterIgnoredFiles(files, cwd, ['**/test.ts'])

      expect(result).toContain(join(cwd, 'src/index.ts'))
      expect(result).not.toContain(join(cwd, 'src/test.ts'))
    })

    it('should handle empty array', () => {
      const result = filterIgnoredFiles([], cwd)
      expect(result).toEqual([])
    })
  })

  describe('createWatchFilter', () => {
    const cwd = '/project'

    it('should create a filter function', () => {
      const filter = createWatchFilter(cwd)
      expect(typeof filter).toBe('function')
    })

    it('should return true for non-ignored files', () => {
      const filter = createWatchFilter(cwd)
      expect(filter(join(cwd, 'src/index.ts'))).toBe(true)
    })

    it('should return false for ignored files', () => {
      const filter = createWatchFilter(cwd)
      expect(filter(join(cwd, 'node_modules/lodash/index.js'))).toBe(false)
    })

    it('should respect custom ignore patterns', () => {
      const filter = createWatchFilter(cwd, ['**/custom/**'])
      expect(filter(join(cwd, 'custom/file.ts'))).toBe(false)
      expect(filter(join(cwd, 'src/file.ts'))).toBe(true)
    })
  })

  describe('normalizeIgnorePatterns', () => {
    it('should remove ./ prefix', () => {
      const patterns = ['./src/**', './dist/**']
      const result = normalizeIgnorePatterns(patterns)
      expect(result).toEqual(['src/**', 'dist/**'])
    })

    it('should remove / prefix', () => {
      const patterns = ['/src/**', '/dist/**']
      const result = normalizeIgnorePatterns(patterns)
      expect(result).toEqual(['src/**', 'dist/**'])
    })

    it('should keep patterns without prefix', () => {
      const patterns = ['**/node_modules/**', 'dist/**']
      const result = normalizeIgnorePatterns(patterns)
      expect(result).toEqual(['**/node_modules/**', 'dist/**'])
    })

    it('should handle mixed patterns', () => {
      const patterns = ['./src/**', '/dist/**', '**/temp/**']
      const result = normalizeIgnorePatterns(patterns)
      expect(result).toEqual(['src/**', 'dist/**', '**/temp/**'])
    })

    it('should handle empty array', () => {
      const result = normalizeIgnorePatterns([])
      expect(result).toEqual([])
    })
  })
})
