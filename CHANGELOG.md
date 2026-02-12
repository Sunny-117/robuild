# Changelog


## v0.0.20

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.19...v0.0.20)

### 💅 Refactors

- Extract entry resolution and clean utilities to shared modules ([ed95c9a](https://github.com/Sunny-117/robuild/commit/ed95c9a))
- Improve logging and output formatting ([1d704c5](https://github.com/Sunny-117/robuild/commit/1d704c5))

### 🏡 Chore

- 🤖 remove es5 target ([559ec1e](https://github.com/Sunny-117/robuild/commit/559ec1e))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.19

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.18...v0.0.19)

### 🚀 Enhancements

- Add watch mode configuration and external dependencies handling ([715279b](https://github.com/Sunny-117/robuild/commit/715279b))
- Turbo build cache ([23ec7ef](https://github.com/Sunny-117/robuild/commit/23ec7ef))

### 💅 Refactors

- Extract external dependencies resolution to shared module ([5d6e984](https://github.com/Sunny-117/robuild/commit/5d6e984))

### 📖 Documentation

- Format ([dbd3825](https://github.com/Sunny-117/robuild/commit/dbd3825))

### 🏡 Chore

- Update rolldown ([fed2fe7](https://github.com/Sunny-117/robuild/commit/fed2fe7))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.18

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.17...v0.0.18)

## v0.0.17

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.16...v0.0.17)

### 🚀 Enhancements

- 🎸 loaders are now handled via rolldown's moduleTypes conf ([8c14b81](https://github.com/Sunny-117/robuild/commit/8c14b81))
- 🎸 rolldown watch functionality ([98251ac](https://github.com/Sunny-117/robuild/commit/98251ac))

### 💅 Refactors

- Remove CSS plugin and update plugin exports ([db9b743](https://github.com/Sunny-117/robuild/commit/db9b743))
- Normalize format values and consolidate config inheritance ([ac33734](https://github.com/Sunny-117/robuild/commit/ac33734))

### 🏡 Chore

- Remove sconfig.tsbuildinfo ([67442d7](https://github.com/Sunny-117/robuild/commit/67442d7))
- Update deployment workflow to use pnpm for package management ([44b99cd](https://github.com/Sunny-117/robuild/commit/44b99cd))
- Remove pnpm version specification from setup ([c2e705f](https://github.com/Sunny-117/robuild/commit/c2e705f))
- 🤖 remove unuseless code ([2e774fe](https://github.com/Sunny-117/robuild/commit/2e774fe))
- 🤖 banner case ([464480b](https://github.com/Sunny-117/robuild/commit/464480b))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.16

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.15...v0.0.16)

### 🚀 Enhancements

- **transform:** Support .tsx and .jsx file transformations, add sourcemap generation ([76b96c8](https://github.com/Sunny-117/robuild/commit/76b96c8))
- Enhance pnpm workspace configuration and improve rolldown watch mode ([be7a3fb](https://github.com/Sunny-117/robuild/commit/be7a3fb))

### 🩹 Fixes

- 🐛 ts error ([8acec72](https://github.com/Sunny-117/robuild/commit/8acec72))

### 💅 Refactors

- **tests:** Remove deprecated test files and consolidate test utilities ([13cb8e2](https://github.com/Sunny-117/robuild/commit/13cb8e2))
- Remove outdated snapshot files and improve snapshot handling ([d3a8fdd](https://github.com/Sunny-117/robuild/commit/d3a8fdd))
- Consolidate examples into unified playground structure ([07dc0df](https://github.com/Sunny-117/robuild/commit/07dc0df))

### 🏡 Chore

- 🤖 remove temp file ([ffed4a6](https://github.com/Sunny-117/robuild/commit/ffed4a6))
- 🤖 remove test helper file ([02f5a36](https://github.com/Sunny-117/robuild/commit/02f5a36))
- 🤖 remove cli test files ([4b51bda](https://github.com/Sunny-117/robuild/commit/4b51bda))
- Remove unused dependency 'defu' and update output format configuration ([75c8d8f](https://github.com/Sunny-117/robuild/commit/75c8d8f))
- 🤖 remove logs ([fc467c0](https://github.com/Sunny-117/robuild/commit/fc467c0))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.15

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.14...v0.0.15)

### 🚀 Enhancements

- 🎸 supports advanced rolldown configuration ([ebd15bd](https://github.com/Sunny-117/robuild/commit/ebd15bd))
- 🎸 Supports TSUP-style configurations, enhancing build fle ([406cb93](https://github.com/Sunny-117/robuild/commit/406cb93))
- 🎸 Update CLI options and improve default entry handling ([861b7b1](https://github.com/Sunny-117/robuild/commit/861b7b1))

### 💅 Refactors

- 💡 plugin hooks follow rolldown ([3ef35f7](https://github.com/Sunny-117/robuild/commit/3ef35f7))
- 💡 hooks field is only for build lifecycle hooks ([735afd4](https://github.com/Sunny-117/robuild/commit/735afd4))
- Replace util.parseArgs with cac for CLI argument parsing ([5eb286f](https://github.com/Sunny-117/robuild/commit/5eb286f))

### 🏡 Chore

- 🤖 remove builtin plugins entry ([0e73228](https://github.com/Sunny-117/robuild/commit/0e73228))
- Disable isolatedDeclarations ([a76b420](https://github.com/Sunny-117/robuild/commit/a76b420))
- Plugin hook example ([a6764c3](https://github.com/Sunny-117/robuild/commit/a6764c3))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.14

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.11...v0.0.14)

### 🚀 Enhancements

- 🎸 skipNodeModules auto inline oxc runtime helpers ([0703d24](https://github.com/Sunny-117/robuild/commit/0703d24))
- 🎸 perform watch build using rolldown builtin watch mode ([2a87397](https://github.com/Sunny-117/robuild/commit/2a87397))
- 🎸 generate exports ([22cff19](https://github.com/Sunny-117/robuild/commit/22cff19))

### 🩹 Fixes

- 🐛 JSON 内容被正确解析和序列化,入口文件不会被错误地外部化,正确处理绝对和相对路径,Rolldown 原生功 ([a2df969](https://github.com/Sunny-117/robuild/commit/a2df969))

### 💅 Refactors

- 💡 watch mode ([1f154cf](https://github.com/Sunny-117/robuild/commit/1f154cf))
- 💡 remove workspace ([43f9489](https://github.com/Sunny-117/robuild/commit/43f9489))
- 💡 remove migrate ([6eb7878](https://github.com/Sunny-117/robuild/commit/6eb7878))
- 💡 plugin system ([7d96f94](https://github.com/Sunny-117/robuild/commit/7d96f94))
- 💡 plugin dir ([fec34e6](https://github.com/Sunny-117/robuild/commit/fec34e6))

### 🏡 Chore

- Release ([5dade2b](https://github.com/Sunny-117/robuild/commit/5dade2b))
- Update todo ([71ba597](https://github.com/Sunny-117/robuild/commit/71ba597))
- Release ([df681e4](https://github.com/Sunny-117/robuild/commit/df681e4))
- Todo ([21139ca](https://github.com/Sunny-117/robuild/commit/21139ca))
- Add test case ([e2b171a](https://github.com/Sunny-117/robuild/commit/e2b171a))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## Unreleased

### 🩹 Fixes

- **skipNodeModules:** Auto-inline `@oxc-project/runtime` helpers - When using `skipNodeModules: true`, `@oxc-project/runtime` helpers (like `asyncToGenerator`) are now automatically inlined instead of being treated as external dependencies

## v0.0.11

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.10...v0.0.11)

### 🚀 Enhancements

- TimePlugin ([9d25498](https://github.com/Sunny-117/robuild/commit/9d25498))
- Support sourcemap config ([5d439ad](https://github.com/Sunny-117/robuild/commit/5d439ad))

### 📖 Documentation

- ✏️ badges ([1b0e66a](https://github.com/Sunny-117/robuild/commit/1b0e66a))

### 🏡 Chore

- Plugin system ([4ff82cb](https://github.com/Sunny-117/robuild/commit/4ff82cb))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.10

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.9...v0.0.10)

### 🚀 Enhancements

- NoExternal ([a326608](https://github.com/Sunny-117/robuild/commit/a326608))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.9

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.8...v0.0.9)

### 🩹 Fixes

- Update chokidar v3 to fix watch mode not work ([38727aa](https://github.com/Sunny-117/robuild/commit/38727aa))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.8

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.7...v0.0.8)

### 🩹 Fixes

- Watch mode not work ([7b08f38](https://github.com/Sunny-117/robuild/commit/7b08f38))

### 📖 Documentation

- Simplify readme ([d08b010](https://github.com/Sunny-117/robuild/commit/d08b010))

### 🏡 Chore

- Fix linter error ([eb164e1](https://github.com/Sunny-117/robuild/commit/eb164e1))
- Update readme ([6ffe460](https://github.com/Sunny-117/robuild/commit/6ffe460))
- Cac deps ([c8a013c](https://github.com/Sunny-117/robuild/commit/c8a013c))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.7

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.6...v0.0.7)

### 🚀 Enhancements

- Todo ([d369728](https://github.com/Sunny-117/robuild/commit/d369728))
- 多格式输出支持,清理,环境注入 ([102c53a](https://github.com/Sunny-117/robuild/commit/102c53a))
- Clean output directory for transform entries ([9184154](https://github.com/Sunny-117/robuild/commit/9184154))
- CLI 和配置增强 ([7c6f909](https://github.com/Sunny-117/robuild/commit/7c6f909))
- 构建功能增强 ([ba6771e](https://github.com/Sunny-117/robuild/commit/ba6771e))
- Workspace, filter and exports tool ([e07a75f](https://github.com/Sunny-117/robuild/commit/e07a75f))
- Plugin system ([1b69411](https://github.com/Sunny-117/robuild/commit/1b69411))
- Loader and shims support ([ab9b801](https://github.com/Sunny-117/robuild/commit/ab9b801))

### 🩹 Fixes

- Cli and watch test cases ([5d75f84](https://github.com/Sunny-117/robuild/commit/5d75f84))
- 开发体验增强 ([67ded37](https://github.com/Sunny-117/robuild/commit/67ded37))
- Types error ([c33f4c1](https://github.com/Sunny-117/robuild/commit/c33f4c1))

### 💅 Refactors

- **test:** Robuild test infra ([4551ba3](https://github.com/Sunny-117/robuild/commit/4551ba3))

### 📖 Documentation

- Optimize and update usage documentation ([a4c9d39](https://github.com/Sunny-117/robuild/commit/a4c9d39))
- Guide index ([1cae314](https://github.com/Sunny-117/robuild/commit/1cae314))
- Build enhance and cli config ([4dce18c](https://github.com/Sunny-117/robuild/commit/4dce18c))
- Remove cli conig enhance and simplify readme ([7a0bd18](https://github.com/Sunny-117/robuild/commit/7a0bd18))

### 🏡 Chore

- Update todo ([a1a69db](https://github.com/Sunny-117/robuild/commit/a1a69db))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.6

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.5...v0.0.6)

### 🚀 Enhancements

- Watch mode ([fce51ab](https://github.com/Sunny-117/robuild/commit/fce51ab))
- Watch mode usage ([f48fafd](https://github.com/Sunny-117/robuild/commit/f48fafd))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.5

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.4...v0.0.5)

### 🏡 Chore

- Update deps ([94c063c](https://github.com/Sunny-117/robuild/commit/94c063c))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.4

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.2...v0.0.4)

### 🚀 Enhancements

- Robuild build ([734d63c](https://github.com/Sunny-117/robuild/commit/734d63c))
- Ts moduleResolution ([074cc94](https://github.com/Sunny-117/robuild/commit/074cc94))
- 文档 ([e3612ff](https://github.com/Sunny-117/robuild/commit/e3612ff))
- Robuild website ([#1](https://github.com/Sunny-117/robuild/pull/1))
- Deploy shell ([7ec5dd3](https://github.com/Sunny-117/robuild/commit/7ec5dd3))

### 📖 Documentation

- Update reamde ([93f5498](https://github.com/Sunny-117/robuild/commit/93f5498))
- Update readme ([9c8a7e2](https://github.com/Sunny-117/robuild/commit/9c8a7e2))
- Logo center ([cc02350](https://github.com/Sunny-117/robuild/commit/cc02350))

### 🏡 Chore

- **release:** V0.0.3 ([600fd2c](https://github.com/Sunny-117/robuild/commit/600fd2c))
- Update readme ([e0414f7](https://github.com/Sunny-117/robuild/commit/e0414f7))
- Update readme ([70ffaee](https://github.com/Sunny-117/robuild/commit/70ffaee))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>
- Sunny ([@Sunny-117](https://github.com/Sunny-117))

## v0.0.3

[compare changes](https://github.com/Sunny-117/robuild/compare/v0.0.2...v0.0.3)

## v0.0.2


### 🚀 Enhancements

- Setup and cli works ([01ce693](https://github.com/Sunny-117/robuild/commit/01ce693))
- RunEsbuild ([f1f3256](https://github.com/Sunny-117/robuild/commit/f1f3256))
- Robuild ([a7fbc60](https://github.com/Sunny-117/robuild/commit/a7fbc60))

### 📖 Documentation

- Add robuild doc ([35fc241](https://github.com/Sunny-117/robuild/commit/35fc241))
- Update readme and deploy shell ([66ff5cc](https://github.com/Sunny-117/robuild/commit/66ff5cc))

### 🏡 Chore

- Docs ([f8c3139](https://github.com/Sunny-117/robuild/commit/f8c3139))
- Lint ignores ([50d7496](https://github.com/Sunny-117/robuild/commit/50d7496))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

