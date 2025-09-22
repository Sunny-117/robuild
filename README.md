<div align="center">
  <img src="./docs/public/logo.png" alt="robuild" width="30%" />
</div>

# 📦 robuild 😯 [![npm](https://img.shields.io/npm/v/robuild.svg)](https://npmjs.com/package/robuild)

English | <a href="./README-zh.md">简体中文</a>

⚡️ Zero-config ESM/TS package builder. Powered by [**oxc**](https://oxc.rs/), [**rolldown**](https://rolldown.rs/) and [**rolldown-plugin-dts**](https://github.com/sxzz/rolldown-plugin-dts).

## Features

⚡ **Fast**: Built on top of [rolldown](https://rolldown.rs/) and [oxc](https://oxc.rs/)
📦 **Zero config**: Works out of the box, configurable when needed
🎯 **TypeScript**: First-class TypeScript support with `.d.ts` generation
🔄 **Dual mode**: Bundle or transform your source code
🚀 **Stub mode**: Lightning-fast development with file linking
🏢 **Enterprise**: Workspace support, package filtering, migration tools

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

## Usage

```sh
# Bundle your library
npx robuild ./src/index.ts

# Transform source files
npx robuild ./src/runtime/:./dist/runtime

# Watch mode for development
npx robuild ./src/index.ts --watch
```

## Configuration

Create `build.config.ts` in your project root:

```js
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
    },
  ],
})
```

## Documentation

📖 **[Complete Documentation](https://sunny-117.github.io/robuild/)**

Visit our documentation site for detailed guides, API reference, and examples.

## Prior Arts

- [unbuild](https://github.com/unjs/unbuild): Stable solution based on rollup and [mkdist](https://github.com/unjs/mkdist).
- [tsdown](https://tsdown.dev/): Alternative bundler based on rolldown.

## License

💛 Released under the [MIT](./LICENSE) license.
