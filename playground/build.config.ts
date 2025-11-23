import type { RobuildPlugin } from 'robuild'
import path from 'node:path'
import { defineConfig } from 'robuild'

const testPlugin: RobuildPlugin = {
  name: 'hook-test',
  buildStart: async () => {
    console.log('hook test===================')
  },
  writeBundle: async (options, bundle) => {
    console.log('write bundle===================', Object.keys(bundle))
  },
}

/**
 * tsup-style configuration example
 */
export default defineConfig({
  // Entry points (tsup-style)
  entry: 'src/index.ts',

  // Output formats
  format: ['esm'],

  // Output directory
  outDir: 'dist',

  // Target platform
  platform: 'node',

  // Target ES version
  target: 'es2020',

  // Generate declaration files
  dts: true,

  // Tree shaking
  treeshake: {
    moduleSideEffects: 'no-external',
  },

  // Source maps
  sourcemap: true,

  // Bundle react
  noExternal: ['react'],

  // Path aliases
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },

  // Advanced rolldown configuration (highest priority)
  rolldown: {
    logLevel: 'info',
    output: {
      sourcemap: true,
    },
  },

  // Hooks
  hooks: {
    start() {
      console.log('start')
    },
    end() {
      console.log('end')
    },
    rolldownConfig() {
      console.log('rolldownConfig')
    },
  },

  // Plugins
  plugins: [testPlugin],

  // Exports generation
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
})
