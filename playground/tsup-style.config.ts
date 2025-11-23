import type { RobuildPlugin } from 'robuild'
import path from 'node:path'
import { defineConfig } from 'robuild'

const testPlugin: RobuildPlugin = {
  name: 'hook-test',
  buildStart: async () => {
    console.log('tsup-style config: hook test')
  },
  writeBundle: async (options, bundle) => {
    console.log('tsup-style config: write bundle', Object.keys(bundle))
  },
}

/**
 * tsup-style configuration example
 */
export default defineConfig({
  // Entry points (tsup-style)
  entry: 'src/index.ts',

  // Output formats
  format: ['esm', 'cjs'],

  // Output directory
  outDir: 'dist',

  // Target platform
  platform: 'node',

  // Target ES version
  target: 'es2020',

  // Generate declaration files
  dts: true,

  minify: false,

  // Tree shaking
  treeshake: {
    moduleSideEffects: 'no-external',
  },

  // Source maps
  sourcemap: true,

  // External dependencies (don't bundle react to keep output smaller)
  external: ['react'],
  // Or bundle react:
  // noExternal: ['react'],

  // Path aliases
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },

  // Plugins
  plugins: [testPlugin],

  // Exports generation
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
  hooks: {
    rolldownConfig(cfg) {
      console.log({ logger: cfg.resolve?.alias })
    },
  },
})
