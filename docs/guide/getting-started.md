# 快速开始

## 安装

```bash
# 项目安装（推荐）
npm install --save-dev robuild

# 全局安装
npm install -g robuild

# 或直接使用 npx
npx robuild ./src/index.ts
```

## 基本使用

### 1. 创建源文件

```typescript
// src/index.ts
export function greet(name: string): string {
  return `Hello, ${name}!`
}
```

### 2. 构建

```bash
npx robuild ./src/index.ts
```

### 3. 查看输出

```
dist/
├── index.mjs      # 主文件
└── index.d.mts    # 类型声明
```

### 4. 配置 package.json

```json
{
  "name": "my-package",
  "type": "module",
  "main": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.mts"
    }
  },
  "scripts": {
    "build": "robuild ./src/index.ts"
  }
}
```

## 配置文件

创建 `build.config.ts` 进行更精细的配置：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

## 常见用法

```bash
# 多入口
robuild ./src/index.ts ./src/cli.ts

# 多格式
robuild ./src/index.ts --format esm --format cjs

# Transform 模式
robuild ./src/runtime/:./dist/runtime

# Stub 开发模式
robuild ./src/index.ts --stub

# 监听模式
robuild ./src/index.ts --watch
```

## 下一步

- [CLI 使用](./cli.md) - 命令行选项
- [配置](./configuration.md) - 配置文件详解
- [构建模式](./build-modes.md) - Bundle 与 Transform 模式
