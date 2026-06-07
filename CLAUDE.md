# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**robuild** is a zero-config ESM/TS package builder powered by Rolldown and Oxc, supporting multiple output formats and automatic type declaration generation.

Key technologies: **Rolldown** (Rust-based bundler), **Oxc** (transform/minify/parse), **pnpm** (v10.11.1), **Vitest**, **TypeScript** strict mode, pure ESM (`"type": "module"`).

This is a pnpm monorepo — the main package is the root; `packages/`, `playground/`, `example/` are workspace members.

## Commands

```bash
# Build (uses itself via esno)
pnpm build          # turbo-cached build
pnpm build:raw      # type-check then build directly
pnpm robuild        # run src/cli.ts directly via esno (no dist needed)
pnpm clean          # rm -rf .turbo dist coverage

# Test
pnpm test           # turbo-cached (requires build:raw first)
pnpm test:raw       # vitest run (also requires build:raw)
pnpm test:watch     # watch mode
pnpm test:raw test/bundle.test.ts   # single test file
pnpm test:types     # tsc --noEmit

# Lint
pnpm lint           # oxlint (turbo-cached)
pnpm lint:fix       # automd + oxlint --fix
```

> `pnpm test` and `pnpm test:raw` both `dependsOn: build:raw` in turbo — a dist/ build must exist before tests run.

## Architecture

### Core Build Flow

```
CLI (src/cli.ts)         — parses args, loads config via c12
  → build() (src/build.ts)
    → normalizeTsupConfig()  — converts flat tsup-style config to entries array
    → inheritConfig()        — merges top-level options into each entry
    → per entry:
        rolldownBuild()   (src/builders/bundle.ts)    — BundleEntry
        transformDir()    (src/builders/transform.ts) — TransformEntry
    → generateExports()  (src/transforms/exports.ts)  — if enabled
    → onSuccess callback
```

### Configuration

Two supported styles, both normalize to the entries array internally:

```typescript
// Entries-based (unbuild-style)
{ entries: [{ type: 'bundle', input: './src/index.ts', format: ['esm', 'cjs'] }] }

// Flat (tsup-style) — normalized by normalizeTsupConfig()
{ entry: ['./src/index.ts'], format: ['esm', 'cjs'], dts: true }
```

Config file is `build.config.ts` at project root, loaded via c12.

### Entry Types

- **BundleEntry**: Rolldown bundling. Supports `input`, `format`, `platform`, `target`, `dts`, `minify`, `external`, `plugins`, `generateExports`, `exportPath`.
- **TransformEntry**: Oxc file-by-file transform preserving directory structure. Supports `input` directory, `minify`, `oxc` options.

### Plugin Architecture

Plugins extend Rolldown's plugin interface:

```typescript
interface RobuildPlugin extends RolldownPlugin {
  robuildSetup?: (ctx: RobuildPluginContext) => void | Promise<void>
  robuildBuildStart?: (ctx: RobuildPluginContext) => void | Promise<void>
  robuildBuildEnd?: (ctx: { allOutputEntries: OutputEntry[] }) => void | Promise<void>
}
```

`RobuildPluginManager` (`src/plugins/manager.ts`) handles normalization and lifecycle hook execution.

### Key Patterns

- **Format extensions**: `getFormatExtension()` — ESM→`.mjs` (node)/`.js` (browser), CJS→`.cjs` (node)/`.js` (browser). Multi-format uses `.mjs`+`.cjs` to avoid conflicts.
- **DTS**: `rolldown-plugin-dts`, only enabled for ESM format to avoid conflicts.
- **External deps**: Auto-externalizes from package.json; supports regex and explicit `external`/`noExternal` lists. `lightningcss` and `unplugin-lightningcss` are optional peer deps and must always stay external.
- **Exports generation**: `generateExports: true` on entry + `exports.enabled: true` in config auto-updates package.json exports field.
- **Logging**: `src/core/logger.ts` via consola — use `logger.error/warn/info/log`.

## Testing Patterns

Tests build real packages in temp directories using `testBuild()` from `test/helpers/build.ts`:

```typescript
it('description', async (context) => {
  await testBuild({
    context,
    files: {
      'index.ts': 'export const foo = "bar"',
      'package.json': JSON.stringify({ name: 'test', version: '1.0.0' }),
    },
    config: { entries: [{ type: 'bundle', input: 'index.ts', format: ['esm'] }] },
    afterBuild: async (outputDir) => { /* assertions */ },
  })
})
```

Snapshot files are in `test/__snapshots__/`.
