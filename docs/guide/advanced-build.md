# 高级构建选项

robuild 提供了丰富的高级构建选项，帮助你精细控制构建过程，处理复杂的项目需求。

## 📁 文件加载器 (Loaders)

### 概述

文件加载器允许你处理不同类型的文件，将它们转换为 JavaScript 模块。

### 支持的加载器类型

| 加载器 | 文件类型 | 描述 |
|--------|----------|------|
| `js` | `.js`, `.mjs` | JavaScript 文件 |
| `jsx` | `.jsx` | React JSX 文件 |
| `ts` | `.ts`, `.mts` | TypeScript 文件 |
| `tsx` | `.tsx` | TypeScript JSX 文件 |
| `json` | `.json` | JSON 数据文件 |
| `css` | `.css` | CSS 样式文件 |
| `text` | `.txt`, `.md` | 文本文件 |
| `file` | 图片、字体等 | 文件 URL 导入 |
| `dataurl` | 小文件 | Base64 数据 URL |
| `binary` | 二进制文件 | 二进制数据 |
| `empty` | 任意文件 | 空模块 |

### 基本用法

```bash
# CLI 使用（通过配置文件）
npx robuild ./src/index.ts
```

### 配置文件

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      loaders: {
        '.json': { loader: 'json' },
        '.css': { loader: 'css' },
        '.txt': { loader: 'text' },
        '.png': { loader: 'file' },
        '.svg': { loader: 'dataurl' },
        '.wasm': { loader: 'binary' }
      }
    }
  ]
})
```

### 自定义加载器选项

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      loaders: {
        '.css': {
          loader: 'css',
          options: {
            minify: true,
            modules: true
          }
        },
        '.png': {
          loader: 'file',
          options: {
            publicPath: '/assets/',
            limit: 8192 // 小于 8KB 使用 dataurl
          }
        }
      }
    }
  ]
})
```

### 使用示例

```typescript
// 导入不同类型的文件
import config from './config.json'
import styles from './styles.css'
import readme from './README.md'
import logo from './logo.png'
import icon from './icon.svg'

console.log(config.version)
console.log(styles) // CSS 内容
console.log(readme) // Markdown 文本
console.log(logo) // 文件 URL
console.log(icon) // Base64 数据 URL
```

## 🔄 CommonJS 默认导出处理

### 概述

智能处理 CommonJS 到 ES 模块的转换，支持自动检测和手动控制。

### 基本用法

```bash
# 自动模式（推荐）
npx robuild ./src/index.js --cjs-default auto

# 强制启用
npx robuild ./src/index.js --cjs-default true

# 禁用转换
npx robuild ./src/index.js --cjs-default false
```

### 配置选项

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.js',
      cjsDefault: 'auto' // 'auto' | true | false
    }
  ]
})
```

### 转换示例

#### 输入 (CommonJS)

```javascript
// module.exports 转换
module.exports = { hello: 'world' }

// exports.* 转换
exports.name = 'robuild'
exports.version = '1.0.0'

// 混合导出
module.exports = { default: 'main' }
exports.helper = () => 'help'
```

#### 输出 (ES Modules)

```javascript
// 转换后
export default { hello: 'world' }

export const name = 'robuild'
export const version = '1.0.0'

export default { default: 'main' }
export const helper = () => 'help'
```

### 自动检测逻辑

- **置信度评分**: 分析代码中的 CommonJS 和 ES 模块特征
- **智能判断**: 只在明确是 CommonJS 时才转换
- **保护机制**: 避免破坏已有的 ES 模块代码

## 🛡️ 兼容性垫片 (Shims)

### 概述

为不同环境提供兼容性垫片，解决 Node.js 全局变量和浏览器环境差异。

### 基本用法

```bash
# 启用垫片
npx robuild ./src/index.ts --shims
```

### 配置选项

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      shims: true, // 或者详细配置
      // shims: {
      //   dirname: true,
      //   require: true,
      //   exports: true,
      //   env: true
      // }
    }
  ]
})
```

### 支持的垫片类型

#### Node.js 全局变量

```typescript
// 原代码
const path = __dirname
const file = __filename
const fs = require('fs')

// 生成的垫片
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createRequire } from 'node:module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
```

#### 浏览器环境

```typescript
// 原代码
console.log(process.env.NODE_ENV)

// 生成的垫片
const process = {
  env: {
    NODE_ENV: 'production'
  }
}
```

#### CommonJS 导出

```typescript
// 原代码
module.exports = {}
exports.test = 1

// 生成的垫片
const module = { exports: {} }
const exports = module.exports
```

