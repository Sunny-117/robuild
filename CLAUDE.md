# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**robuild** is a zero-config ESM/TS package builder powered by Rolldown and Oxc. It's designed for building TypeScript libraries with minimal configuration, supporting multiple output formats and automatic type declaration generation.

**Key technologies:**

- **Rolldown**: Core bundler (Rust-based Rollup alternative)
- **Oxc**: Fast JavaScript/TypeScript toolchain (transform, minify, parse)
- **pnpm**: Package manager (v10.11.1)
- **Vitest**: Testing framework
- **TypeScript**: With strict mode enabled
- **ESM**: Pure ESM package (`"type": "module"`)

## Development Commands

### Building

```bash
# Build robuild using itself
pnpm build

# Development mode (runs robuild directly via esno)
pnpm robuild

# Build with turbo caching
pnpm build:raw
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests without turbo
pnpm test:raw

# Run tests in watch mode
pnpm test:watch

# Run a specific test file
pnpm test:raw test/bundle.test.ts

# Run with UI
pnpm test:ui

# Generate coverage
pnpm test:coverage
```

### Code Quality

```bash
# Lint (oxlint)
pnpm lint

# Fix lint issues
pnpm lint:fix

# Type check
pnpm test:types
```

### Documentation

```bash
# Run docs dev server
pnpm docs:dev

# Build docs
pnpm docs:build

# Preview built docs
pnpm docs:preview
```

## Architecture

### Core Build Flow

```
CLI (src/cli.ts)
  → build() (src/build.ts)
  → normalizeTsupConfig() - handle tsup-style config
  → inheritConfig() - merge top-level options into entries
  → For each entry:
    → rolldownBuild() for bundle entries (src/builders/bundle.ts)
    → transformDir() for transform entries (src/builders/transform.ts)
  → Generate exports if enabled (src/transforms/exports.ts)
  → Execute onSuccess callback
```

### Configuration System

**Two-style configuration support:**

1. **Entries-based (unbuild-style):**
   ```typescript
   {
     entries: [
       { type: 'bundle', input: './src/index.ts', format: ['esm', 'cjs'] },
       { type: 'transform', input: './src' }
     ]
   }
   ```

2. **Flat config (tsup-style):**
   ```typescript
   {
     entry: ['./src/index.ts'],
     format: ['esm', 'cjs'],
     dts: true
   }
   ```

**Config normalization pipeline:**

1. Load config file via c12 (`src/cli.ts`)
2. Normalize tsup-style to entries-based (`normalizeTsupConfig`)
3. Inherit top-level options into entries (`inheritConfig`)
4. Process each entry with appropriate builder

### Entry Types

**BundleEntry** (`src/types.ts:295-427`):
- Uses Rolldown for bundling
- Supports: input, format, platform, target, dts, minify, external, plugins
- New fields: `generateExports`, `exportPath` for exports generation

**TransformEntry** (`src/types.ts:430-456`):
- Uses Oxc for file-by-file transformation
- Preserves directory structure
- Supports: input directory, minify, oxc options

### Feature Modules

**Builders (`src/builders/`):**
- `bundle.ts` - Rolldown-based bundling with DTS support
- `transform.ts` - Oxc-based file transformation
- `unbundle.ts` - Unbundle mode (placeholder)

**Plugins (`src/plugins/`):**
- `manager.ts` - Plugin lifecycle management
- `factory.ts` - Plugin creation utilities
- `builtin/` - Built-in plugins:
  - `shims.ts` - ESM/CJS compatibility shims
  - `shebang.ts` - Shebang preservation
  - `node-protocol.ts` - Node protocol handling
  - `glob-import.ts` - Glob import support
  - `loaders.ts` - File loaders

**Transforms (`src/transforms/`):**
- `exports.ts` - Package.json exports generation
- `banner.ts` - Banner/footer injection
- `clean.ts` - Output directory cleaning
- `copy.ts` - File copying
- `on-success.ts` - Post-build callbacks

