<div align="center">
  <img src="./docs/public/logo.png" alt="robuild" width="30%" />
</div>

# 📦 robuild 😯 [![npm](https://img.shields.io/npm/v/robuild.svg)](https://npmjs.com/package/robuild)

English | <a href="./README-zh.md">简体中文</a>

⚡️ Zero-config ESM/TS package builder. Powered by [**oxc**](https://oxc.rs/), [**rolldown**](https://rolldown.rs/) and [**rolldown-plugin-dts**](https://github.com/sxzz/rolldown-plugin-dts).

- 👌 Focus on ESM compatibility.
- 🌱 Fresh rewrite with cleanups and removal of legacy features.
- 🚀 Using [**oxc**](https://oxc.rs/) (for transform) and [**rolldown**](https://rolldown.rs/) (for bundle) for much faster builds!

## Proof of concept

> [!IMPORTANT]
>
> Features are incomplete, and API and output behavior may change between 0.x versions.
>
> Feedback and contributions are very welcome! If you'd like to make changes with more than a few lines of code, please open an issue first to discuss.

## Usage

### CLI

```sh
# bundle
npx robuild ./src/index.ts

# transform
npx robuild ./src/runtime/:./dist/runtime

# watch mode - rebuild on file changes
npx robuild ./src/index.ts --watch
```

You can use `--dir` to set the working directory and `--watch` to enable watch mode.

If paths end with `/`, robuild uses transpile mode using [oxc-transform](https://www.npmjs.com/package/oxc-transform) instead of bundle mode with [rolldown](https://rolldown.rs/).

### Programmatic

```js
import { build } from 'robuild'

await build({
  cwd: '.',
  entries: ['./src/index.ts'],
})
```

## Config

You can use `build.config.mjs` (or `.ts`) or pass config to `build()` function.

```js
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts'],
      // outDir: "./dist",
      // minify: false,
      // stub: false,
      // rolldown: {}, // https://rolldown.rs/reference/config-options
      // dts: {}, // https://github.com/sxzz/rolldown-plugin-dts#options
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      // minify: false,
      // stub: false,
      // oxc: {},
      // resolve: {}
    },
  ],
  hooks: {
    // start: (ctx) => {},
    // end: (ctx) => {},
    // entries: (entries, ctx) => {},
    // rolldownConfig: (config, ctx) => {},
    // rolldownOutput: (output, res, ctx) => {},
  },
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

## Prior Arts

- [unbuild](https://github.com/unjs/unbuild): Stable solution based on rollup and [mkdist](https://github.com/unjs/mkdist).
- [tsdown](https://tsdown.dev/): Alternative bundler based on rolldown.

## License

💛 Released under the [MIT](./LICENSE) license.
