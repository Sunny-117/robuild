import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: '.'
    },
    {
      type: 'bundle',
      input: './src/utils/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: './utils'
    },
    {
      type: 'bundle',
      input: './src/cli.ts',
      format: ['esm'],
      dts: true,
      generateExports: true,
      exportPath: './cli'
    }
  ],
  exports: {
    enabled: true,
    autoUpdate: true,
    includeTypes: true
  }
})
