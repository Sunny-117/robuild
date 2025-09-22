import { rm } from 'node:fs/promises'
import { beforeEach, describe } from 'vitest'
import { getTestDir, testBuild } from './utils'

beforeEach(async (context) => {
  const dir = getTestDir(context.task)
  await rm(dir, { recursive: true, force: true })
})

describe('external dependencies', () => {
  it('string external dependencies', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import lodash from 'lodash'
          import axios from 'axios'
          
          export function processData(data: any[]): any[] {
            return lodash.map(data, item => item.value)
          }
          
          export async function fetchData(url: string): Promise<any> {
            const response = await axios.get(url)
            return response.data
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: ['lodash', 'axios'],
          },
        ],
      },
    })
  })

  it('regex external dependencies', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import type { Request } from '@types/express'
          import type { Config } from '@types/node'
          import { utils } from '@internal/utils'
          
          export function handler(req: Request): void {
            console.log('Handling request')
          }
          
          export const config: Config = { port: 3000 }
          export { utils }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: [/^@types\//, /^@internal\//],
          },
        ],
      },
    })
  })

  it('function external dependencies', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import { customLib } from 'custom-package'
          import { internalUtil } from 'internal-util'
          import { externalLib } from 'external-lib'
          
          export function useCustom(): string {
            return customLib.version
          }
          
          export function useInternal(): string {
            return internalUtil.helper()
          }
          
          export function useExternal(): string {
            return externalLib.process()
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: (id: string) => id.startsWith('custom-') || id.startsWith('external-'),
          },
        ],
      },
    })
  })

  it('noExternal override', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import { shouldBundle } from 'should-bundle'
          import { shouldStayExternal } from 'should-stay-external'
          
          export function useBundled(): string {
            return shouldBundle.value
          }
          
          export function useExternal(): string {
            return shouldStayExternal.value
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: ['*'], // Keep everything external
            noExternal: ['should-bundle'], // Except this one
          },
        ],
      },
    })
  })

  it('mixed external configurations', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import lodash from 'lodash'
          import type { Express } from '@types/express'
          import { customExternal } from 'custom-external-lib'
          import { forceBundled } from 'force-bundled'
          
          export function processWithLodash(data: any[]): any[] {
            return lodash.map(data, x => x)
          }
          
          export function useCustom(): string {
            return customExternal.version
          }
          
          export function useBundled(): string {
            return forceBundled.helper()
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: [
              'lodash',
              /^@types\//,
              (id: string) => id.includes('external'),
            ],
            noExternal: ['force-bundled'],
          },
        ],
      },
    })
  })

  it('platform specific externals', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import fs from 'fs'
          import path from 'path'
          import { browserUtil } from 'browser-util'
          
          export function readFile(filename: string): string {
            return fs.readFileSync(path.join(__dirname, filename), 'utf8')
          }
          
          export function useBrowserUtil(): string {
            return browserUtil.process()
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
            external: ['fs', 'path'], // Node.js modules should be external for browser
          },
        ],
      },
    })
  })

  it('array of external dependencies', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import React from 'react'
          import ReactDOM from 'react-dom'
          import Vue from 'vue'
          import { Component } from '@angular/core'
          
          export function createReactApp(): JSX.Element {
            return React.createElement('div', null, 'Hello React')
          }
          
          export function renderReact(element: JSX.Element): void {
            ReactDOM.render(element, document.body)
          }
          
          export const vueApp = Vue.createApp({})
          
          export class AngularComponent {
            constructor() {}
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: ['react', 'react-dom', 'vue', '@angular/core'],
          },
        ],
      },
    })
  })

  it('noExternal with regex', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import { internalUtils } from 'internal-utils'
          import { internalHelpers } from 'internal-helpers'
          import { externalLib } from 'external-lib'
          
          export function useInternal(): string {
            return internalUtils.process() + internalHelpers.format()
          }
          
          export function useExternal(): string {
            return externalLib.version
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: ['*'],
            noExternal: [/^internal-/],
          },
        ],
      },
    })
  })

  it('noExternal with function', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import { bundleMePackage } from 'bundle-me-package'
          import { bundleMeUtils } from 'bundle-me-utils'
          import { keepExternal } from 'keep-external'
          
          export function useBundled(): string {
            return bundleMePackage.version + bundleMeUtils.helper()
          }
          
          export function useExternal(): string {
            return keepExternal.process()
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: ['*'],
            noExternal: (id: string) => id.includes('bundle-me'),
          },
        ],
      },
    })
  })

  it('complex external patterns', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          import { lib1 } from '@company/lib1'
          import { lib2 } from '@company/lib2'
          import { utils } from '@utils/core'
          import { helpers } from '@helpers/main'
          import lodash from 'lodash'
          import axios from 'axios'
          
          export function useCompanyLibs(): string {
            return lib1.version + lib2.name
          }
          
          export function useUtils(): string {
            return utils.format() + helpers.process()
          }
          
          export function useThirdParty(): string {
            return lodash.VERSION + axios.VERSION
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            external: [
              /^@company\//, // Company packages
              'lodash', // Specific package
              (id: string) => id === 'axios', // Function check
            ],
            noExternal: [
              /^@utils\//, // Bundle utils packages
              '@helpers/main', // Bundle specific helper
            ],
          },
        ],
      },
    })
  })
})
