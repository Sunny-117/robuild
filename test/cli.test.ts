import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'

const fixtureDir = new URL('cli/', import.meta.url)
const distDir = new URL('dist/', fixtureDir)

// Helper function to run CLI commands
function runCLI(args: string[], cwd: string): Promise<{ stdout: string, stderr: string, code: number }> {
  return new Promise((resolve) => {
    const child = spawn('npx', ['esno', '../../src/cli.ts', ...args], {
      cwd,
      stdio: 'pipe',
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      resolve({ stdout, stderr, code: code || 0 })
    })
  })
}

describe('cLI', () => {
  beforeAll(async () => {
    await rm(fixtureDir, { recursive: true, force: true })
    await mkdir(fixtureDir, { recursive: true })
    await mkdir(new URL('src/', fixtureDir), { recursive: true })

    // Create test files
    await writeFile(
      new URL('src/index.ts', fixtureDir),
      'export const test = "CLI test"',
    )
  })

  it('should build with basic command', async () => {
    const { code, stderr } = await runCLI(['src/index.ts'], fixtureDir.pathname)

    expect(code).toBe(0)
    expect(stderr).toBe('')

    const content = await readFile(new URL('index.mjs', distDir), 'utf8')
    expect(content).toContain('CLI test')
  })

  it('should support --format option', async () => {
    const { code } = await runCLI([
      'src/index.ts',
      '--format',
      'esm',
      '--format',
      'cjs',
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    const esmContent = await readFile(new URL('index.mjs', distDir), 'utf8')
    const cjsContent = await readFile(new URL('cjs/index.cjs', distDir), 'utf8')

    expect(esmContent).toContain('CLI test')
    expect(cjsContent).toContain('CLI test')
  })

  it('should support --platform option', async () => {
    const { code } = await runCLI([
      'src/index.ts',
      '--platform',
      'browser',
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    const content = await readFile(new URL('index.mjs', distDir), 'utf8')
    expect(content).toContain('CLI test')
  })

  it('should support --global-name option', async () => {
    const { code } = await runCLI([
      'src/index.ts',
      '--format',
      'iife',
      '--global-name',
      'TestCLI',
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    const content = await readFile(new URL('browser/index.js', distDir), 'utf8')
    expect(content).toContain('TestCLI')
  })

  it('should support --external option', async () => {
    await writeFile(
      new URL('src/with-lodash.ts', fixtureDir),
      'import _ from "lodash"\nexport const test = _.version',
    )

    const { code } = await runCLI([
      'src/with-lodash.ts',
      '--external',
      'lodash',
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    const content = await readFile(new URL('with-lodash.mjs', distDir), 'utf8')
    expect(content).toContain('from "lodash"')
  })

  it('should support --no-external option', async () => {
    const { code } = await runCLI([
      'src/index.ts',
      '--external',
      '*',
      '--no-external',
      'some-package',
    ], fixtureDir.pathname)

    expect(code).toBe(0)
  })

  it('should support --no-clean option', async () => {
    // Create an existing file
    await writeFile(new URL('keep-this.txt', distDir), 'keep this file')

    const { code } = await runCLI([
      'src/index.ts',
      '--no-clean',
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    // File should still exist
    const keepContent = await readFile(new URL('keep-this.txt', distDir), 'utf8')
    expect(keepContent).toBe('keep this file')
  })

  it('should support --dir option', async () => {
    const customDir = new URL('custom/', fixtureDir)
    await mkdir(customDir, { recursive: true })
    await mkdir(new URL('src/', customDir), { recursive: true })
    await writeFile(
      new URL('src/custom.ts', customDir),
      'export const custom = "custom dir"',
    )

    const { code } = await runCLI([
      'src/custom.ts',
      '--dir',
      customDir.pathname,
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    const content = await readFile(new URL('dist/custom.mjs', customDir), 'utf8')
    expect(content).toContain('custom dir')
  })

  it('should support --watch option', async () => {
    const { code } = await runCLI([
      'src/index.ts',
      '--watch',
    ], fixtureDir.pathname)

    // Watch mode should start successfully (we can't test the actual watching easily)
    expect(code).toBe(0)
  }, 10000)

  it('should support -w shorthand for watch', async () => {
    const { code } = await runCLI([
      'src/index.ts',
      '-w',
    ], fixtureDir.pathname)

    expect(code).toBe(0)
  }, 10000)

  it('should handle transform mode (path ending with /)', async () => {
    await mkdir(new URL('src/runtime/', fixtureDir), { recursive: true })
    await writeFile(
      new URL('src/runtime/test.ts', fixtureDir),
      'export const runtime = "CLI runtime"',
    )

    const { code } = await runCLI([
      'src/runtime/:dist/runtime',
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    const content = await readFile(new URL('runtime/test.mjs', distDir), 'utf8')
    expect(content).toContain('CLI runtime')
  })

  it('should handle multiple inputs', async () => {
    await writeFile(
      new URL('src/multi1.ts', fixtureDir),
      'export const multi1 = "first"',
    )
    await writeFile(
      new URL('src/multi2.ts', fixtureDir),
      'export const multi2 = "second"',
    )

    const { code } = await runCLI([
      'src/multi1.ts,src/multi2.ts',
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    const content1 = await readFile(new URL('multi1.mjs', distDir), 'utf8')
    const content2 = await readFile(new URL('multi2.mjs', distDir), 'utf8')

    expect(content1).toContain('first')
    expect(content2).toContain('second')
  })

  it('should show help with --help', async () => {
    const { code, stdout } = await runCLI(['--help'], fixtureDir.pathname)

    expect(code).toBe(0)
    expect(stdout).toContain('Usage:')
    expect(stdout).toContain('--format')
    expect(stdout).toContain('--watch')
  })

  it('should show version with --version', async () => {
    const { code, stdout } = await runCLI(['--version'], fixtureDir.pathname)

    expect(code).toBe(0)
    expect(stdout).toMatch(/\d+\.\d+\.\d+/)
  })

  it('should handle invalid arguments gracefully', async () => {
    const { code, stderr } = await runCLI(['--invalid-option'], fixtureDir.pathname)

    expect(code).not.toBe(0)
    expect(stderr).toContain('Unknown option')
  })

  it('should handle missing input file', async () => {
    const { code, stderr } = await runCLI(['non-existent.ts'], fixtureDir.pathname)

    expect(code).not.toBe(0)
    expect(stderr.length).toBeGreaterThan(0)
  })

  it('should support regex external patterns', async () => {
    const { code } = await runCLI([
      'src/index.ts',
      '--external',
      '/^@types\//',
    ], fixtureDir.pathname)

    expect(code).toBe(0)
  })

  it('should combine multiple CLI options', async () => {
    const { code } = await runCLI([
      'src/index.ts',
      '--format',
      'esm',
      '--format',
      'cjs',
      '--platform',
      'node',
      '--external',
      'lodash',
      '--no-clean',
    ], fixtureDir.pathname)

    expect(code).toBe(0)

    const esmContent = await readFile(new URL('index.mjs', distDir), 'utf8')
    const cjsContent = await readFile(new URL('cjs/index.cjs', distDir), 'utf8')

    expect(esmContent).toContain('CLI test')
    expect(cjsContent).toContain('CLI test')
  })
})
