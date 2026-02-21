# Getting Started

## Installation

```bash
# Using pnpm (recommended)
pnpm add -D robuild

# Using npm
npm install -D robuild

# Using yarn
yarn add -D robuild
```

## First Bundle

### Zero-Config Build

robuild auto-detects `src/index.ts` as entry:

```bash
npx robuild
```

### Specify Entry

```bash
npx robuild ./src/index.ts
```

### Multiple Formats

```bash
npx robuild ./src/index.ts --format esm,cjs
```

### With Type Declarations

```bash
npx robuild ./src/index.ts --dts
```

## Configuration File

Create `build.config.ts`:

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
  ],
})
```

Then run:

```bash
npx robuild
```

## Output Structure

Default output in `dist/`:

```
dist/
├── index.mjs      # ESM format
├── index.cjs      # CJS format
└── index.d.mts    # Type declarations
```

## Watch Mode

For development:

```bash
npx robuild --watch
```

## Next Steps

- [Configuration Guide](guide-configuration.md) - Learn config options
- [CLI Reference](reference-cli.md) - All CLI commands
- [Plugins](advanced-plugins.md) - Add Rolldown plugins
