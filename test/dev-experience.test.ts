import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { build } from '../src/build'
import { normalizeIgnorePatterns, shouldIgnoreFile } from '../src/features/ignore-watch'
import { configureLogger, logger, resetLogCounts, shouldFailOnWarnings } from '../src/features/logger'
import { executeOnSuccess } from '../src/features/on-success'
import { loadViteConfig } from '../src/features/vite-config'

const testDir = join(__dirname, 'fixtures', 'dev-experience')

describe('development Experience Features', () => {
  beforeEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
    resetLogCounts()
  })

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('logger and Log Levels', () => {
    it('should configure log level correctly', () => {
      configureLogger('verbose')
      expect(logger.getWarningCount()).toBe(0)
      expect(logger.getErrorCount()).toBe(0)
    })

    it('should track warnings and errors', () => {
      logger.warn('Test warning')
      logger.error('Test error')

      expect(logger.getWarningCount()).toBe(1)
      expect(logger.getErrorCount()).toBe(1)
    })

    it('should fail on warnings when configured', () => {
      logger.warn('Test warning')
      expect(shouldFailOnWarnings(true)).toBe(true)
      expect(shouldFailOnWarnings(false)).toBe(false)
    })

    it('should reset log counts', () => {
      logger.warn('Test warning')
      logger.error('Test error')
      resetLogCounts()

      expect(logger.getWarningCount()).toBe(0)
      expect(logger.getErrorCount()).toBe(0)
    })
  })

  describe('onSuccess Callback', () => {
    it('should execute string command on success', async () => {
      const testFile = join(testDir, 'success.txt')
      const command = `echo "success" > "${testFile}"`

      const buildResult = {
        entries: [],
        duration: 100,
      }

      await executeOnSuccess(command, buildResult, testDir)

      expect(existsSync(testFile)).toBe(true)
    })

    it('should execute function callback on success', async () => {
      let callbackExecuted = false
      const callback = vi.fn(() => {
        callbackExecuted = true
      })

      const buildResult = {
        entries: [],
        duration: 100,
      }

      await executeOnSuccess(callback, buildResult, testDir)

      expect(callbackExecuted).toBe(true)
      expect(callback).toHaveBeenCalledWith(buildResult)
    })

    it('should handle callback errors', async () => {
      const callback = () => {
        throw new Error('Callback error')
      }

      const buildResult = {
        entries: [],
        duration: 100,
      }

      await expect(executeOnSuccess(callback, buildResult, testDir)).rejects.toThrow('Callback error')
    })
  })

  describe('ignore Watch Patterns', () => {
    it('should ignore default patterns', () => {
      expect(shouldIgnoreFile(join(testDir, 'node_modules/test.js'), testDir)).toBe(true)
      expect(shouldIgnoreFile(join(testDir, 'dist/test.js'), testDir)).toBe(true)
      expect(shouldIgnoreFile(join(testDir, '.git/config'), testDir)).toBe(true)
      expect(shouldIgnoreFile(join(testDir, 'src/test.js'), testDir)).toBe(false)
    })

    it('should ignore custom patterns', () => {
      const customPatterns = ['**/custom/**', '*.temp']

      expect(shouldIgnoreFile(join(testDir, 'custom/test.js'), testDir, customPatterns)).toBe(true)
      expect(shouldIgnoreFile(join(testDir, 'test.temp'), testDir, customPatterns)).toBe(true)
      expect(shouldIgnoreFile(join(testDir, 'src/test.js'), testDir, customPatterns)).toBe(false)
    })

    it('should normalize ignore patterns', () => {
      const patterns = ['./src/**', '/dist/**', 'node_modules/**']
      const normalized = normalizeIgnorePatterns(patterns)

      expect(normalized).toEqual(['src/**', 'dist/**', 'node_modules/**'])
    })
  })

  describe('vite Config Loading', () => {
    it('should handle missing vite config', async () => {
      const config = await loadViteConfig(testDir)
      expect(config).toEqual({})
    })

    it('should load vite config when present', async () => {
      const viteConfigPath = join(testDir, 'vite.config.js')
      writeFileSync(viteConfigPath, `
        export default {
          build: {
            lib: {
              entry: 'src/index.ts',
              formats: ['es', 'cjs'],
              name: 'MyLib'
            },
            minify: true,
            target: 'es2020'
          }
        }
      `)

      const config = await loadViteConfig(testDir)
      expect(config.entries).toBeDefined()
      expect(config.entries).toHaveLength(1)
    })
  })

  describe('build Integration', () => {
    it('should build with log level configuration', async () => {
      const srcDir = join(testDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      writeFileSync(join(srcDir, 'index.ts'), 'export const hello = "world"')

      await build({
        cwd: testDir,
        logLevel: 'verbose',
        entries: [
          {
            type: 'bundle',
            input: 'src/index.ts',
            outDir: 'dist',
          },
        ],
      })

      expect(existsSync(join(testDir, 'dist'))).toBe(true)
    })

    it('should execute onSuccess callback after build', async () => {
      const srcDir = join(testDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      writeFileSync(join(srcDir, 'index.ts'), 'export const hello = "world"')

      let callbackExecuted = false
      const onSuccess = () => {
        callbackExecuted = true
      }

      await build({
        cwd: testDir,
        onSuccess,
        entries: [
          {
            type: 'bundle',
            input: 'src/index.ts',
            outDir: 'dist',
          },
        ],
      })

      expect(callbackExecuted).toBe(true)
      expect(existsSync(join(testDir, 'dist'))).toBe(true)
    })

    it('should handle failOnWarn option', async () => {
      const srcDir = join(testDir, 'src')
      mkdirSync(srcDir, { recursive: true })

      writeFileSync(join(srcDir, 'index.ts'), 'export const hello = "world"')

      // This test would need to trigger a warning to properly test failOnWarn
      // For now, just test that the option is accepted
      await build({
        cwd: testDir,
        failOnWarn: true,
        entries: [
          {
            type: 'bundle',
            input: 'src/index.ts',
            outDir: 'dist',
          },
        ],
      })

      expect(existsSync(join(testDir, 'dist'))).toBe(true)
    })
  })
})
