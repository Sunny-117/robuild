import { defineConfig } from './src/config.ts'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts', './src/config.ts'],
    },
  ],
})
