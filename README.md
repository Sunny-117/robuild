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
| **All files** | **86.44%** | **80.12%** | **92.94%** | **86.32%** |
| src/build.ts | 84.15% | 67.74% | 100.00% | 83.54% |
| src/builders | 89.89% | 82.80% | 96.43% | 89.89% |
| src/config | 85.38% | 67.96% | 100.00% | 84.92% |
| src/core | 74.19% | 57.14% | 68.42% | 74.19% |
| src/plugins | 97.50% | 95.37% | 97.37% | 97.46% |
| src/plugins/builtin | 88.15% | 84.92% | 95.59% | 88.12% |
| src/plugins/extras | 96.55% | 100.00% | 100.00% | 96.30% |
| src/transforms | 71.43% | 63.77% | 81.82% | 71.27% |
| src/utils | 88.29% | 85.44% | 100.00% | 88.29% |
| src/watch.ts | 81.48% | 81.82% | 57.14% | 81.48% |
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
[coverage-src]: https://img.shields.io/badge/coverage-86.4%25-brightgreen?style=flat&colorA=080f12
[coverage-href]: #test-coverage
