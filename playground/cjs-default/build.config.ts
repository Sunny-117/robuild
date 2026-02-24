import { defineConfig } from 'robuild'

/**
 * CJS Default Export Example
 *
 * This example demonstrates the `cjsDefault` option which improves
 * CommonJS interoperability when generating CJS modules.
 *
 * When `cjsDefault` is enabled (default: true):
 * - CJS output uses `module.exports = ...` for default exports
 * - .d.cts files use `export = ...` syntax
 * - Consumers using `require('your-module')` receive the default export directly
 */
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      cjsDefault: true, // Default: true. Set to false to use named exports
    },
  ],
})