**Config (`src/config/`):**
- `entry-resolver.ts` - Entry point parsing and normalization
- `external.ts` - External dependencies resolution
- `vite-config.ts` - Vite config loading support

### Plugin Architecture

Plugins use Rolldown's plugin interface with robuild extensions:

```typescript
interface RobuildPlugin extends RolldownPlugin {
  robuildSetup?: (ctx: RobuildPluginContext) => void | Promise<void>
  robuildBuildStart?: (ctx: RobuildPluginContext) => void | Promise<void>
  robuildBuildEnd?: (ctx: { allOutputEntries: OutputEntry[] }) => void | Promise<void>
}
```

`RobuildPluginManager` handles:
- Plugin normalization
- Lifecycle hook execution
- Context updates during build

### Key Architectural Patterns

1. **Multi-format builds:** Single entry produces ESM + CJS + types. Extension handling via `getFormatExtension()` based on format and platform.

2. **DTS generation:** Uses `rolldown-plugin-dts` for type declaration generation. DTS only enabled for ESM format to avoid conflicts.

3. **Package exports generation:** `generateExports` option on entries, `exports.enabled` in config. Auto-updates package.json with exports field.

4. **External resolution:** Auto-externalizes dependencies from package.json. Supports regex patterns and explicit external/noExternal lists.

5. **Dual config style:** Supports both unbuild-style (entries array) and tsup-style (flat config) for easy migration.

## Testing Patterns

### Test Setup

**Test utilities:** `test/helpers/`

- `build.ts` - `testBuild()` helper for build testing
- `fixtures.ts` - Fixture management utilities
- `snapshot.ts` - Snapshot testing utilities

### Test Structure

Test files are in `test/` directory:

```
test/
├── bundle.test.ts     - Bundle mode tests
├── cli.test.ts        - CLI tests
├── exports.test.ts    - Exports generation tests
├── transform.test.ts  - Transform mode tests
├── helpers/           - Test utilities
└── __snapshots__/     - Snapshot files
```

Example test pattern:

```typescript
import { describe, expect, it } from 'vitest'
import { testBuild } from './helpers'

describe('feature name', () => {
  it('should do something', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': 'export const foo = "bar"',
        'package.json': JSON.stringify({ name: 'test', version: '1.0.0' }),
      },
      config: {
        entries: [{ type: 'bundle', input: 'index.ts', format: ['esm'] }],
      },
      afterBuild: async (outputDir) => {
        // Assertions
      },
    })
  })
})
```

## Important Patterns

### Entry Point Resolution

Entry points support:
- Single file: `'./src/index.ts'`
- Array: `['./src/index.ts', './src/cli.ts']`
- Object (named): `{ index: './src/index.ts', cli: './src/cli.ts' }`

### Format Extensions

- ESM: `.mjs` (node), `.js` (browser)
- CJS: `.cjs` (node), `.js` (browser)
- Multi-format: `.mjs` + `.cjs` to avoid conflicts

### Exports Generation

Enable with:
```typescript
{
  entries: [
    { type: 'bundle', input: './src/index.ts', generateExports: true, exportPath: '.' }
  ],
  exports: { enabled: true, autoUpdate: true, includeTypes: true }
}
```

### Plugin Usage

```typescript
{
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [myRolldownPlugin()],
      rolldown: { plugins: [anotherPlugin()] }
    }
  ]
}
```

## Special Considerations

### TypeScript Configuration

- Build uses `rolldown-plugin-dts` for declaration generation
- `isolatedDeclarations` support via Oxc
- Type checking separate via `tsc --noEmit`

### Oxc Integration

robuild heavily uses Oxc:
- `oxc-parser` - Fast TypeScript parsing
- `oxc-transform` - Code transformation
- `oxc-minify` - Minification

### Logging

Use `src/core/logger.ts` for all logging:
- `logger.error()`, `logger.warn()`, `logger.info()`, `logger.log()`
- Colorized output via `consola`

### Watch Mode

Watch mode (`src/watch.ts`):
- Uses chokidar for file watching
- Debounced rebuilds
- Configurable ignore patterns
