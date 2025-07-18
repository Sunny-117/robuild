import { readdir, readFile, rm, stat } from 'node:fs/promises'

import { beforeAll, describe, expect, it } from 'vitest'
import { build } from '../src/build.ts'

const fixtureDir = new URL('fixture/', import.meta.url)
const distDir = new URL('dist/', fixtureDir)

describe('robuild', () => {
  beforeAll(async () => {
    await rm(distDir, { recursive: true, force: true })
  })

  it('build fixture', async () => {
    await build({
      cwd: fixtureDir,
      entries: [
        { type: 'bundle', input: ['src/index', 'src/cli'] },
        { type: 'transform', input: 'src/runtime', outDir: 'dist/runtime' },
        'src/utils.ts',
      ],
    })
  })

  it('dist files match expected', async () => {
    const distFiles = await readdir(distDir, { recursive: true }).then(r =>
      r.sort(),
    )
    expect(distFiles).toMatchInlineSnapshot(`
      [
        "cli.d.mts",
        "cli.mjs",
        "index.d.mts",
        "index.mjs",
        "runtime",
        "runtime/index.d.mts",
        "runtime/index.mjs",
        "runtime/js-module.js",
        "runtime/test.d.mts",
        "runtime/test.mjs",
        "runtime/ts-module.d.mts",
        "runtime/ts-module.mjs",
        "utils.d.mts",
        "utils.mjs",
      ]
    `)
  })

  it('validate dist entries', async () => {
    const distIndex = await import(new URL('index.mjs', distDir).href)
    expect(distIndex.test).instanceOf(Function)

    const distRuntimeIndex = await import(new URL('index.mjs', distDir).href)
    expect(distRuntimeIndex.test).instanceOf(Function)

    const distUtils = await import(new URL('utils.mjs', distDir).href)
    expect(distUtils.test).instanceOf(Function)
  })

  it('runtime .dts files use .mjs extension', async () => {
    const runtimeIndexMts = await readFile(
      new URL('runtime/index.d.mts', distDir),
      'utf8',
    )
    expect(runtimeIndexMts).contain('./test.mjs')
  })

  it('cli shebang is executable', async () => {
    const cliPath = new URL('cli.mjs', distDir)
    const stats = await stat(cliPath)
    expect(stats.mode & 0o111).toBe(0o111) // Check if executable
  })
})
