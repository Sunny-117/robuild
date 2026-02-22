# ESM 兼容性

robuild 专注于提供完整的 ESM (ECMAScript Modules) 兼容性支持，确保你的库在现代 JavaScript 生态系统中无缝工作。

## 什么是 ESM？

ESM 是 JavaScript 的官方模块系统，提供了：

- **静态导入/导出**: 编译时确定的依赖关系
- **Tree Shaking**: 自动移除未使用的代码
- **异步加载**: 支持动态导入
- **更好的性能**: 浏览器原生支持

## robuild 的 ESM 支持

### 1. 原生 ESM 输出

robuild 默认生成 ESM 格式的输出：

```typescript
// 源码: src/index.ts
export function add(a: number, b: number): number {
  return a + b
}

export const version = '1.0.0'
```

```javascript
// 输出: dist/index.mjs
export function add(a, b) {
  return a + b;
}
export const version = "1.0.0";
```

### 2. 多格式支持

虽然专注于 ESM，robuild 也支持其他格式：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs', 'iife'],
      globalName: 'MyLibrary', // IIFE 格式需要
      platform: 'browser',     // IIFE 格式推荐使用 browser 平台
    }
  ]
})
```

### 3. 包导出配置

自动生成符合 ESM 标准的 `package.json` 导出：

```json
{
  "name": "my-library",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.mts"
    }
  },
  "main": "./dist/index.mjs",
  "types": "./dist/index.d.mts"
}
```

## ESM 最佳实践

### 1. 使用 .mjs 扩展名

robuild 自动使用 `.mjs` 扩展名确保 ESM 兼容性：

```bash
# 输出文件
dist/
├── index.mjs          # ESM 格式
├── index.d.mts        # TypeScript 声明
└── index.cjs          # CommonJS 格式（如果配置）
```

### 2. 动态导入支持

支持 ES2020 的动态导入语法：

```typescript
// 源码
export async function loadModule(name: string) {
  const module = await import(`./modules/${name}.js`)
  return module.default
}
```

### 3. import.meta 支持

robuild 完整支持 `import.meta` API：

```typescript
// 获取当前模块 URL
export const moduleUrl = import.meta.url

// 在 Node.js 中获取 __dirname 等效值
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

### 4. 条件导出

支持 Node.js 的条件导出：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.mts"
    },
    "./runtime": {
      "import": "./dist/runtime/index.mjs",
      "require": "./dist/runtime/index.cjs"
    }
  }
}
```

## 与 CommonJS 的互操作性

### 1. 导入 CommonJS 模块

```typescript
// 可以导入 CommonJS 模块
import lodash from 'lodash'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const legacyModule = require('./legacy-module')
```

### 2. 导出兼容性

```typescript
// 同时支持 ESM 和 CommonJS
export default function main() {
  return 'Hello ESM!'
}

// 兼容 CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = main
}
```

## 浏览器兼容性

### 1. 现代浏览器

```html
<!-- 直接使用 ESM -->
<script type="module">
  import { add } from './dist/index.mjs'
  console.log(add(1, 2))
</script>
```

### 2. 传统浏览器支持

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    // ESM for modern browsers
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'esm',
      platform: 'browser',
    },
    // IIFE for legacy browsers
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      globalName: 'MyLibrary',
      platform: 'browser',
      minify: true,
    }
  ]
})
```

## 开发工具集成

### 1. TypeScript 配置

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2020",
    "declaration": true,
    "outDir": "./dist"
  }
}
```

### 2. Vite 集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es']
    }
  }
})
```

### 3. Webpack 集成

```javascript
// webpack.config.js
module.exports = {
  experiments: {
    outputModule: true
  },
  output: {
    library: {
      type: 'module'
    }
  }
}
```

## 性能优势

### 1. Tree Shaking

ESM 的静态特性使得 Tree Shaking 更有效：

```typescript
// 只导入需要的函数
import { add } from 'my-library'
// 未使用的 multiply 函数会被移除
```

### 2. 并行加载

浏览器可以并行加载 ESM 模块：

```typescript
// 这些模块可以并行加载
import { utils } from './utils.js'
import { helpers } from './helpers.js'
```

### 3. 缓存优化

ESM 模块的缓存策略更高效：

```typescript
// 模块级别的缓存
import { heavyComputation } from './heavy.js'
// 只有 heavy.js 变化时才会重新加载
```

## 常见问题

### 1. 循环依赖

ESM 更好地处理循环依赖：

```typescript
// a.ts
import { b } from './b.js'
export const a = 'a'

// b.ts
import { a } from './a.js'
export const b = 'b'
```

### 2. 相对路径

使用相对路径导入：

```typescript
// ✅ 正确
import { utils } from './utils.js'
import { config } from '../config/index.js'

// ❌ 错误
import { utils } from './utils'
import { config } from '../config'
```

### 3. 文件扩展名

在 ESM 中需要明确指定扩展名：

```typescript
// ✅ 正确
import './styles.css'
import data from './data.json'

// ❌ 错误
import './styles'
import data from './data'
```

## 下一步

- [TypeScript 支持](./typescript.md) - TypeScript 与 ESM 集成
- [构建模式](./build-modes.md) - 不同构建模式的 ESM 支持
- [配置](./configuration.md) - ESM 相关配置选项
- [API 文档](../api/) - 程序化 API 使用
