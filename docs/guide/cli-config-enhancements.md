# CLI 和配置增强

robuild 提供了丰富的 CLI 选项和配置功能，支持多种输出格式、平台目标、环境变量注入等高级特性。

## 🎨 多格式输出支持

### 支持的输出格式

| 格式 | 描述 | 适用场景 |
|------|------|----------|
| `esm` | ES 模块 | 现代 JavaScript 环境 |
| `cjs` | CommonJS | Node.js 环境 |
| `iife` | 立即执行函数 | 浏览器脚本标签 |
| `umd` | 通用模块定义 | 兼容多种环境 |

### CLI 使用

```bash
# 单一格式
npx robuild ./src/index.ts --format esm

# 多种格式
npx robuild ./src/index.ts --format esm --format cjs

# 所有格式
npx robuild ./src/index.ts --format esm --format cjs --format iife --format umd
```

### 配置文件

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'], // 多种格式
      outDir: './dist'
    }
  ]
})
```

### 输出文件结构

```
dist/
├── index.mjs          # ESM 格式
├── index.cjs          # CJS 格式
├── index.global.js    # IIFE 格式
└── index.umd.js       # UMD 格式
```

## 🌍 平台目标配置

### 支持的平台

| 平台 | 描述 | 特性 |
|------|------|------|
| `browser` | 浏览器环境 | 不包含 Node.js API |
| `node` | Node.js 环境 | 包含 Node.js 内置模块 |
| `neutral` | 中性平台 | 跨平台兼容 |

### CLI 使用

```bash
# 浏览器平台
npx robuild ./src/index.ts --platform browser

# Node.js 平台
npx robuild ./src/index.ts --platform node

# 中性平台
npx robuild ./src/index.ts --platform neutral
```

### 配置示例

```typescript
export default defineConfig({
  entries: [
    // 浏览器库
    {
      type: 'bundle',
      input: './src/browser.ts',
      platform: 'browser',
      format: ['esm', 'iife'],
      globalName: 'MyLib'
    },
    // Node.js 工具
    {
      type: 'bundle',
      input: './src/cli.ts',
      platform: 'node',
      format: 'cjs'
    }
  ]
})
```

## 🎯 全局变量名配置

为 IIFE 和 UMD 格式指定全局变量名。

### CLI 使用

```bash
# 指定全局变量名
npx robuild ./src/index.ts --format iife --global-name MyLibrary

# 复杂的全局变量名
npx robuild ./src/index.ts --format iife --global-name "window.MyCompany.MyLib"
```

### 配置文件

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['iife', 'umd'],
      globalName: 'MyLibrary',
      platform: 'browser'
    }
  ]
})
```

### 生成的代码示例

```javascript
// IIFE 格式输出
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.MyLibrary = {}));
}(this, (function (exports) { 'use strict';
  // 你的代码
})));
```

## 🎯 目标环境配置

### 支持的 ES 版本

- `es5`, `es2015`, `es2016`, `es2017`, `es2018`
- `es2019`, `es2020`, `es2021`, `es2022`, `esnext`

### CLI 使用

```bash
# 指定 ES 版本
npx robuild ./src/index.ts --target es2020

# 兼容旧浏览器
npx robuild ./src/index.ts --target es5 --platform browser
```

### 配置文件

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      target: 'es2020',
      platform: 'browser'
    }
  ]
})
```

## 📦 外部依赖配置

### 基本用法

```bash
# 单个外部依赖
npx robuild ./src/index.ts --external lodash

# 多个外部依赖
npx robuild ./src/index.ts --external lodash --external moment

# 使用正则表达式
npx robuild ./src/index.ts --external "/^@types\//"

# 强制打包特定依赖
npx robuild ./src/index.ts --external lodash --no-external internal-package
```

### 配置文件

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      external: [
        'lodash',           // 字符串
        /^@types\//,        // 正则表达式
        (id) => id.startsWith('node:') // 函数
      ],
      noExternal: [
        'some-internal-package' // 强制打包
      ]
    }
  ]
})
```

