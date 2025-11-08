import { rm } from 'node:fs/promises'
import { beforeEach, describe, expect } from 'vitest'
import { getTestDir, testBuild } from './utils'

beforeEach(async (context) => {
  const dir = getTestDir(context.task)
  await rm(dir, { recursive: true, force: true })
})

describe('robuild core', () => {
  it('basic bundle', async (context) => {
    const content = `export const hello = "Hello, world!"`
    const { snapshot } = await testBuild({
      context,
      files: {
        'index.ts': content,
      },
      options: {
        entries: [{ type: 'bundle', input: 'index.ts' }],
      },
    })
    expect(snapshot).toContain('export { hello }')
  })

  it('bundle with multiple entries', async (context) => {
    await testBuild({
      context,
      files: {
        'src/index.ts': 'export const main = "main entry"',
        'src/cli.ts': '#!/usr/bin/env node\nexport const cli = "cli entry"',
        'src/utils.ts': 'export const utils = "utils entry"',
      },
      options: {
        entries: [
          { type: 'bundle', input: ['src/index.ts', 'src/cli.ts'] },
          'src/utils.ts',
        ],
      },
    })
  })

  it('transform mode', async (context) => {
    await testBuild({
      context,
      files: {
        'src/runtime/index.ts': 'export const runtime = "runtime"',
        'src/runtime/test.ts': 'export const test = () => "test"',
        'src/runtime/js-module.js': 'export const jsModule = "js"',
      },
      options: {
        entries: [
          { type: 'transform', input: 'src/runtime', outDir: 'dist/runtime' },
        ],
      },
    })
  })

  it('mixed bundle and transform', async (context) => {
    await testBuild({
      context,
      files: {
        'src/index.ts': 'export const bundled = "bundled"',
        'src/runtime/index.ts': 'export const runtime = "runtime"',
        'src/runtime/test.ts': 'export const test = () => "test"',
      },
      options: {
        entries: [
          { type: 'bundle', input: 'src/index.ts' },
          { type: 'transform', input: 'src/runtime', outDir: 'dist/runtime' },
        ],
      },
    })
  })

  it('typescript with types', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export interface User {
            name: string
            age: number
          }

          export function greet(user: User): string {
            return \`Hello, \${user.name}!\`
          }
        `,
      },
      options: {
        entries: [{ type: 'bundle', input: 'index.ts', dts: true }],
      },
    })
  })

  it('skipNodeModules with async code should inline @oxc-project/runtime', async (context) => {
    const { snapshot } = await testBuild({
      context,
      files: {
        'index.ts': `
          export async function fetchData() {
            const response = await fetch('https://api.example.com/data')
            return response.json()
          }

          export const asyncArrow = async () => {
            await Promise.resolve()
            return 'done'
          }
        `,
      },
      options: {
        entries: [{
          type: 'bundle',
          input: 'index.ts',
          format: 'esm',
          target: 'es2015',
          skipNodeModules: true,
        }],
      },
    })
    // Should NOT contain external import of @oxc-project/runtime
    expect(snapshot).not.toContain('import _asyncToGenerator from "@oxc-project/runtime')
    expect(snapshot).not.toContain('from "@oxc-project/runtime')

    // Should contain inlined helper code or transformed async functions
    // The exact output depends on the target and how rolldown handles it
  })
})
