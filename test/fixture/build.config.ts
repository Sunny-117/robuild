import type { BuildConfig } from '../../src'
import { defineConfig } from '../../src'

const config: BuildConfig = defineConfig({
  entries: [
    // ESM format with DTS
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'esm',
      platform: 'node',
      clean: true,
      env: {
        VERSION: '1.0.0',
        NODE_ENV: 'production',
      },
      define: {
        BUILD_MODE: '"production"',
        __DEV__: 'false',
      },
      external: ['lodash', /^@types\//],
      noExternal: ['some-internal-package'],
    },
    // CJS format
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'cjs',
      platform: 'node',
      clean: false, // Don't clean for second entry
      outDir: 'dist/cjs',
      env: {
        VERSION: '1.0.0',
        NODE_ENV: 'production',
      },
      define: {
        BUILD_MODE: '"production"',
        __DEV__: 'false',
      },
    },
    // IIFE format for browser
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      platform: 'browser',
      globalName: 'MyLib',
      clean: false,
      outDir: 'dist/browser',
      env: {
        VERSION: '1.0.0',
        NODE_ENV: 'production',
      },
      define: {
        BUILD_MODE: '"production"',
        __DEV__: 'false',
      },
    },
  ],
})

export default config
