import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [{
    type: 'bundle',
    input: './src/index.tsx',
    dts: true,
    format: ['esm'],
    target: 'es2015',
    skipNodeModules: true,
    sourcemap: true,
    platform: 'browser',
  }],
})
