import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: './dist',
  platform: 'neutral',
  // Configure loaders for static assets
  loaders: {
    // Images - use 'asset' for automatic optimization (base64 for small, file for large)
    '.png': { loader: 'asset' },
    '.jpg': { loader: 'asset' },
    '.jpeg': { loader: 'asset' },
    '.gif': { loader: 'asset' },
    '.webp': { loader: 'asset' },
    '.svg': { loader: 'text' }, // SVG as text for inline usage

    // Fonts - use 'asset' for automatic optimization
    '.woff': { loader: 'asset' },
    '.woff2': { loader: 'asset' },
    '.ttf': { loader: 'asset' },

    // Or use specific loaders:
    // '.png': { loader: 'file' },    // Always emit as file
    // '.svg': { loader: 'base64' },  // Always inline as base64
  },
  sourcemap: true,
  clean: true,
})
