import type { RobuildPlugin } from 'robuild'
import { defineConfig } from 'robuild'

const testPlugin: RobuildPlugin = {
  name: 'hook-test',
  buildStart: async () => {
    // Hook implementation
    console.log('hook test===================')
  },
  writeBundle: async (...a) => {
    console.log('write bundle===================', a)
  },
}

export default defineConfig({
  entries: [{
    type: 'bundle',
    input: 'src/index.ts',
    noExternal: ['react'],
  }],
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
  plugins: [testPlugin],
})
