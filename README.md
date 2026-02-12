<div align="center">
  <img src="./docs/public/logo.png" alt="robuild" width="30%" />
</div>

# 📦 robuild 😯 [![npm](https://img.shields.io/npm/v/robuild.svg)](https://npmjs.com/package/robuild)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Coverage][coverage-src]][coverage-href]

English | <a href="./README-zh.md">简体中文</a>

⚡️ Zero-config ESM/TS package builder. Powered by [**Oxc**](https://oxc.rs/), [**Rolldown**](https://rolldown.rs/) and [**rolldown-plugin-dts**](https://github.com/sxzz/rolldown-plugin-dts).

## Features

- ⚡ **Fast**: Built on top of [rolldown](https://rolldown.rs/) and [oxc](https://oxc.rs/)
- 📦 **Zero config**: Works out of the box, configurable when needed
- 🎯 **TypeScript**: First-class TypeScript support with `.d.ts` generation
- 🔄 **Dual mode**: Bundle or transform your source code
- 🚀 **Stub mode**: Lightning-fast development with file linking
- 📤 **Exports**: Automatic package.json exports generation

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

## Test Coverage

<!-- coverage-start -->
| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| **All files** | **30.90%** | **64.07%** | **51.02%** | **30.90%** |
| src/build.ts | 70.93% | 55.56% | 100.00% | 70.93% |
| src/builders | 58.78% | 57.38% | 41.18% | 58.78% |
| src/config | 19.62% | 65.00% | 46.67% | 19.62% |
| src/config.ts | 0.00% | 100.00% | 100.00% | 0.00% |
| src/core | 63.86% | 90.91% | 50.00% | 63.86% |
| src/deprecated | 0.00% | 100.00% | 100.00% | 0.00% |
| src/index.ts | 0.00% | 0.00% | 0.00% | 0.00% |
| src/plugins | 13.62% | 68.75% | 47.37% | 13.62% |
| src/plugins/builtin | 7.65% | 92.31% | 23.33% | 7.65% |
| src/plugins/extras | 0.00% | 100.00% | 100.00% | 0.00% |
| src/transforms | 16.94% | 78.95% | 66.67% | 16.94% |
| src/types.ts | 0.00% | 100.00% | 100.00% | 0.00% |
| src/utils | 75.87% | 62.50% | 77.27% | 75.87% |
| src/watch.ts | 4.24% | 0.00% | 0.00% | 4.24% |
<!-- coverage-end -->

Run coverage locally:

```sh
pnpm test:coverage
```

## License

💛 [MIT](./LICENSE) License © [Sunny-117](https://github.com/Sunny-117)
<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/robuild?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/robuild
[npm-downloads-src]: https://img.shields.io/npm/dm/robuild?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/robuild
[bundle-href]: https://bundlephobia.com/result?p=robuild
[license-src]: https://img.shields.io/github/license/Sunny-117/robuild.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Sunny-117/robuild/blob/main/LICENSE
[coverage-src]: https://img.shields.io/badge/coverage-30.9%25-orange?style=flat&colorA=080f12
[coverage-href]: #test-coverage
