# Vite Config Sharing Example

This example demonstrates how to use `--from-vite` option to share configuration between Vite and robuild.

## Features

- Share library build configuration from `vite.config.ts`
- Automatic entry point detection from Vite's `build.lib.entry`
- Format conversion (es -> esm, cjs -> cjs)
- External dependencies handling

## Configuration

The `vite.config.mjs` defines the library build configuration:

```javascript
import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      formats: ['es', 'cjs'],
    },
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      external: ['lodash-es'],
    },
  },
})
```

## Build

Build with robuild using Vite config:

```bash
npm run build
# or
robuild --from-vite
```

Build with Vite (for comparison):

```bash
npm run build:dev
```

## Output

- `dist/index.mjs` - ESM bundle
- `dist/index.cjs` - CJS bundle
- `dist/index.d.mts` - Type declarations

## How It Works

When you run `robuild --from-vite`, robuild will:

1. Look for `vite.config.mjs` (or `.ts`, `.js`, `.mts`) in the current directory
2. Parse the `build.lib` configuration
3. Convert Vite formats to robuild formats (`es` -> `esm`, `cjs` -> `cjs`)
4. Apply external dependencies from `rollupOptions.external`
5. Use the same output directory

This allows you to maintain a single source of truth for your library configuration while using robuild's faster builds powered by Rolldown.
