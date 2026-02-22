# 构建功能增强

robuild 提供了丰富的构建功能增强，包括文件复制、Banner/Footer、文件哈希、扩展名控制、Node.js 协议处理等高级特性。

## 📁 文件复制功能

### 基本用法

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      copy: [
        'README.md',                    // 简单路径 - 复制到输出目录，保留文件名
        'assets/logo.png',              // 相对路径 - 复制到输出目录，保留文件名
        { from: 'LICENSE', to: 'dist/LICENSE' } // 对象配置 - to 相对于项目根目录
      ]
    }
  ]
})
```

### 高级复制配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      copy: [
        // 简单路径 - 复制到输出目录，保留原文件名
        'README.md',

        // 对象配置 - to 是相对于项目根目录 (cwd) 的路径
        { from: 'assets/', to: 'dist/assets/' },

        // 重命名复制
        { from: 'src/config.example.json', to: 'dist/config.json' },
      ]
    }
  ]
})
```

> **注意**: 使用 `{ from, to }` 对象配置时，`to` 路径是相对于项目根目录 (cwd)，而不是输出目录。

### CLI 使用

文件复制功能主要通过配置文件使用，CLI 不直接支持。

### 复制时机

- **Bundle 模式**: 在所有格式构建完成后执行复制
- **Transform 模式**: 在文件转换完成后执行复制

## 📝 Banner/Footer 支持

### 基本用法

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      banner: '/* My Library v1.0.0 */',
      footer: '/* End of library */'
    }
  ]
})
```

### 格式特定的 Banner/Footer

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      banner: {
        js: '/* JavaScript Banner */',
        cjs: '/* CommonJS Banner */',
        esm: '/* ES Module Banner */'
      },
      footer: {
        js: '/* JavaScript Footer */',
        cjs: '/* CommonJS Footer */',
        esm: '/* ES Module Footer */'
      }
    }
  ]
})
```

### 动态 Banner 生成

```typescript
const pkg = require('./package.json')

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      banner: `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License.
 */`,
      footer: `/* Built at ${new Date().toISOString()} */`
    }
  ]
})
```

### 输出示例

```javascript
/*!
 * my-library v1.0.0
 * (c) 2024 Author Name
 * Released under the MIT License.
 */

// 你的代码内容
export const hello = 'world'

/* Built at 2024-01-01T00:00:00.000Z */
```

## 🔢 文件哈希支持

### 基本用法

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      hash: true  // 启用文件哈希
    }
  ]
})
```

### 哈希算法

- **算法**: SHA256
- **长度**: 8 位十六进制字符
- **位置**: 文件名和扩展名之间

### 输出文件示例

```
dist/
├── index-a1b2c3d4.mjs     # 带哈希的 ESM 文件
├── index-a1b2c3d4.cjs     # 带哈希的 CJS 文件
└── index-a1b2c3d4.d.ts    # 带哈希的类型文件
```

### 哈希的好处

- **缓存控制**: 内容变化时自动更新文件名
- **版本管理**: 不同版本有不同的文件名
- **CDN 友好**: 支持长期缓存策略

### 使用场景

```typescript
// 适合 CDN 部署的配置
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'iife'],
      hash: true,
      platform: 'browser'
    }
  ]
})
```

## 🔧 扩展名控制

### 固定扩展名

强制使用特定的文件扩展名：

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      fixedExtension: true  // ESM 使用 .mjs，CJS 使用 .cjs
    }
  ]
})
```

### 输出文件示例

```
# fixedExtension: true
dist/
├── index.mjs              # ESM 格式
└── index.cjs              # CJS 格式

# fixedExtension: false (默认)
dist/
├── index.mjs              # ESM 格式 (node 平台)
└── index.cjs              # CJS 格式 (node 平台)
```

## 🔗 Node.js 协议处理

### 基本用法

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      nodeProtocol: true      // 添加 node: 前缀
      // nodeProtocol: 'strip' // 移除 node: 前缀
      // nodeProtocol: false   // 不处理（默认）
    }
  ]
})
```

### 处理模式

| 模式 | 描述 | 示例 |
|------|------|------|
| `true` | 添加 `node:` 前缀 | `fs` → `node:fs` |
| `'strip'` | 移除 `node:` 前缀 | `node:fs` → `fs` |
| `false` | 不处理（默认） | 保持原样 |

### 源代码示例

```typescript
// 源代码
import { readFile } from 'fs'
import { resolve } from 'path'
import { createHash } from 'crypto'

// nodeProtocol: true 输出
import { readFile } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

// nodeProtocol: 'strip' 输出（如果源码有 node: 前缀）
import { readFile } from 'fs'
import { resolve } from 'path'
import { createHash } from 'crypto'
```

### 支持的 Node.js 内置模块

- `fs`, `path`, `crypto`, `http`, `https`
- `url`, `util`, `events`, `stream`
- `buffer`, `process`, `os`, `child_process`
- 等所有 Node.js 内置模块

### 使用场景

```typescript
// Node.js 库开发
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/node-lib.ts',
      platform: 'node',
      nodeProtocol: true  // 现代 Node.js 推荐使用 node: 前缀
    }
  ]
})

// 兼容性处理
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/legacy.ts',
      platform: 'node',
      nodeProtocol: 'strip'  // 移除前缀以兼容旧版本
    }
  ]
})
```

## 🔄 构建流程集成

### 完整构建流程

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      
      // 1. 清理输出目录
      clean: true,
      
      // 2. 构建配置
      format: ['esm', 'cjs'],
      platform: 'neutral',
      
      // 3. 代码处理
      banner: '/* My Library */',
      footer: '/* End */',
      
      // 4. 文件名处理
      hash: true,
      fixedExtension: true,
      
      // 5. Node.js 协议处理
      nodeProtocol: true,
      
      // 6. 文件复制
      copy: [
        'README.md',
        'LICENSE'
      ]
    }
  ]
})
```

### 执行顺序

1. **清理阶段**: 清理输出目录
2. **构建阶段**: 编译和打包代码
3. **处理阶段**: 添加 Banner/Footer
4. **文件名阶段**: 应用哈希和扩展名规则
5. **复制阶段**: 复制静态文件

## 📊 性能优化

### 条件性功能启用

```typescript
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      
      // 生产环境才启用哈希
      hash: isProduction,
      
      // 开发环境跳过复制
      copy: isProduction ? ['README.md'] : [],
      
      // 条件性 Banner
      banner: isProduction ? '/* Production Build */' : '/* Development Build */'
    }
  ]
})
```

### 大文件处理

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/large-app.ts',
      
      // 大文件不启用哈希（性能考虑）
      hash: false,
      
      // 简化 Banner
      banner: '/* App */',
      
      // 最小化复制
      copy: ['package.json']
    }
  ]
})
```

## 📚 相关文档

- [CLI 和配置增强](./cli-config-enhancements.md) - 多格式输出、平台目标等
- [开发体验](./dev-experience.md) - 监听模式、成功回调等
- [高级构建选项](./advanced-build.md) - 加载器、垫片等
- [配置文件](./configuration.md) - 完整配置参考
