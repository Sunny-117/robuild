import { defineConfig } from '../../src'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
    },
  ],

  // Log level control
  // Options: 'silent' | 'error' | 'warn' | 'info' | 'verbose'
  logLevel: isDev ? 'verbose' : 'info',

  // Fail build on warnings (useful for CI)
  failOnWarn: !isDev,

  // Ignore patterns for watch mode
  ignoreWatch: [
    '**/*.test.ts',
    '**/*.spec.ts',
    'docs/**',
    '**/*.md',
  ],

  // Success callback - can be string command or function
  onSuccess: (result) => {
    console.log(`✅ Build completed in ${result.duration}ms`)

    // Example: send notification, trigger deployment, etc.
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Ready for production deployment')
    }
  },

  // Alternative: string command
  // onSuccess: 'echo "Build completed!" && npm run postbuild',
})
