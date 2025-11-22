import { describe, expect, it } from 'vitest'
import { testBuild } from './utils'

describe('target and alias configuration', () => {
  it('should support target configuration', async (ctx) => {
    const { fileMap } = await testBuild({
      context: ctx,
      files: {
        'index.ts': `
export const test = async () => {
  const obj = { a: 1, b: 2 }
  const { a, ...rest } = obj
  return { a, rest }
}

export class TestClass {
  #private = 'private'

  get value() {
    return this.#private
  }
}
        `.trim(),
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            outDir: 'dist',
            target: 'es2015',
            dts: false,
          },
        ],
      },
    })

    const content = fileMap['index.mjs']
    expect(content).toBeDefined()

    // Should not contain modern features like private fields
    expect(content).not.toContain('#private')
    expect(content).toContain('TestClass')
  })

  it('should support alias configuration in bundle mode', async (ctx) => {
    const { fileMap } = await testBuild({
      context: ctx,
      files: {
        'src/utils/helper.ts': `export const helper = 'helper function'`,
        'src/index.ts': `
import { helper } from '@/utils/helper'
export const test = helper
        `.trim(),
      },
      options: (cwd: string) => ({
        entries: [
          {
            type: 'bundle',
            input: 'src/index.ts',
            outDir: 'dist',
            alias: {
              '@': `${cwd}/src`,
            },
            dts: false,
          },
        ],
      }),
    })

    const content = fileMap['index.mjs']
    expect(content).toBeDefined()
    expect(content).toContain('helper function')
  })

  it('should support alias configuration in transform mode', async (ctx) => {
    const { fileMap } = await testBuild({
      context: ctx,
      files: {
        'src/utils/helper.ts': `export const helper = 'helper function'`,
        'src/index.ts': `
import { helper } from '@/utils/helper'
export const test = helper
        `.trim(),
      },
      options: (cwd: string) => ({
        entries: [
          {
            type: 'transform',
            input: 'src/',
            outDir: 'dist',
            alias: {
              '@': `${cwd}/src`,
            },
          },
        ],
      }),
    })

    const content = fileMap['index.mjs']
    expect(content).toBeDefined()
    // In transform mode, alias should be resolved to relative path
    expect(content).toContain('./utils/helper')
  })

  it('should support target configuration in transform mode', async (ctx) => {
    const { fileMap } = await testBuild({
      context: ctx,
      files: {
        'src/index.ts': `
export const test = async () => {
  const obj = { a: 1, b: 2 }
  const { a, ...rest } = obj
  return { a, rest }
}
        `.trim(),
      },
      options: {
        entries: [
          {
            type: 'transform',
            input: 'src/',
            outDir: 'dist',
            target: 'es2015',
          },
        ],
      },
    })

    const content = fileMap['index.mjs']
    expect(content).toBeDefined()

    // Should transform modern features for older target
    expect(content).toContain('async')
    expect(content).toContain('function')
  })
})