### 高级外部依赖配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      external: (id, importer) => {
        // 复杂的外部依赖逻辑
        if (id.startsWith('node:')) return true
        if (id.includes('node_modules')) return true
        if (importer?.includes('test')) return false
        return false
      }
    }
  ]
})
```

## 🔗 别名配置

### CLI 使用

通过配置文件设置别名：

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      alias: {
        '@': './src',
        '@utils': './src/utils',
        '@components': './src/components',
        '@types': './src/types'
      }
    }
  ]
})
```

### 使用示例

```typescript
// 源代码中使用别名
import { helper } from '@utils/helper'
import { Button } from '@components/Button'
import type { User } from '@types/user'

// 实际解析为
import { helper } from './src/utils/helper'
import { Button } from './src/components/Button'
import type { User } from './src/types/user'
```

### 高级别名配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      alias: {
        // 精确匹配
        'lodash': 'lodash-es',
        
        // 路径映射
        '@/*': './src/*',
        
        // 条件别名
        'utils': process.env.NODE_ENV === 'development' 
          ? './src/utils/dev' 
          : './src/utils/prod'
      }
    }
  ]
})
```

## 🌍 环境变量注入

### 基本用法

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      env: {
        VERSION: '1.0.0',
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com'
      }
    }
  ]
})
```

### 源代码使用

```typescript
// src/config.ts
export const config = {
  version: process.env.VERSION,
  nodeEnv: process.env.NODE_ENV,
  apiUrl: process.env.API_URL
}

// 构建后自动替换为
export const config = {
  version: "1.0.0",
  nodeEnv: "production", 
  apiUrl: "https://api.example.com"
}
```

### 编译时常量定义

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      define: {
        __DEV__: 'false',
        BUILD_TIME: 'Date.now()',
        'process.env.NODE_ENV': '"production"'
      }
    }
  ]
})
```

### 使用编译时常量

```typescript
// 源代码
if (__DEV__) {
  console.log('Development mode')
}

console.log('Built at:', BUILD_TIME)

// 构建后
if (false) {
  console.log('Development mode') // 会被 tree-shaking 移除
}

console.log('Built at:', 1640995200000)
```

## 🧹 清理功能

### CLI 使用

```bash
# 启用清理（默认）
npx robuild ./src/index.ts --clean

# 禁用清理
npx robuild ./src/index.ts --no-clean
```

### 配置选项

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      clean: true,              // 清理整个输出目录
      // clean: false,          // 不清理
      // clean: ['dist/old']    // 清理特定目录
    }
  ]
})
```

### 高级清理配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      clean: [
        'dist/js',      // 清理特定子目录
        'dist/*.old',   // 清理匹配的文件
        'temp'          // 清理临时目录
      ]
    }
  ]
})
```

## 📋 完整配置示例

### 企业级项目配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    // 主库构建
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      platform: 'neutral',
      target: 'es2020',
      clean: true,
      
      // 环境变量
      env: {
        VERSION: process.env.npm_package_version,
        BUILD_TIME: new Date().toISOString()
      },
      
      // 编译时常量
      define: {
        __DEV__: process.env.NODE_ENV === 'development',
        __VERSION__: `"${process.env.npm_package_version}"`
      },
      
      // 路径别名
      alias: {
        '@': './src',
        '@utils': './src/utils'
      },
      
      // 外部依赖
      external: ['lodash', /^@types\//],
      noExternal: ['internal-package']
    },
    
    // 浏览器版本
    {
      type: 'bundle',
      input: './src/browser.ts',
      format: ['iife', 'umd'],
      platform: 'browser',
      globalName: 'MyLib',
      target: 'es5',
      clean: false
    }
  ]
})
```

## 📚 相关文档

- [构建功能增强](./build-enhancements.md) - 文件复制、哈希、Banner 等
- [开发体验](./dev-experience.md) - 监听模式、成功回调等
- [高级构建选项](./advanced-build.md) - 加载器、垫片等
- [配置文件](./configuration.md) - 完整配置参考