### 平台特定配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      platform: 'browser',
      shims: {
        dirname: false, // 浏览器不需要
        require: false,
        exports: false,
        env: true // 浏览器需要 process.env
      }
    }
  ]
})
```

## 🚫 跳过 Node Modules

### 概述

控制是否将 node_modules 中的依赖打包到最终输出中。

### 基本用法

```bash
# 跳过 node_modules 打包
npx robuild ./src/index.ts --skip-node-modules
```

### 配置选项

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      skipNodeModules: true
    }
  ]
})
```

### 工作原理

```typescript
// 原代码
import lodash from 'lodash'
import { helper } from './utils'

// skipNodeModules: true 时
// lodash 保持为外部依赖
// ./utils 正常打包

// 输出
import lodash from 'lodash'
// helper 的代码被内联
```

### 智能检测

robuild 会自动检测：

- **node_modules 路径**: 自动识别 node_modules 中的模块
- **项目依赖**: 区分项目代码和第三方依赖
- **性能建议**: 分析项目结构并提供优化建议

## 📦 Unbundle 模式

### 概述

保持原有文件结构，不进行打包，适合库开发。

### 基本用法

```bash
# Unbundle 模式
npx robuild ./src/ --unbundle
```

### 配置选项

```typescript
export default defineConfig({
  entries: [
    {
      type: 'transform', // 通常与 transform 模式配合
      input: './src/',
      outDir: './dist/',
      unbundle: true
    }
  ]
})
```

### 文件结构保持

```
src/
├── index.ts
├── utils/
│   ├── helper.ts
│   └── math.ts
└── components/
    ├── Button.tsx
    └── Input.tsx

# 输出 (unbundle: true)
dist/
├── index.mjs
├── utils/
│   ├── helper.mjs
│   └── math.mjs
└── components/
    ├── Button.mjs
    └── Input.mjs
```

### 适用场景

- **库开发**: 保持清晰的模块结构
- **模块转换**: 从 CommonJS 转换到 ES 模块
- **调试友好**: 保持源码结构便于调试
- **Tree Shaking**: 更好的摇树优化支持

### 项目分析

robuild 会分析项目结构并提供建议：

```typescript
// 自动分析结果
{
  totalFiles: 50,
  jsFiles: 20,
  tsFiles: 15,
  directories: 5,
  hasNodeModules: true,
  recommendUnbundle: true, // 推荐使用 unbundle
  recommendSkipNodeModules: false
}
```

## ⚙️ Rolldown 配置透传

### 概述

robuild 允许你直接透传 Rolldown 的所有配置选项，这些配置具有**最高优先级**，会覆盖 robuild 的默认设置。这为需要精细控制构建行为的场景提供了最大的灵活性。

### 基本用法

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        // 直接传递 Rolldown InputOptions
        logLevel: 'debug',
        treeshake: false,
        platform: 'neutral',
      }
    }
  ]
})
```

### 配置优先级

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      
      // robuild 配置（优先级较低）
      platform: 'node',
      target: 'es2020',
      external: ['lodash'],
      
      // rolldown 配置（优先级最高）
      rolldown: {
        platform: 'neutral',  // ✅ 覆盖 platform: 'node'
        external: ['chalk'],  // ✅ 覆盖 external: ['lodash']
        logLevel: 'debug',    // ✅ 额外的 Rolldown 选项
      }
    }
  ]
})
```

### 高级 Tree Shaking

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        treeshake: {
          // 模块副作用处理
          moduleSideEffects: 'no-external',
          
          // 属性读取副作用
          propertyReadSideEffects: false,
          
          // try-catch 优化
          tryCatchDeoptimization: false,
          
          // 未知全局变量处理
          unknownGlobalSideEffects: false,
        }
      }
    }
  ]
})
```

### 输出配置透传

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        output: {
          // 手动分包
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['lodash', 'date-fns'],
          },
          
          // 文件命名
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          
          // 代码生成选项
          generatedCode: {
            arrowFunctions: true,
            constBindings: true,
            objectShorthand: true,
          },
          
          // 互操作性
          interop: 'auto',
          esModule: 'if-default-prop',
          
          // Source map
          sourcemap: true,
          sourcemapExcludeSources: false,
        }
      }
    }
  ]
})
```

### 添加 Rolldown 插件

```typescript
import { defineConfig } from 'robuild'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        // 添加额外的 Rolldown/Rollup 插件
        plugins: [
          visualizer({
            filename: 'stats.html',
            gzipSize: true,
          }),
        ],
      }
    }
  ],
  // robuild 插件会自动与 rolldown 插件合并
  plugins: [myRobuildPlugin()],
})
```

