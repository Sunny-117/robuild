import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'robuild'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootPkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'))

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/run.ts'],
      format: ['esm'],
      dts: true,
      define: {
        __ROBUILD_VERSION__: JSON.stringify(`^${rootPkg.version}`),
      },
    },
  ],
})
