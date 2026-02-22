import solid from 'rolldown-plugin-solid'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm'],
      dts: true,
    }
  ],
  plugins: [solid()],
  external: ['solid-js']
})
