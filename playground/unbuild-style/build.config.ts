import type { RobuildPlugin } from 'robuild'
import path from 'node:path'
import { defineConfig } from 'robuild'

const testPlugin: RobuildPlugin = {
  name: 'hook-test',
  buildStart: async () => {
    // Hook implementation
    console.log('hook test===================')
  },
  writeBundle: async (options, bundle) => {
    console.log('write bundle===================', Object.keys(bundle))
    // console.log('options:', options)
  },
}

export default defineConfig({
  entries: [{
    type: 'bundle',
    input: 'src/index.tsx',
    noExternal: ['react'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // Advanced rolldown configuration (highest priority)
    rolldown: {
      // These options will override robuild's defaults
      logLevel: 'info',
      treeshake: {
        moduleSideEffects: 'no-external',
      },
      output: {
        // Custom output configuration
        sourcemap: true,
      },
    },
  }],
  // Use plugins for Rolldown plugin hooks like writeBundle, buildStart, transform, etc.
  // hooks field is only for build lifecycle hooks (start, end, entries, rolldownConfig, rolldownOutput)
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
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
  plugins: [testPlugin],
})
