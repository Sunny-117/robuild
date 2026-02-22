import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.tsx',
      format: ['esm', 'cjs'],
      dts: true,
      external: ['react', 'react-dom']
    }
  ]
})
