import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanTestDir, getTestDir } from './helpers'

/**
 * CLI tests
 * Tests for command-line interface functionality
 */
describe('cLI', () => {
  let testDir: string
  let cliPath: string

  beforeEach(async (context) => {
    testDir = getTestDir(context.task)
    await cleanTestDir(context.task)
    await mkdir(testDir, { recursive: true })
    cliPath = path.resolve(process.cwd(), 'dist/cli.mjs')
  })

  afterEach(async () => {
    // Cleanup handled by beforeEach
  })

  describe('basic commands', () => {
    it('should show help', async () => {
      const { execSync } = await import('node:child_process')
      const output = execSync(`node ${cliPath} --help`, {
        encoding: 'utf8',
        cwd: testDir,
      })
      expect(output).toContain('Usage')
      expect(output).toContain('Options')
    })

    it('should show version', async () => {
      const { execSync } = await import('node:child_process')
      const output = execSync(`node ${cliPath} --version`, {
        encoding: 'utf8',
        cwd: testDir,
      })
      expect(output).toMatch(/\d+\.\d+\.\d+/)
    })
  })

  describe('build commands', () => {
    it('should build with default options', async () => {
      await writeFile(
        path.join(testDir, 'index.ts'),
        'export const hello = "world"',
      )

      const { execSync } = await import('node:child_process')
      execSync(`node ${cliPath} index.ts`, {
        cwd: testDir,
        stdio: 'pipe',
      })

      expect(existsSync(path.join(testDir, 'dist/index.mjs'))).toBe(true)
    })

    it('should support --format option', async () => {
      await writeFile(
        path.join(testDir, 'index.ts'),
        'export const value = 42',
      )

      const { execSync } = await import('node:child_process')
      execSync(`node ${cliPath} index.ts --format cjs`, {
        cwd: testDir,
        stdio: 'pipe',
      })

      expect(existsSync(path.join(testDir, 'dist/index.cjs'))).toBe(true)
    })

    it('should support --sourcemap option', async () => {
      await writeFile(
        path.join(testDir, 'index.ts'),
        'export const value = 42',
      )

      const { execSync } = await import('node:child_process')
      execSync(`node ${cliPath} index.ts --sourcemap`, {
        cwd: testDir,
        stdio: 'pipe',
      })

      expect(existsSync(path.join(testDir, 'dist/index.mjs'))).toBe(true)
      expect(existsSync(path.join(testDir, 'dist/index.mjs.map'))).toBe(true)
    })

    it('should support --minify option', async () => {
      await writeFile(
        path.join(testDir, 'index.ts'),
        'export function longFunctionName() { return "hello" }',
      )

      const { execSync } = await import('node:child_process')
      execSync(`node ${cliPath} index.ts --minify`, {
        cwd: testDir,
        stdio: 'pipe',
      })

      const { readFileSync } = await import('node:fs')
      const output = readFileSync(
        path.join(testDir, 'dist/index.mjs'),
        'utf8',
      )
      // Minified output should be shorter
      expect(output.length).toBeLessThan(100)
    })

    it('should support --external option', async () => {
      await writeFile(
        path.join(testDir, 'index.ts'),
        'import React from "react"\nexport { React }',
      )

      const { execSync } = await import('node:child_process')
      execSync(`node ${cliPath} index.ts --external react`, {
        cwd: testDir,
        stdio: 'pipe',
      })

      const { readFileSync } = await import('node:fs')
      const output = readFileSync(
        path.join(testDir, 'dist/index.mjs'),
        'utf8',
      )
      expect(output).toContain('from "react"')
    })
  })

  describe('config file', () => {
    it('should use build.config.ts', async () => {
      await writeFile(
        path.join(testDir, 'index.ts'),
        'export const value = 42',
      )

      await writeFile(
        path.join(testDir, 'build.config.ts'),
        `
          export default {
            entries: [
              {
                type: 'bundle',
                input: 'index.ts',
                outDir: 'custom-dist',
              },
            ],
          }
        `,
      )

      const { execSync } = await import('node:child_process')
      execSync(`node ${cliPath}`, {
        cwd: testDir,
        stdio: 'pipe',
      })

      expect(existsSync(path.join(testDir, 'custom-dist/index.mjs'))).toBe(
        true,
      )
    })

    it('should support --config option', async () => {
      await writeFile(
        path.join(testDir, 'index.ts'),
        'export const value = 42',
      )

      await writeFile(
        path.join(testDir, 'custom.config.ts'),
        `
          export default {
            entries: [
              {
                type: 'bundle',
                input: 'index.ts',
                outDir: 'output',
              },
            ],
          }
        `,
      )

      const { execSync } = await import('node:child_process')
      execSync(`node ${cliPath} --config custom.config.ts`, {
        cwd: testDir,
        stdio: 'pipe',
      })

      expect(existsSync(path.join(testDir, 'output/index.mjs'))).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle missing input file', async () => {
      const { execSync } = await import('node:child_process')

      expect(() => {
        execSync(`node ${cliPath} nonexistent.ts`, {
          cwd: testDir,
          stdio: 'pipe',
        })
      }).toThrow()
    })

    it('should handle invalid config', async () => {
      await writeFile(
        path.join(testDir, 'build.config.ts'),
        'export default { invalid: true }',
      )

      const { execSync } = await import('node:child_process')

      expect(() => {
        execSync(`node ${cliPath}`, {
          cwd: testDir,
          stdio: 'pipe',
        })
      }).toThrow()
    })
  })
})
