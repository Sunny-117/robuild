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
| **All files** | **45.60%** | **40.43%** | **45.72%** | **45.78%** |
| src/build.ts | 84.15% | 67.74% | 100.00% | 83.54% |
| src/builders | 79.83% | 71.76% | 85.19% | 79.83% |
| src/config | 42.31% | 26.21% | 56.67% | 42.06% |
| src/config.ts | 0.00% | 0.00% | 0.00% | 0.00% |
| src/core | 67.74% | 57.14% | 63.16% | 67.74% |
| src/deprecated | 0.00% | 0.00% | 0.00% | 0.00% |
| src/index.ts | 0.00% | 0.00% | 0.00% | 0.00% |
| src/plugins | 7.50% | 8.33% | 18.42% | 7.63% |
| src/plugins/builtin | 16.46% | 18.03% | 23.08% | 16.51% |
| src/plugins/extras | 0.00% | 0.00% | 0.00% | 0.00% |
| src/transforms | 71.43% | 63.77% | 81.82% | 71.27% |
| src/types.ts | 0.00% | 0.00% | 0.00% | 0.00% |
| src/utils | 73.87% | 61.17% | 95.65% | 73.87% |
| src/watch.ts | 0.00% | 0.00% | 0.00% | 0.00% |
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
[coverage-src]: https://img.shields.io/badge/coverage-45.6%25-yellow?style=flat&colorA=080f12
[coverage-href]: #test-coverage
