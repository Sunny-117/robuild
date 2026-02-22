---
layout: home
title: robuild - 零配置 ESM/TS 包构建器
titleTemplate: false
hero:
  name: robuild
  text: 零配置 ESM/TS 包构建器
  tagline: 基于 oxc、rolldown 和 rolldown-plugin-dts 构建，专注于 ESM 兼容性和极速构建
  image:
    src: /logo.png
    alt: robuild
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看源码
      link: https://github.com/Sunny-117/robuild
    - theme: alt
      text: API 文档
      link: /api/

features:
  - icon: ⚡
    title: 极速构建
    details: 基于 oxc 和 rolldown 构建，相比传统构建工具性能提升显著
  - icon: 🎯
    title: 零配置
    details: 开箱即用，无需复杂配置，专注于 ESM 兼容性
  - icon: 🔧
    title: TypeScript 原生支持
    details: 内置 TypeScript 支持，自动生成类型声明文件
  - icon: 📦
    title: 双模式构建
    details: 支持 bundle 模式和 transform 模式，满足不同构建需求
  - icon: 📤
    title: 导出生成
    details: 自动生成 package.json exports 字段，支持多种格式
  - icon: 🔌
    title: 插件生态
    details: 兼容 Rollup/Vite/Unplugin，支持自定义钩子和 Glob 导入
  - icon: 🚀
    title: 高级构建
    details: CJS/ESM 互操作、兼容性垫片、文件加载器等高级功能
  - icon: 🎨
    title: 开发体验
    details: Stub 模式、监听模式、调试模式、成功回调等优秀开发体验

---

## 为什么选择 robuild？

robuild 是一个现代化的 TypeScript/ESM 包构建工具，专注于提供简单、快速、可靠的构建体验。

### 🚀 性能优势

- **基于 oxc**: 使用 Rust 编写的极速 JavaScript/TypeScript 解析器和转换器
- **基于 rolldown**: 高性能的 JavaScript 打包器，替代 Rollup
- **智能缓存**: 内置缓存机制，避免重复构建

### 🎯 设计理念

- **零配置优先**: 开箱即用，最小化配置复杂度
- **ESM 原生**: 专注于 ESM 模块系统的兼容性
- **TypeScript 友好**: 原生支持 TypeScript，自动处理类型声明

### 📦 核心特性

```bash
# 简单的一行命令构建
npx robuild ./src/index.ts

# 支持多种构建模式
npx robuild ./src/runtime/:./dist/runtime  # transform 模式
npx robuild ./src/index.ts                 # bundle 模式
```

### 🔧 技术栈

- **oxc**: JavaScript/TypeScript 解析和转换
- **rolldown**: 高性能打包器
- **rolldown-plugin-dts**: TypeScript 声明文件生成
- **exsolve**: 模块解析
- **magic-string**: 源码操作

## 快速体验

```bash
# 安装
npm install robuild

# 构建
npx robuild ./src/index.ts

# 开发模式
npx robuild ./src/index.ts --stub
```

## 社区

- [GitHub](https://github.com/Sunny-117/robuild) - 源码和问题反馈
- [Issues](https://github.com/Sunny-117/robuild/issues) - 报告问题
- [Discussions](https://github.com/Sunny-117/robuild/discussions) - 讨论和建议

## 许可证

[MIT License](./LICENSE) - 自由使用和修改

