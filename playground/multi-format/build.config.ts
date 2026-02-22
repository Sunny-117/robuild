import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    // ESM and CJS for Node.js
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      platform: 'node',
      dts: true
    },
    // IIFE for browser
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      platform: 'browser',
      globalName: 'MyLibrary',
      outDir: './dist',
      fileName: 'index.iife.js',
      minify: true
    }
  ]
})
