import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    // Main entry with dual format (ESM + CJS) for maximum compatibility
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
    },
    // Browser-optimized IIFE build
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      platform: 'browser',
      globalName: 'MyLibrary',
      outDir: './dist',
      fileName: 'browser.min.js',
      minify: true,
    },
  ],

  // Auto-generate package.json exports
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
    custom: {
      './package.json': './package.json',
    },
  },
})
