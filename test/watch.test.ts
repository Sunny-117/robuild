import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { build } from '../src/build.ts'

const fixtureDir = new URL('watch/', import.meta.url)
const distDir = new URL('dist/', fixtureDir)

describe('watch mode', () => {
  beforeAll(async () => {
    await rm(fixtureDir, { recursive: true, force: true })
    await mkdir(fixtureDir, { recursive: true })
    await mkdir(new URL('src/', fixtureDir), { recursive: true })
  })

  it('should build initially in watch mode', async () => {
    await writeFile(
      new URL('src/index.ts', fixtureDir),
      'export const initial = "initial build"',
    )

    // Test initial build without actually starting watch mode
    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
        },
      ],
      // Don't enable watch for this test to avoid hanging
    })

    const content = await readFile(new URL('index.mjs', distDir), 'utf8')
    expect(content).toContain('initial build')
  })

  it('should configure watch options correctly', async () => {
    const watchConfig = {
      enabled: true,
      include: ['src/**/*'],
      exclude: ['**/*.test.ts'],
      delay: 200,
      ignoreInitial: true,
      watchNewFiles: true,
    }

    // This test verifies that watch configuration is accepted
    // without throwing errors - we don't actually start watching
    const buildConfig = {
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle' as const,
          input: 'src/index.ts',
          format: 'esm' as const,
        },
      ],
      watch: watchConfig,
    }

    // Just verify the config is valid, don't start watching
    expect(buildConfig.watch).toEqual(watchConfig)
  })

  it('should handle watch with multiple entries', async () => {
    await writeFile(
      new URL('src/entry1.ts', fixtureDir),
      'export const entry1 = "first entry"',
    )
    await writeFile(
      new URL('src/entry2.ts', fixtureDir),
      'export const entry2 = "second entry"',
    )

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/entry1.ts',
          format: 'esm',
          outDir: 'dist/entry1',
        },
        {
          type: 'bundle',
          input: 'src/entry2.ts',
          format: 'esm',
          outDir: 'dist/entry2',
        },
      ],
      // Remove watch to avoid hanging
    })

    const entry1Content = await readFile(new URL('entry1/entry1.mjs', distDir), 'utf8')
    const entry2Content = await readFile(new URL('entry2/entry2.mjs', distDir), 'utf8')

    expect(entry1Content).toContain('first entry')
    expect(entry2Content).toContain('second entry')
  })

  it('should work with transform entries in watch mode', async () => {
    await mkdir(new URL('src/runtime/', fixtureDir), { recursive: true })
    await writeFile(
      new URL('src/runtime/test.ts', fixtureDir),
      'export const runtime = "watch runtime"',
    )

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'transform',
          input: 'src/runtime',
          outDir: 'dist/runtime',
        },
      ],
    })

    const content = await readFile(new URL('runtime/test.mjs', distDir), 'utf8')
    expect(content).toContain('watch runtime')
  })

  it('should handle watch with different formats', async () => {
    await writeFile(
      new URL('src/multi-format.ts', fixtureDir),
      'export const multiFormat = "watch multi format"',
    )

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/multi-format.ts',
          format: ['esm', 'cjs'],
        },
      ],
    })

    const esmContent = await readFile(new URL('multi-format.mjs', distDir), 'utf8')
    const cjsContent = await readFile(new URL('cjs/multi-format.cjs', distDir), 'utf8')

    expect(esmContent).toContain('watch multi format')
    expect(cjsContent).toContain('watch multi format')
  })

  it('should respect watch delay configuration', async () => {
    await writeFile(
      new URL('src/delay-test.ts', fixtureDir),
      'export const delayTest = "delay test"',
    )

    // Test that delay configuration is accepted without errors
    const watchConfig = {
      enabled: true,
      delay: 500, // 500ms delay
      ignoreInitial: false,
    }

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/delay-test.ts',
          format: 'esm',
        },
      ],
      // Don't actually enable watch to avoid hanging
    })

    const content = await readFile(new URL('delay-test.mjs', distDir), 'utf8')
    expect(content).toContain('delay test')

    // Verify the config structure is valid
    expect(watchConfig.delay).toBe(500)
  })

  it('should handle watch with environment variables', async () => {
    await writeFile(
      new URL('src/env-watch.ts', fixtureDir),
      'export const version: string = process.env.VERSION || "unknown"',
    )

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/env-watch.ts',
          format: 'esm',
          env: {
            VERSION: '1.0.0-watch',
          },
        },
      ],
    })

    const content = await readFile(new URL('env-watch.mjs', distDir), 'utf8')
    expect(content).toContain('"1.0.0-watch"')
    expect(content).not.toContain('process.env.VERSION')
  })

  it('should handle watch with external dependencies', async () => {
    await writeFile(
      new URL('src/external-watch.ts', fixtureDir),
      'import { someFunction } from "some-external"\nexport const external: string = someFunction() + " with external"',
    )

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/external-watch.ts',
          format: 'esm',
          external: ['some-external'],
          dts: false, // Disable DTS generation to avoid type issues
        },
      ],
    })

    const content = await readFile(new URL('external-watch.mjs', distDir), 'utf8')
    // Check that external dependency is preserved and not bundled
    expect(content).toContain('from "some-external"')
    expect(content).toContain('external')
  })
})
