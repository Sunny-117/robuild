import { defineConfig } from '../../src'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],

      // Banner/Footer - can be string or format-specific object
      banner: {
        esm: `/*!
 * build-enhancements-demo (ESM)
 * Built with robuild
 * Date: ${new Date().toISOString()}
 */`,
        cjs: `/*!
 * build-enhancements-demo (CJS)
 * Built with robuild
 * Date: ${new Date().toISOString()}
 */`,
      },
      footer: '/* End of bundle */',

      // Hash - add content hash to filename for cache busting
      hash: isProduction,

      // Fixed extension - use .mjs/.cjs instead of .js
      fixedExtension: true,

      // Node protocol - add 'node:' prefix to Node.js built-in modules
      nodeProtocol: true,

      // Copy files to output directory
      copy: [
        'README.md',
        'LICENSE',
        // Object form: { from, to } where 'to' is relative to cwd
        { from: 'assets/config.example.json', to: 'dist/config.json' },
      ],
    },
  ],
})
