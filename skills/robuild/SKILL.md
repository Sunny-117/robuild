---
name: robuild
description: Zero-config ESM/TS package builder powered by Rolldown and Oxc. Use when building TypeScript libraries, generating type declarations, bundling for multiple formats, or migrating from tsup/unbuild.
---

# robuild - Zero-Config Package Builder

Blazing-fast bundler for TypeScript/JavaScript libraries powered by Rolldown and Oxc.

## When to Use

- Building TypeScript/JavaScript libraries for npm
- Generating TypeScript declaration files (.d.ts)
- Bundling for multiple formats (ESM, CJS, IIFE)
- Zero-config builds with sensible defaults
- Transforming directories without bundling
- Auto-generating package.json exports field
- Migrating from tsup or unbuild

## Quick Start

```bash
# Install
pnpm add -D robuild

# Basic usage (auto-detects src/index.ts)
npx robuild

# With specific entry
npx robuild ./src/index.ts

# Multiple formats
npx robuild ./src/index.ts --format esm,cjs

# Watch mode
npx robuild --watch

# With DTS generation
npx robuild --dts
```

## Basic Configuration

### Entries-based (unbuild-style)

```ts
// build.config.ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

### Flat config (tsup-style)

```ts
// build.config.ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
```

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Getting Started | Installation, first bundle, CLI basics | [guide-getting-started](references/guide-getting-started.md) |
| Configuration | Config file formats, options | [guide-configuration](references/guide-configuration.md) |
| CLI Reference | All CLI commands and options | [reference-cli](references/reference-cli.md) |
| Plugins | Rolldown plugin support | [advanced-plugins](references/advanced-plugins.md) |

## Build Options

| Option | Usage | Reference |
|--------|-------|-----------|
| Entry points | `input: './src/index.ts'` or `entry: ['src/*.ts']` | [option-entry](references/option-entry.md) |
| Output formats | `format: ['esm', 'cjs', 'iife']` | [option-format](references/option-format.md) |
| Output directory | `outDir: 'dist'` | [option-output](references/option-output.md) |
| Type declarations | `dts: true` | [option-dts](references/option-dts.md) |
| Platform | `platform: 'node'` or `platform: 'browser'` | [option-platform](references/option-platform.md) |
| External deps | `external: ['react']` or `noExternal: ['lodash']` | [option-external](references/option-external.md) |
| Package exports | `generateExports: true`, `exports: { enabled: true }` | [option-exports](references/option-exports.md) |

## Entry Types

### Bundle Entry

Uses Rolldown for bundling:

```ts
{
  type: 'bundle',
  input: './src/index.ts',    // Entry point(s)
  format: ['esm', 'cjs'],     // Output formats
  outDir: 'dist',             // Output directory
  dts: true,                  // Generate .d.ts
  minify: false,              // Minify output
  platform: 'node',           // Target platform
  target: 'es2022',           // ECMAScript target
  external: [],               // External dependencies
  noExternal: [],             // Force bundle dependencies
  plugins: [],                // Rolldown plugins
  generateExports: true,      // Generate exports field
  exportPath: '.',            // Custom export path
}
```

### Transform Entry

Uses Oxc for file-by-file transformation:

```ts
{
  type: 'transform',
  input: './src',             // Source directory
  outDir: 'dist',             // Output directory
  minify: false,              // Minify output
}
```

## Common Patterns

### Basic Library Bundle

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

### Multiple Entry Points

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: {
        index: './src/index.ts',
        utils: './src/utils.ts',
        cli: './src/cli.ts',
      },
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

### With Package Exports Generation

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: '.',
    },
    {
      type: 'bundle',
      input: './src/utils/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: './utils',
      clean: false,
    },
  ],
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
})
```

### CLI Tool with Shebang

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/cli.ts',
      format: 'esm',
      platform: 'node',
      // Shebang is auto-preserved
    },
  ],
})
```

### Browser Library (IIFE)

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      globalName: 'MyLib',
      platform: 'browser',
      minify: true,
    },
  ],
})
```

### With ESM/CJS Shims

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      shims: true,  // Add __dirname, __filename shims
    },
  ],
})
```

### External Dependencies

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      external: ['react', 'react-dom', /^@myorg\//],
      noExternal: ['lodash-es'],  // Force bundle
    },
  ],
})
```

### With Rolldown Plugins

```ts
import { defineConfig } from 'robuild'
import somePlugin from 'some-rolldown-plugin'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm'],
      plugins: [somePlugin()],
      // Or via rolldown passthrough
      rolldown: {
        plugins: [anotherPlugin()],
      },
    },
  ],
})
```

### Transform Mode (Preserve Structure)

```ts
export default defineConfig({
  entries: [
    {
      type: 'transform',
      input: './src',
      outDir: 'dist',
    },
  ],
})
```

### Stub Mode (Development)

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: true,  // Fast dev builds
    },
  ],
})
```

## CLI Quick Reference

```bash
# Basic commands
robuild                           # Build once
robuild --watch                   # Watch mode
robuild --config custom.ts        # Custom config

# Entry options
robuild src/index.ts              # Single entry
robuild src/a.ts src/b.ts         # Multiple entries

# Output options
robuild --format esm,cjs          # Multiple formats
robuild --outDir lib              # Custom output directory
robuild --minify                  # Enable minification
robuild --dts                     # Generate declarations

# Development
robuild --watch                   # Watch mode
robuild --sourcemap               # Generate source maps
robuild --clean                   # Clean output directory

# Package exports
robuild --generate-exports        # Generate package.json exports
```

## Configuration Options

### Global Options

```ts
{
  // Working directory
  cwd: process.cwd(),

  // Output directory (default: 'dist')
  outDir: 'dist',

  // Output format(s)
  format: 'esm',  // or ['esm', 'cjs']

  // Target platform
  platform: 'node',  // or 'browser'

  // ECMAScript target
  target: 'es2022',

  // Clean output before build
  clean: true,

  // Generate source maps
  sourcemap: false,

  // Minify output
  minify: false,

  // Type declarations
  dts: false,

  // Exports generation
  exports: {
    enabled: false,
    includeTypes: true,
    autoUpdate: true,
  },

  // Post-build callback
  onSuccess: async () => {},

  // Fail on warnings
  failOnWarn: false,

  // Watch mode ignore patterns
  ignoreWatch: [],
}
```

## Best Practices

1. **Always generate type declarations** for TypeScript libraries:
   ```ts
   { dts: true }
   ```

2. **Use multi-format builds** for maximum compatibility:
   ```ts
   { format: ['esm', 'cjs'] }
   ```

3. **Externalize peer dependencies**:
   ```ts
   { external: ['react', 'react-dom'] }
   ```

4. **Enable exports generation** for proper package.json:
   ```ts
   { generateExports: true, exports: { enabled: true } }
   ```

5. **Use watch mode** during development:
   ```bash
   robuild --watch
   ```

6. **Clean output** before production builds:
   ```ts
   { clean: true }
   ```

7. **Use transform mode** for utilities with many files:
   ```ts
   { type: 'transform', input: './src' }
   ```

## Resources

- GitHub: https://github.com/Sunny-117/robuild
- Rolldown: https://rolldown.rs
- Oxc: https://oxc.rs
