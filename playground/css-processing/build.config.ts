import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      // Enable code splitting for async chunks
      splitting: true,
    },
  ],

  // CSS processing configuration
  css: {
    // Set to false to merge all CSS into a single file
    splitting: true,

    // Custom filename for the combined CSS file (when splitting: false)
    fileName: 'style.css',

    // Enable LightningCSS for modern CSS processing (requires unplugin-lightningcss)
    // lightningcss: true,
  },
})
