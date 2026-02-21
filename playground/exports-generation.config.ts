import { defineConfig } from 'robuild'

/**
 * Demonstrates the generateExports feature.
 *
 * This configuration shows how to:
 * 1. Enable exports generation at the entry level with `generateExports: true`
 * 2. Use custom export paths with `exportPath`
 * 3. Configure global exports settings with the `exports` field
 *
 * Run with: pnpm --filter demo build:exports
 */
export default defineConfig({
  entries: [
    // Main entry - exports as "." (root)
    {
      type: 'bundle',
      input: './src/exports-main/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: '.',
    },
    // Utils entry - exports as "./utils"
    {
      type: 'bundle',
      input: './src/utils/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: './utils',
      clean: false, // Don't clean to preserve previous entry's output
    },
  ],
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
})
