import type { RobuildPlugin } from 'robuild'
import { defineConfig } from 'robuild'

const testPlugin: RobuildPlugin = {
  name: 'hook-test',
  buildStart: async () => {
    // Hook implementation
    console.log('hook test===================')
  },
  writeBundle: async (options, bundle) => {
    console.log('write bundle===================', Object.keys(bundle))
    console.log('options:', options)
  },
}

export default defineConfig({
  entries: [{
    type: 'bundle',
    input: 'src/index.ts',
    noExternal: ['react'],
  }],
  // Use plugins for Rolldown plugin hooks like writeBundle, buildStart, transform, etc.
  // hooks field is only for build lifecycle hooks (start, end, entries, rolldownConfig, rolldownOutput)
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
  plugins: [testPlugin],
})
