import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    // ESM and CJS for Node.js
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      target: 'es2015',
      dts: true
    },
  ]
})
