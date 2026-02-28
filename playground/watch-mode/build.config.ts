import { defineConfig } from 'robuild'

export default defineConfig({
  entry: 'src/main.tsx',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  // Watch mode configuration
  watch: {
    enabled: true,
    // Files to watch (in addition to entry dependencies)
    include: ['src/**/*'],
    // Files to ignore
    exclude: ['node_modules/**', 'dist/**'],
    // Debounce delay in milliseconds
    delay: 100,
  },
})
