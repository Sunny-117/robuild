import { defineConfig } from './src/config.ts'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts', './src/config.ts'],
    },
  ],
  // Example watch configuration
  watch: {
    enabled: false, // Set to true to enable watch mode by default
    include: ['src/**/*'],
    exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    delay: 100,
    ignoreInitial: false,
    watchNewFiles: true,
  },
  plugins: [
    {
      name: 'robuild-plugin-build',
      transform(code, id) {
        console.log({ id })
        return {
          code,
        }
      },
      async buildEnd() {
        console.log('✅ buildEnd...')
      },
    },
  ],
})
