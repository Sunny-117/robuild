import path from 'node:path'
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
    platform: 'node',
    // todo: unbuild style alias not works
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  }],
})
