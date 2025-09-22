<div align="center">
  <img src="./docs/public/logo.png" alt="robuild" width="30%" />
</div>

# 📦 robuild 😯 [![npm](https://img.shields.io/npm/v/robuild.svg)](https://npmjs.com/package/robuild)

English | <a href="./README-zh.md">简体中文</a>

⚡️ Zero-config ESM/TS package builder. Powered by [**oxc**](https://oxc.rs/), [**rolldown**](https://rolldown.rs/) and [**rolldown-plugin-dts**](https://github.com/sxzz/rolldown-plugin-dts).

## Features

- 🚀 **Fast**: Built on top of [rolldown](https://rolldown.rs/) and [oxc](https://oxc.rs/)
- 📦 **Bundle**: Bundle your library with dependencies
- 🔄 **Transform**: Transform your source code to different formats
- 🎯 **TypeScript**: First-class TypeScript support with `.d.ts` generation
- 📁 **Multiple entries**: Support multiple entry points
- 🔧 **Zero config**: Works out of the box, configurable when needed
- 👀 **Watch Mode**: Real-time file watching and automatic rebuilds
- 🎨 **Multi-format**: Support ESM, CJS, IIFE, UMD output formats
- 🧹 **Clean**: Automatic output directory cleaning
- 🌍 **Environment**: Compile-time environment variable injection
- 🎯 **Platform**: Browser, Node.js, and neutral platform targets
- 📦 **External**: Enhanced external dependency configuration

## Installation

```sh
npm install robuild
# or
pnpm add robuild
# or
yarn add robuild
```

## Quick Start

```sh
# Bundle your library
npx robuild ./src/index.ts

# Transform source files
npx robuild ./src/runtime/:./dist/runtime

# Watch mode for development
npx robuild ./src/index.ts --watch
```

## CLI Usage

### Basic Commands

```sh
# Bundle your library
npx robuild ./src/index.ts

# Transform source files (when path ends with /)
npx robuild ./src/runtime/:./dist/runtime

# Watch mode for development
npx robuild ./src/index.ts --watch
```

### Multi-format Output

```sh
# Build in multiple formats
npx robuild ./src/index.ts --format esm --format cjs --format iife

# Browser build with global name
npx robuild ./src/index.ts --format iife --platform browser --global-name MyLib
```

### Advanced Options

```sh
# External dependencies
npx robuild ./src/index.ts --external lodash --external /^@types\//

# Disable cleaning
npx robuild ./src/index.ts --no-clean

# Custom working directory
npx robuild ./src/index.ts --dir ./my-project
```

### CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `--format` | Output format(s) | `--format esm --format cjs` |
| `--platform` | Target platform | `--platform browser` |
| `--global-name` | Global name for IIFE/UMD | `--global-name MyLib` |
| `--external` | External dependencies | `--external lodash` |
| `--no-external` | Force bundle dependencies | `--no-external some-pkg` |
| `--clean` / `--no-clean` | Clean output directory | `--no-clean` |
| `--watch` / `-w` | Watch mode | `--watch` |
| `--dir` | Working directory | `--dir ./my-project` |
| `--stub` | Generate stub files | `--stub` |

## Configuration

### Programmatic Usage

```js
import { build } from 'robuild'

await build({
  cwd: '.',
  entries: ['./src/index.ts'],
})
```

### Config File

Create `build.config.ts` (or `.mjs`) in your project root:

```js
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'], // Multiple formats
      platform: 'node', // 'browser' | 'node' | 'neutral'
      globalName: 'MyLib', // For IIFE/UMD formats
      clean: true, // Clean output directory
      env: {
        VERSION: '1.0.0',
        NODE_ENV: 'production'
      },
      define: {
        __DEV__: 'false',
        BUILD_MODE: '"production"'
      },
      external: ['lodash', /^@types\//],
      noExternal: ['some-internal-package'],
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
    },
  ],
})
```

### Bundle Entry Options

| Option | Type | Description |
|--------|------|-------------|
| `input` | `string \| string[]` | Entry point(s) |
| `format` | `OutputFormat \| OutputFormat[]` | Output format(s): `esm`, `cjs`, `iife`, `umd` |
| `platform` | `Platform` | Target platform: `browser`, `node`, `neutral` |
| `globalName` | `string` | Global name for IIFE/UMD formats |
| `clean` | `boolean \| string[]` | Clean output directory |
| `env` | `Record<string, any>` | Environment variables to inject |
| `define` | `Record<string, string>` | Constants to define |
| `external` | `(string \| RegExp)[] \| function` | External dependencies |
| `noExternal` | `(string \| RegExp)[] \| function` | Force bundle dependencies |
| `outDir` | `string` | Output directory (default: `dist`) |
| `minify` | `boolean` | Minify output |
| `dts` | `boolean \| DtsOptions` | Generate TypeScript declarations |

## Advanced Features

### Multi-format Output

Build your library in multiple formats simultaneously:

**Supported Formats:**
- **ESM** (`.mjs`) - ES Modules for modern environments
- **CJS** (`.cjs`) - CommonJS for Node.js compatibility
- **IIFE** (`.js`) - Immediately Invoked Function Expression for browsers
- **UMD** (`.js`) - Universal Module Definition for maximum compatibility

**Output Structure:**
```
dist/
├── index.mjs          # ESM format
├── index.d.mts        # TypeScript declarations (ESM only)
├── index.cjs          # CJS format
└── index.js           # IIFE format
```

### Environment Variables & Constants

Inject environment variables and define constants at build time:

```js
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      env: {
        VERSION: '1.0.0',
        NODE_ENV: 'production'
      },
      define: {
        __DEV__: 'false',
        BUILD_MODE: '"production"'
      }
    }
  ]
})
```

This replaces `process.env.VERSION` with `"1.0.0"` and `__DEV__` with `false` at compile time.

### External Dependencies

Control which dependencies are bundled or kept external:

```js
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      external: [
        'lodash', // Keep lodash external
        /^@types\//, // Keep all @types/* external
        id => id.includes('node_modules') // Custom function
      ],
      noExternal: [
        'some-package' // Force bundle this package
      ]
    }
  ]
})
```

## Watch Mode

For development, robuild provides a watch mode that automatically rebuilds your project when files change.

### CLI Usage

```sh
# Enable watch mode for any build
npx robuild ./src/index.ts --watch

# Watch mode with transform
npx robuild ./src/runtime/:./dist/runtime --watch

# Watch mode with custom working directory
npx robuild ./src/index.ts --watch --dir ./my-project
```

### Configuration

You can configure watch behavior in your `build.config.ts`:

```js
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true, // Enable watch mode by default
    include: ['src/**/*'], // Files to watch
    exclude: ['**/*.test.ts'], // Files to ignore
    delay: 100, // Rebuild delay in ms
    ignoreInitial: false, // Skip initial build
    watchNewFiles: true, // Watch for new files
  },
})
```

### Features

- **Real-time rebuilding**: Automatically rebuilds when source files change
- **Smart file detection**: Automatically determines what files to watch based on your entries
- **Debounced rebuilds**: Configurable delay to prevent excessive rebuilds
- **Error recovery**: Continues watching even after build errors
- **Clear feedback**: Shows file changes and rebuild status
- **Graceful shutdown**: Clean exit with Ctrl+C

## Stub Mode

When working on a package locally, it can be tedious to rebuild or run the watch command every time.

You can use `stub: true` (per entry config) or the `--stub` CLI flag. In this mode, robuild skips the actual build and instead links the expected dist paths to the source files.

- For bundle entries, `.mjs` and `.d.mts` files re-export the source file.
- For transpile entries, src dir is symlinked to dist.

**Caveats:**

- You need a runtime that natively supports TypeScript. Deno, Bun, Vite, and Node.js (1)
- For transpile mode, you need to configure your bundler to resolve either `.ts` or `.mjs` extensions.
- For bundle mode, if you add a new entry or add/remove a `default` export, you need to run the stub build again.

(1) For Node.js, you have several options:

- Using `node --experimental-strip-types` (Available in [22.6](https://nodejs.org/en/blog/release/v22.6.0))
- Using [jiti](https://github.com/unjs/jiti) (`node --import jiti/register`)
- Using [oxc-node](https://github.com/oxc-project/oxc-node) (`node --import @oxc-node/core/register`)
- Using [unloader](https://github.com/sxzz/unloader) (`node --import unloader/register`)

## Status

> [!IMPORTANT]
>
> This is a proof of concept. Features are incomplete, and API and output behavior may change between 0.x versions.
>
> Feedback and contributions are very welcome! If you'd like to make changes with more than a few lines of code, please open an issue first to discuss.

## Prior Arts

- [unbuild](https://github.com/unjs/unbuild): Stable solution based on rollup and [mkdist](https://github.com/unjs/mkdist).
- [tsdown](https://tsdown.dev/): Alternative bundler based on rolldown.

## License

💛 Released under the [MIT](./LICENSE) license.
