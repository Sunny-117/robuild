<div align="center">
  <img src="./docs/public/logo.png" alt="robuild" width="30%" />
</div>

# 📦 robuild 😯 [![npm](https://img.shields.io/npm/v/robuild.svg)](https://npmjs.com/package/robuild)

简体中文 | <a href="./README-zh.md">English</a>

⚡️ 零配置的 ESM/TS 包构建工具。基于 [**Oxc**](https://oxc.rs/)、[**Rolldown**](https://rolldown.rs/) 和 [**rolldown-plugin-dts**](https://github.com/sxzz/rolldown-plugin-dts) 驱动。

## 功能特性

⚡ **快速**: 基于 [rolldown](https://rolldown.rs/) 和 [oxc](https://oxc.rs/) 构建
📦 **零配置**: 开箱即用，需要时可配置
🎯 **TypeScript**: 一流的 TypeScript 支持，自动生成 `.d.ts` 文件
🔄 **双模式**: 打包或转换您的源代码
🚀 **Stub 模式**: 文件链接的闪电般快速开发
🏢 **企业级**: 包导出生成、迁移工具

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

## 许可

💛 基于 [MIT](./LICENSE) 协议。
