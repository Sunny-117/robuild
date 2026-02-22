import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/cli.ts',
      format: ['esm'],
      platform: 'node',
    },
  ],
})
