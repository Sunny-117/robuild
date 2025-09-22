import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: [
      'test/temp/**',
      'test/__snapshots__/**',
      'test/fixtures/**',
      'node_modules/**',
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'test/**',
        'dist/**',
        'node_modules/**',
        '**/*.d.ts',
        'vitest.config.ts',
      ],
    },
  },
})
