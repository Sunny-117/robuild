import { rm } from 'node:fs/promises'
import { beforeEach, describe } from 'vitest'
import { getTestDir, testBuild } from './utils'

beforeEach(async (context) => {
  const dir = getTestDir(context.task)
  await rm(dir, { recursive: true, force: true })
})

describe('output formats', () => {
  const basicFiles = {
    'index.ts': `
      export function hello(name: string): string {
        return \`Hello, \${name}!\`
      }
      
      export const version: string = '1.0.0'
      
      export default 'Multi-format test library'
    `,
  }

  it('eSM format', async (context) => {
    await testBuild({
      context,
      files: basicFiles,
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            dts: true,
          },
        ],
      },
    })
  })

  it('cJS format', async (context) => {
    await testBuild({
      context,
      files: basicFiles,
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'cjs',
          },
        ],
      },
    })
  })

  it('iIFE format', async (context) => {
    await testBuild({
      context,
      files: basicFiles,
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'iife',
            globalName: 'TestLib',
            platform: 'browser',
          },
        ],
      },
    })
  })

  it('uMD format', async (context) => {
    await testBuild({
      context,
      files: basicFiles,
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'umd',
            globalName: 'TestLib',
          },
        ],
      },
    })
  })

  it('multiple formats', async (context) => {
    await testBuild({
      context,
      files: basicFiles,
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: ['esm', 'cjs', 'iife'],
            globalName: 'TestLib',
            dts: true,
          },
        ],
      },
    })
  })

  it('platform browser', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const platform: string = 'browser'
          export function getPlatform(): string {
            return typeof window !== 'undefined' ? 'browser' : 'node'
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            platform: 'browser',
          },
        ],
      },
    })
  })

  it('platform node', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const platform: string = 'node'
          export function getPlatform(): string {
            return typeof process !== 'undefined' ? 'node' : 'browser'
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            platform: 'node',
          },
        ],
      },
    })
  })

  it('default export only', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export default function greet(name: string): string {
            return \`Hello, \${name}!\`
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: ['esm', 'cjs'],
            dts: true,
          },
        ],
      },
    })
  })

  it('named exports only', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const name: string = 'robuild'
          export const version: string = '1.0.0'
          export function build(): void {
            console.log('Building...')
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: ['esm', 'cjs'],
            dts: true,
          },
        ],
      },
    })
  })

  it('re-exports', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `export { utils } from './utils'`,
        'utils.ts': `export const utils: string = 'utility functions'`,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
          },
        ],
      },
    })
  })

  it('mixed exports and imports', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import { helper } from './helper'
          
          export const main: string = 'main module'
          export { helper }
          export default 'default export'
        `,
        'helper.ts': `export const helper: string = 'helper function'`,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
          },
        ],
      },
    })
  })
})
