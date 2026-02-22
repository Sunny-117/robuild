# Robuild Full-Featured Demo

A comprehensive example demonstrating all robuild features.

## Features Demonstrated

### Build Configuration

- **Multiple Bundle Entries**
  - Main library (ESM + CJS with DTS)
  - CLI entry with shebang
  - Browser IIFE bundle (minified)
  - Utils sub-package
  - Services sub-package

- **Output Formats**
  - ESM (`.mjs`)
  - CommonJS (`.cjs`)
  - IIFE (for browsers)

- **TypeScript Support**
  - Declaration generation with Oxc (faster than tsc)
  - Path aliases (`@utils`, `@types`, `@services`)
  - Explicit type annotations for `isolatedDeclarations` compatibility

### Code Optimization

- Tree shaking
- Minification (for browser bundle)
- Source maps

### Advanced Features

- **ESM/CJS Shims** - `__dirname`, `require()` in ESM
- **Custom Loaders** - Text, SVG, JSON, Images, Fonts
- **Banner/Footer** - License headers per format
- **File Copying** - Copy README.md and LICENSE to dist
- **Content Hash** - Cache busting for browser bundle
- **Fixed Extensions** - Use `.mjs`/`.cjs` extensions
- **Package.json Exports** - Auto-generated

### Plugin Features

- **Virtual Modules** - Inject build-time information
- **Build Hooks** - Lifecycle callbacks

## Project Structure

```
src/
├── index.ts        # Main entry (ESM + CJS)
├── cli.ts          # CLI entry (ESM with shebang)
├── browser.ts      # Browser entry (IIFE)
├── core.ts         # Core module with plugin system
├── types/          # TypeScript type definitions
│   └── index.ts
├── utils/          # Utility functions
│   ├── index.ts
│   ├── helpers.ts
│   └── string.ts
├── services/       # Services module
│   ├── index.ts
│   ├── logger.ts
│   ├── http.ts
│   └── events.ts
└── assets/         # Static assets
    ├── sample.txt
    └── logo.svg
```

## Usage

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Build with watch mode
pnpm build:watch

# Development (stub mode)
pnpm dev

# Test the built library
pnpm test
```

## Output Structure

After building, the `dist/` directory will contain:

```
dist/
├── index.mjs               # ESM bundle
├── index.cjs               # CJS bundle
├── index.d.mts             # Type declarations
├── cli.mjs                 # CLI bundle (ESM)
├── browser-[hash].js       # Browser bundle (minified IIFE with hash)
├── README.md               # Copied from root
├── LICENSE                 # Copied from root
├── utils/
│   ├── index.mjs           # Utils ESM
│   ├── index.cjs           # Utils CJS
│   └── index.d.mts         # Utils types
└── services/
    ├── index.mjs           # Services ESM
    └── index.d.mts         # Services types
```

## Configuration Highlights

See `build.config.ts` for the complete configuration with comments explaining each feature.

### Key Configuration Sections

1. **Entries** - 5 bundle entries with different configurations
2. **DTS** - Using `oxc: true` for faster declaration generation
3. **Copy** - Copy static files to dist
4. **Hash** - Content hash for browser bundle
5. **Fixed Extension** - Use `.mjs`/`.cjs` for utils
6. **Loaders** - Asset handling (text, svg, json, images, fonts)
7. **Shims** - ESM/CJS compatibility
8. **Banner/Footer** - Code injection per format
9. **Plugins** - Virtual module example
10. **Hooks** - Build lifecycle callbacks
11. **Exports** - package.json generation

## Virtual Module Example

The build config includes a virtual module plugin that injects build information:

```typescript
// In build.config.ts
plugins: [
  {
    name: 'virtual-build-info',
    resolveId(id) {
      if (id === 'virtual:build-info') {
        return '\0virtual:build-info'
      }
    },
    load(id) {
      if (id === '\0virtual:build-info') {
        return `
          export const buildTime = ${JSON.stringify(new Date().toISOString())};
          export const nodeVersion = ${JSON.stringify(process.version)};
          export const platform = ${JSON.stringify(process.platform)};
        `
      }
    },
  },
]
```

Usage in source code:

```typescript
// @ts-expect-error - virtual module
import { buildTime, nodeVersion, platform } from 'virtual:build-info'

export const buildInfo = { buildTime, nodeVersion, platform }
```

## Importing the Library

```typescript
// Main entry
import { Robuild, VERSION, formatBytes, buildInfo } from 'robuild-full-featured-demo'

// Utils sub-package
import { camelCase, debounce } from 'robuild-full-featured-demo/utils'

// Services sub-package
import { Logger, HttpClient } from 'robuild-full-featured-demo/services'

// Browser (IIFE) - load via script tag
// <script src="dist/browser-[hash].js"></script>
// window.RobuildDemo.RobuildBrowser.version()
```

## isolatedDeclarations Support

When using `dts: { oxc: true }`, all exported variables must have explicit type annotations:

```typescript
// ✅ Good - explicit type annotation
export const VERSION: string = '1.0.0'

// ❌ Bad - no type annotation (will fail with isolatedDeclarations)
export const VERSION = '1.0.0'
```

This enables much faster DTS generation using Oxc instead of TypeScript compiler.
