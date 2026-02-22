import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'transform',
      input: './src',
      outDir: './dist'
    }
  ]
})
