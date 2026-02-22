import svelte from 'rollup-plugin-svelte'
import { sveltePreprocess } from 'svelte-preprocess'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm'],
    }
  ],
  plugins: [svelte({ preprocess: sveltePreprocess() })],
  external: ['svelte', 'svelte/internal']
})
