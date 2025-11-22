import { defineConfig } from 'robuild'

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
})
