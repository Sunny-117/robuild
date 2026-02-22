<div align="center">
  <img src="./docs/public/logo.png" alt="robuild" width="30%" />
</div>

# 📦 robuild 😯 [![npm](https://img.shields.io/npm/v/robuild.svg)](https://npmjs.com/package/robuild)

简体中文 | <a href="./README-zh.md">English</a>

⚡️ 零配置的 ESM/TS 包构建工具。基于 [**Oxc**](https://oxc.rs/)、[**Rolldown**](https://rolldown.rs/) 和 [**rolldown-plugin-dts**](https://github.com/sxzz/rolldown-plugin-dts) 驱动。

## 功能特性

- ⚡ **快速**: 基于 [rolldown](https://rolldown.rs/) 和 [oxc](https://oxc.rs/) 构建
- 📦 **零配置**: 开箱即用，需要时可配置
- 🎯 **TypeScript**: 一流的 TypeScript 支持，自动生成 `.d.ts` 文件
- 🔄 **双模式**: 打包或转换您的源代码
- 🚀 **Stub 模式**: 文件链接的闪电般快速开发
- 📤 **导出生成**: 自动生成 package.json exports 字段

## 安装

```sh
npm install robuild
# 或
pnpm add robuild
# 或
yarn add robuild
```

## 快速开始

```sh
# 打包你的库
npx robuild ./src/index.ts

# 转换源文件
npx robuild ./src/runtime/:./dist/runtime

# 开发时的监听模式
npx robuild ./src/index.ts --watch
```

## 使用方法

```sh
# 打包你的库
npx robuild ./src/index.ts

# 转换源文件
npx robuild ./src/runtime/:./dist/runtime

# 开发时的监听模式
npx robuild ./src/index.ts --watch
```

## 配置

在项目根目录创建 `build.config.ts`：

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

## 文档

📖 **[完整文档](https://sunny-117.github.io/robuild/)**

访问我们的文档站点获取详细指南、API 参考和示例。

## 相关项目

- [unbuild](https://github.com/unjs/unbuild)：基于 rollup 和 [mkdist](https://github.com/unjs/mkdist) 的稳定方案。
- [tsdown](https://tsdown.dev/)：基于 rolldown 的替代打包工具。

## 测试覆盖率

<!-- coverage-start -->
| 文件 | 语句 | 分支 | 函数 | 行数 |
|------|------|------|------|------|
| **全部文件** | **45.60%** | **40.43%** | **45.72%** | **45.78%** |
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

本地运行覆盖率测试：

```sh
pnpm test:coverage
```

## 许可

💛 基于 [MIT](./LICENSE) 协议。
