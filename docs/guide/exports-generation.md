# 包导出生成 (Exports Generation)

robuild 提供了强大的包导出生成功能，可以自动生成 `package.json` 的 `exports` 字段，支持多种输出格式和类型定义，让您的包更好地支持现代 JavaScript 生态系统。

## 🚀 快速开始

### 基本用法

```bash
# 生成 exports 字段
npx robuild ./src/index.ts --generate-exports
```

### 配置文件

```typescript
// build.config.ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      generateExports: true
    }
  ],
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true
  }
})
```

## ⚙️ 配置选项

### 全局配置

```typescript
export default defineConfig({
  exports: {
    enabled: true,           // 启用导出生成
    includeTypes: true,      // 包含类型定义
    autoUpdate: true,        // 自动更新 package.json
    baseDir: './dist',       // 基础目录
    custom: {                // 自定义导出映射
      './utils': './dist/utils/index.js',
      './helpers': './dist/helpers/index.js'
    }
  }
})
```

### 配置选项详解

| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `enabled` | `boolean` | 启用导出生成 | `false` |
| `includeTypes` | `boolean` | 包含类型定义 | `true` |
| `autoUpdate` | `boolean` | 自动更新 package.json | `true` |
| `baseDir` | `string` | 输出文件的基础目录 | `'./dist'` |
| `custom` | `Record<string, string>` | 自定义导出映射 | `{}` |

### Entry 级别配置

每个 bundle entry 还可以配置：

| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `generateExports` | `boolean` | 为此 entry 生成 exports | `false` |
| `exportPath` | `string` | 自定义导出路径（如 `'.'` 或 `'./utils'`） | 自动推断 |

## 📦 生成示例

### 单一入口

**配置：**
```typescript
export default defineConfig({
  entries: [
    {
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      generateExports: true
    }
  ]
})
```

**生成的 exports：**
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

### 多入口导出

**配置：**
```typescript
export default defineConfig({
  entries: [
    {
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      generateExports: true
    },
    {
      input: './src/utils/index.ts',
      format: ['esm', 'cjs'],
      generateExports: true,
      exportPath: './utils'
    }
  ]
})
```

**生成的 exports：**
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils/index.d.mts",
      "import": "./dist/utils/index.mjs",
      "require": "./dist/utils/index.cjs"
    }
  }
}
```

## 🎯 高级用法

### 自定义导出路径

```typescript
export default defineConfig({
  exports: {
    enabled: true,
    custom: {
      './core': './dist/core/index.js',
      './plugins/*': './dist/plugins/*.js',
      './types': './dist/types/index.d.ts'
    }
  }
})
```

### 条件导出

```typescript
export default defineConfig({
  entries: [
    {
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      platform: 'node',
      generateExports: true
    },
    {
      input: './src/browser.ts',
      format: ['esm'],
      platform: 'browser',
      generateExports: true,
      exportPath: './browser'
    }
  ]
})
```

**生成的 exports：**
```json
{
  "exports": {
    ".": {
      "node": {
        "types": "./dist/index.d.mts",
        "import": "./dist/index.mjs",
        "require": "./dist/index.cjs"
      }
    },
    "./browser": {
      "browser": {
        "types": "./dist/browser.d.mts",
        "import": "./dist/browser.mjs"
      }
    }
  }
}
```

## 🔧 最佳实践

### 1. 库开发

```typescript
// 适合库开发的配置
export default defineConfig({
  entries: [
    // 主入口
    {
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true
    },
    // 工具函数
    {
      input: './src/utils/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: './utils'
    }
  ],
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true
  }
})
```

### 2. 组件库

```typescript
// 适合组件库的配置
export default defineConfig({
  entries: [
    // 主入口
    {
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      generateExports: true
    },
    // 各个组件
    {
      input: './src/components/*/index.ts',
      format: ['esm'],
      generateExports: true,
      exportPath: './components/*'
    }
  ],
  exports: {
    enabled: true,
    custom: {
      './package.json': './package.json'
    }
  }
})
```

## 📚 相关文档

- [配置文件](./configuration.md) - 完整配置参考
- [构建入口](./build-entries.md) - 了解构建入口配置
- [高级构建选项](./advanced-build.md) - 深入了解高级功能
