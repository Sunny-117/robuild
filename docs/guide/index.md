# 介绍

robuild 是一个现代化的 TypeScript/ESM 包构建工具，专注于提供简单、快速、可靠的构建体验。

## 什么是 robuild？

robuild 是一个零配置的 ESM/TypeScript 包构建器，它基于以下核心技术构建：

- **[oxc](https://oxc.rs/)**: 用 Rust 编写的极速 JavaScript/TypeScript 解析器和转换器
- **[rolldown](https://rolldown.rs/)**: 高性能的 JavaScript 打包器，替代 Rollup
- **[rolldown-plugin-dts](https://github.com/sxzz/rolldown-plugin-dts)**: TypeScript 声明文件生成插件

## 核心特性

### ⚡ 极速构建
- 基于 Rust 编写的 oxc 解析器，解析速度比 Babel 快 10-100 倍
- rolldown 打包器性能优异，构建速度显著提升
- 智能缓存机制，避免重复构建

### 🎯 零配置
- 开箱即用，无需复杂配置
- 自动检测项目结构和依赖
- 智能默认配置，满足大部分使用场景

### 📦 双模式构建
- **Bundle 模式**: 将多个文件打包成单个文件，适合库发布
- **Transform 模式**: 转换目录中的所有文件，保持文件结构

### 🔧 TypeScript 原生支持
- 内置 TypeScript 支持，无需额外配置
- 自动生成类型声明文件 (.d.ts)
- 支持最新的 TypeScript 特性

### 🚀 Stub 模式
- 开发时快速链接源码，无需重新构建
- 提升开发体验，支持热重载
- 支持多种运行时环境

### 👀 监听模式
- 文件变化时自动重新构建
- 智能文件检测和防抖机制
- 错误恢复和清晰的状态反馈

## 使用场景

### 库开发
```bash
# 构建库文件
npx robuild ./src/index.ts
```

### 工具开发
```bash
# 构建 CLI 工具
npx robuild ./src/cli.ts
```

### 运行时文件
```bash
# 转换运行时文件
npx robuild ./src/runtime/:./dist/runtime
```

### 开发模式
```bash
# 使用 stub 模式快速开发
npx robuild ./src/index.ts --stub

# 使用监听模式自动重建
npx robuild ./src/index.ts --watch
```

## 与其他工具对比

| 特性 | robuild | unbuild | tsup | rollup |
|------|---------|---------|------|--------|
| 零配置 | ✅ | ✅ | ✅ | ❌ |
| 极速构建 | ✅ | ❌ | ❌ | ❌ |
| ESM 原生 | ✅ | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ | ❌ |
| Stub 模式 | ✅ | ❌ | ❌ | ❌ |
| 监听模式 | ✅ | ✅ | ✅ | ❌ |

## 技术栈

robuild 的技术栈经过精心选择，确保性能和易用性：

- **oxc**: 极速的 JavaScript/TypeScript 解析和转换
- **rolldown**: 高性能的 JavaScript 打包器
- **exsolve**: 智能的模块解析
- **magic-string**: 高效的源码操作
- **consola**: 美观的控制台输出

## 下一步

- [快速开始](./getting-started.md) - 安装和基本使用
- [CLI 使用](./cli.md) - 命令行工具详解
- [配置](./configuration.md) - 配置文件选项
- [构建模式](./build-modes.md) - Bundle 和 Transform 模式详解
- [监听模式](./watch-mode.md) - 开发时自动重建
- [Stub 模式](./stub-mode.md) - 快速开发链接
