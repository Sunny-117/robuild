import { rm } from 'node:fs/promises'
import { beforeEach, describe } from 'vitest'
import { getTestDir, testBuild } from './utils'

beforeEach(async (context) => {
  const dir = getTestDir(context.task)
  await rm(dir, { recursive: true, force: true })
})

describe('basic functionality', () => {
  it('simple bundle', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `export const hello = "Hello, world!"`,
      },
      options: {
        entries: [{ type: 'bundle', input: 'index.ts' }],
      },
    })
  })

  it('eSM format with types', async (context) => {
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
          
          export const version = '1.0.0'
        `,
      },
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
      files: {
        'index.ts': `
          export default function hello(): void {
            console.log('Hello!')
          }
        `,
      },
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

  it('multiple formats', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export function add(a: number, b: number): number {
            return a + b
          }
          
          export default add
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

  it('iIFE format with global name', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export function multiply(a: number, b: number): number {
            return a * b
          }
          
          export const PI = 3.14159
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'iife',
            globalName: 'MathUtils',
            platform: 'browser',
          },
        ],
      },
    })
  })

  it('environment variables', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const version: string = process.env.VERSION || 'unknown'
          export const buildMode: string = BUILD_MODE
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            env: {
              VERSION: '1.2.3',
            },
            define: {
              BUILD_MODE: '"production"',
            },
          },
        ],
      },
    })
  })

  it('external dependencies', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import lodash from 'lodash'

          export function processData(data: any[]): any[] {
            return lodash.map(data, item => item.value)
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: ['lodash'],
          },
        ],
      },
    })
  })

  it('transform mode', async (context) => {
    await testBuild({
      context,
      files: {
        'src/utils.ts': `export const utils: string = 'utility functions'`,
        'src/helpers.ts': `export const helpers: string = 'helper functions'`,
        'src/constants.ts': `export const CONSTANTS = { API_URL: 'https://api.example.com' } as const`,
      },
      options: {
        entries: [
          {
            type: 'transform',
            input: 'src',
            outDir: 'dist/lib',
          },
        ],
      },
      expectDir: 'dist/lib',
    })
  })

  it('clean functionality', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `export const cleaned: string = 'this should clean old files'`,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            clean: true,
          },
        ],
      },
    })
  })
})
