# Configuration

## Config File

robuild supports multiple config file formats:

- `build.config.ts` (recommended)
- `build.config.js`
- `build.config.mjs`
- `build.config.cjs`
- `build.config.json`

## Two Configuration Styles

### Entries-based (unbuild-style)

More explicit, supports multiple entry types:

```ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    },
    {
      type: 'transform',
      input: './src/utils',
      outDir: 'dist/utils',
    },
  ],
})
```

### Flat config (tsup-style)

Simpler, auto-converted to entries internally:

```ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
```

## Entry Options

### Bundle Entry

```ts
{
  type: 'bundle',

  // Entry point(s)
  input: './src/index.ts',
  // Or array: ['./src/a.ts', './src/b.ts']
  // Or object: { index: './src/index.ts', cli: './src/cli.ts' }

  // Output format(s)
  format: 'esm',  // 'esm' | 'cjs' | 'iife' | ['esm', 'cjs']

  // Output directory
  outDir: 'dist',

  // Generate type declarations
  dts: true,

  // Target platform
  platform: 'node',  // 'node' | 'browser'

  // ECMAScript target
  target: 'es2022',

  // Minify output
  minify: false,

  // Source maps
  sourcemap: false,

  // External dependencies (not bundled)
  external: ['react', /^@myorg\//],

  // Force bundle (override external)
  noExternal: ['lodash-es'],

  // Clean output directory before build
  clean: true,

  // Add ESM/CJS shims
  shims: false,

  // Banner/footer
  banner: '/* banner */',
  footer: '/* footer */',

  // Rolldown plugins
  plugins: [],

  // Generate package.json exports entry
  generateExports: false,

  // Custom export path
  exportPath: '.',

  // Raw Rolldown options passthrough
  rolldown: {
    plugins: [],
    output: {},
  },
}
```

### Transform Entry

```ts
{
  type: 'transform',

  // Source directory
  input: './src',

  // Output directory
  outDir: 'dist',

  // Minify output
  minify: false,

  // Oxc transform options
  oxc: {},
}
```

## Global Options

Options applied to all entries:

```ts
export default defineConfig({
  // Working directory
  cwd: process.cwd(),

  // Default output directory
  outDir: 'dist',

  // Default format
  format: 'esm',

  // Default platform
  platform: 'node',

  // Default target
  target: 'es2022',

  // Clean before build
  clean: true,

  // Generate source maps
  sourcemap: false,

  // Minify
  minify: false,

  // DTS generation
  dts: false,

  // Fail on warnings
  failOnWarn: false,

  // Watch mode ignore patterns
  ignoreWatch: ['node_modules'],

  // Exports generation config
  exports: {
    enabled: false,
    includeTypes: true,
    autoUpdate: true,
    custom: {},
  },

  // Post-build callback
  onSuccess: async () => {
    console.log('Build done!')
  },

  // Entries array
  entries: [],
})
```

## Multiple Configs

Export an array for multiple configurations:

```ts
export default defineConfig([
  {
    entries: [
      { type: 'bundle', input: './src/index.ts', format: ['esm', 'cjs'] },
    ],
  },
  {
    entries: [
      { type: 'bundle', input: './src/cli.ts', format: 'esm', platform: 'node' },
    ],
  },
])
```

## Conditional Config

Use functions for dynamic configuration:

```ts
export default defineConfig((overrides) => ({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      minify: overrides.minify ?? false,
    },
  ],
}))
```