### 调试配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        // 启用详细日志
        logLevel: 'debug',
        
        // 禁用优化以便调试
        treeshake: false,
        
        // 保留注释
        output: {
          comments: 'all',
          sourcemap: 'inline',
        }
      }
    }
  ]
})
```

### 性能优化配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        // 激进的 tree shaking
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        
        // 优化输出
        output: {
          // 压缩选项
          minify: true,
          
          // 代码分割
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          
          // 优化代码生成
          generatedCode: {
            arrowFunctions: true,
            constBindings: true,
            objectShorthand: true,
          },
        }
      }
    }
  ]
})
```

### 完整示例

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      
      // robuild 基础配置
      format: ['esm', 'cjs'],
      platform: 'neutral',
      target: 'es2020',
      
      // rolldown 高级配置（最高优先级）
      rolldown: {
        // 构建选项
        logLevel: 'info',
        platform: 'neutral',
        
        // Tree shaking
        treeshake: {
          moduleSideEffects: 'no-external',
          propertyReadSideEffects: false,
        },
        
        // 外部依赖
        external: (id) => {
          return id.startsWith('node:') || id.includes('node_modules')
        },
        
        // 全局变量定义
        define: {
          'process.env.NODE_ENV': JSON.stringify('production'),
          '__VERSION__': JSON.stringify('1.0.0'),
        },
        
        // 路径解析
        resolve: {
          alias: {
            '@': './src',
            '~': './src/utils',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        
        // 输出配置
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
          chunkFileNames: 'chunks/[name]-[hash].js',
          sourcemap: true,
          generatedCode: {
            arrowFunctions: true,
            constBindings: true,
          },
        },
        
        // 额外插件
        plugins: [
          // 自定义 Rolldown 插件
        ],
      }
    }
  ]
})
```

### 注意事项

1. **配置冲突**: `rolldown` 配置会覆盖 robuild 的默认配置，可能导致某些 robuild 功能失效
2. **类型安全**: 使用 TypeScript 可以获得完整的类型提示和检查
3. **文档参考**: 详细的 Rolldown 配置选项请参考 [Rolldown 官方文档](https://rolldown.rs/reference/config-options)
4. **插件合并**: `rolldown.plugins` 会与 robuild 的内置插件和 `plugins` 字段合并

### 适用场景

- 需要精细控制 Rolldown 行为
- 使用 Rolldown 特有的功能
- 性能优化和调试
- 与现有 Rolldown/Rollup 配置迁移

## 🔧 组合使用

### 完整配置示例

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',

      // 文件加载器
      loaders: {
        '.json': { loader: 'json' },
        '.css': { loader: 'css' },
        '.png': { loader: 'file' }
      },

      // CommonJS 处理
      cjsDefault: 'auto',

      // 兼容性垫片
      shims: {
        dirname: true,
        require: true,
        exports: false,
        env: true
      },

      // 依赖处理
      skipNodeModules: false,

      // 输出模式
      unbundle: false,

      // 其他选项
      format: ['esm', 'cjs'],
      platform: 'neutral'
    },

    // Unbundle 模式的运行时文件
    {
      type: 'transform',
      input: './src/runtime/',
      outDir: './dist/runtime/',
      unbundle: true,
      cjsDefault: true,
      shims: true
    }
  ]
})
```

### CLI 组合使用

```bash
# 完整的高级构建
npx robuild ./src/index.ts \
  --format esm \
  --format cjs \
  --cjs-default auto \
  --shims \
  --skip-node-modules \
  --platform neutral
```

## 🚀 性能优化建议

### 1. 合理选择模式

- **小型库**: 使用 bundle 模式
- **大型库**: 考虑 unbundle 模式
- **工具库**: 使用 transform 模式

### 2. 加载器优化

- 只配置需要的文件类型
- 使用合适的加载器选项
- 避免过度处理

### 3. 垫片优化

- 根据目标平台选择垫片
- 避免不必要的垫片
- 使用条件垫片

### 4. 依赖优化

- 合理使用 skipNodeModules
- 配置合适的 external
- 分析依赖大小

## 📚 相关文档

- [包导出生成](./exports-generation.md) - 自动生成 package.json exports
- [插件系统](./plugins.md) - 插件开发和使用
- [配置文件](./configuration.md) - 完整配置参考
- [API 文档](../api/) - 程序化 API 使用
