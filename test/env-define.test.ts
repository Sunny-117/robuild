import { rm } from 'node:fs/promises'
import { beforeEach, describe } from 'vitest'
import { getTestDir, testBuild } from './utils'

beforeEach(async (context) => {
  const dir = getTestDir(context.task)
  await rm(dir, { recursive: true, force: true })
})

describe('environment variables and constants', () => {
  it('env variables replacement', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const version: string = process.env.VERSION || 'unknown'
          export const nodeEnv: string = process.env.NODE_ENV || 'development'
          export const apiUrl: string = process.env.API_URL || 'http://localhost:3000'
          
          export function getConfig() {
            return { version, nodeEnv, apiUrl }
          }
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
              NODE_ENV: 'production',
              API_URL: 'https://api.example.com',
            },
          },
        ],
      },
    })
  })

  it('define constants replacement', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const isDev: boolean = __DEV__
          export const buildMode: string = BUILD_MODE
          export const debugLevel: number = DEBUG_LEVEL
          export const featureFlag: boolean = FEATURE_FLAG
          
          export function getConstants() {
            return { isDev, buildMode, debugLevel, featureFlag }
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            define: {
              __DEV__: 'false',
              BUILD_MODE: '"production"',
              DEBUG_LEVEL: '0',
              FEATURE_FLAG: 'true',
            },
          },
        ],
      },
    })
  })

  it('mixed env and define', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const appVersion: string = process.env.APP_VERSION || '0.0.0'
          export const isProduction: boolean = IS_PRODUCTION
          export const buildTime: string = BUILD_TIME
          
          export function getMixedConfig() {
            return { appVersion, isProduction, buildTime }
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            env: {
              APP_VERSION: '2.0.0',
            },
            define: {
              IS_PRODUCTION: 'true',
              BUILD_TIME: '"2024-01-01T00:00:00Z"',
            },
          },
        ],
      },
    })
  })

  it('complex expressions', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const port: number = Number(process.env.PORT) || 8080
          export const timeout: number = DEFAULT_TIMEOUT * 2
          export const config = {
            port: process.env.PORT || '3000',
            timeout: DEFAULT_TIMEOUT,
            debug: process.env.DEBUG === 'true',
            maxRetries: MAX_RETRIES
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            env: {
              PORT: '3000',
              DEBUG: 'false',
            },
            define: {
              DEFAULT_TIMEOUT: '5000',
              MAX_RETRIES: '3',
            },
          },
        ],
      },
    })
  })

  it('conditional compilation', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export function logger(message: string): void {
            if (__DEV__) {
              console.log(\`[DEBUG] \${message}\`)
            }
          }
          
          export const features = {
            analytics: ENABLE_ANALYTICS,
            experiments: ENABLE_EXPERIMENTS,
            version: process.env.VERSION || 'dev'
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            env: {
              VERSION: '1.0.0',
            },
            define: {
              __DEV__: 'false',
              ENABLE_ANALYTICS: 'true',
              ENABLE_EXPERIMENTS: 'false',
            },
          },
        ],
      },
    })
  })

  it('multiple formats with env injection', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const version: string = process.env.VERSION || 'unknown'
          export const buildTime: string = BUILD_TIME
          export const isProduction: boolean = IS_PROD
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: ['esm', 'cjs'],
            env: {
              VERSION: '1.0.0',
            },
            define: {
              BUILD_TIME: '"2024-01-01"',
              IS_PROD: 'true',
            },
          },
        ],
      },
    })
  })

  it('nested object access', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const config = {
            api: {
              url: process.env.API_URL || 'localhost',
              timeout: API_TIMEOUT,
              retries: MAX_RETRIES
            },
            features: {
              debug: __DEBUG__,
              analytics: ANALYTICS_ENABLED
            }
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            env: {
              API_URL: 'https://api.prod.com',
            },
            define: {
              API_TIMEOUT: '30000',
              MAX_RETRIES: '5',
              __DEBUG__: 'false',
              ANALYTICS_ENABLED: 'true',
            },
          },
        ],
      },
    })
  })

  it('string interpolation', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `
          export const welcomeMessage: string = \`Welcome to \${APP_NAME} v\${process.env.VERSION}!\`
          export const buildInfo: string = \`Built on \${BUILD_DATE} in \${BUILD_MODE} mode\`
          
          export function getBuildInfo(): string {
            return \`\${APP_NAME} v\${process.env.VERSION} (\${BUILD_MODE})\`
          }
        `,
      },
      options: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
            env: {
              VERSION: '2.1.0',
            },
            define: {
              APP_NAME: '"MyApp"',
              BUILD_DATE: '"2024-01-01"',
              BUILD_MODE: '"production"',
            },
          },
        ],
      },
    })
  })
})
