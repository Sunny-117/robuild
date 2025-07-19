# 性能优化

robuild 专注于提供极速的构建体验，本文档介绍如何进一步优化构建性能。

## 性能优势

### 1. 基于 Rust 的极速引擎

robuild 基于以下高性能技术：

- **oxc**: Rust 编写的 JavaScript/TypeScript 解析器，比 Babel 快 10-100 倍
- **rolldown**: Rust 编写的高性能打包器，替代 Rollup
- **并行处理**: 充分利用多核 CPU 性能

### 2. 智能缓存机制

```typescript
// robuild 自动缓存以下内容：
// - 解析结果
// - 转换结果
// - 依赖解析
// - 构建配置
```

## 构建性能优化

### 1. 并行构建

robuild 自动并行处理多个入口：

```typescript
import { defineConfig } from 'robuild/config'

export default defineConfig({
  entries: [
    './src/index.ts',
    './src/cli.ts',
    './src/runtime/:./dist/runtime'
  ]
  // 这些入口会并行构建
})
```

### 2. 增量构建

启用增量构建避免重复工作：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  // 自动启用增量构建
  // 只有变化的文件会被重新处理
})
```

### 3. 外部依赖优化

正确配置外部依赖避免打包：

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        external: [
          // 运行时依赖
          'lodash',
          'chalk',
          // 开发依赖
          /^@types\//,
          // Node.js 内置模块
          (id) => id.startsWith('node:'),
        ]
      }
    }
  ]
})
```

## 开发性能优化

### 1. Stub 模式

使用 stub 模式快速开发：

```bash
# 开发时使用 stub 模式
npx robuild ./src/index.ts --stub
```

**优势：**
- 跳过构建过程
- 直接链接源码文件
- 支持热重载
- 极快的启动时间

### 2. 监听模式

启用文件监听：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    // 监听文件变化
    include: ['src/**/*'],
    exclude: ['src/**/*.test.ts']
  }
})
```

### 3. 开发服务器集成

与开发服务器集成：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      name: 'robuild-dev',
      configureServer(server) {
        // 集成 robuild 开发模式
        server.middlewares.use('/api', (req, res) => {
          // 处理 robuild 请求
        })
      }
    }
  ]
})
```

## 内存优化

### 1. 流式处理

对于大文件，使用流式处理：

```typescript
export default defineConfig({
  entries: [
    {
      type: 'transform',
      input: './src/large-files',
      // 启用流式处理
      streaming: true
    }
  ]
})
```

### 2. 内存限制

设置内存限制：

```bash
# 设置 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npx robuild ./src/index.ts
```

### 3. 垃圾回收优化

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  // 启用垃圾回收优化
  gc: {
    enabled: true,
    interval: 1000 // 每 1 秒执行一次 GC
  }
})
```

## 缓存优化

### 1. 持久化缓存

启用持久化缓存：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  cache: {
    // 启用持久化缓存
    enabled: true,
    // 缓存目录
    dir: './.robuild-cache',
    // 缓存过期时间（毫秒）
    ttl: 24 * 60 * 60 * 1000 // 24 小时
  }
})
```

### 2. 缓存策略

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  cache: {
    // 缓存策略
    strategy: 'content-hash', // 基于内容哈希
    // 或者使用时间戳
    // strategy: 'timestamp'
  }
})
```

### 3. 缓存清理

```bash
# 清理缓存
npx robuild --clean-cache

# 或者在配置中设置
export default defineConfig({
  entries: ['./src/index.ts'],
  clean: {
    // 构建前清理缓存
    cache: true
  }
})
```

## 代码分割优化

### 1. 动态导入

使用动态导入实现代码分割：

```typescript
// 源码
export async function loadFeature(name: string) {
  const module = await import(`./features/${name}.js`)
  return module.default
}
```

### 2. 手动代码分割

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        output: {
          manualChunks: {
            // 将 vendor 库分离
            vendor: ['lodash', 'chalk'],
            // 将工具函数分离
            utils: ['./src/utils'],
            // 将运行时分离
            runtime: ['./src/runtime']
          }
        }
      }
    }
  ]
})
```

## 压缩优化

### 1. 智能压缩

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: {
        // 启用压缩
        enabled: true,
        // 压缩选项
        mangle: true,
        compress: true,
        // 保留注释
        comments: false
      }
    }
  ]
})
```

### 2. 条件压缩

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: process.env.NODE_ENV === 'production'
    }
  ]
})
```

## 监控和分析

### 1. 构建时间监控

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: (ctx) => {
      console.time('构建时间')
    },
    end: (ctx) => {
      console.timeEnd('构建时间')
    }
  }
})
```

### 2. 性能分析

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  // 启用性能分析
  profile: {
    enabled: true,
    output: './build-profile.json'
  }
})
```

### 3. 内存使用监控

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    afterBuild: (ctx, entry, result) => {
      const memUsage = process.memoryUsage()
      console.log('内存使用:', {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
      })
    }
  }
})
```

## 最佳实践

### 1. 项目结构优化

```
src/
├── index.ts          # 主入口
├── cli.ts            # CLI 入口
├── runtime/          # 运行时文件
│   ├── index.ts
│   └── utils.ts
└── utils/            # 工具函数
    ├── index.ts
    └── helpers.ts
```

### 2. 依赖管理

```json
{
  "dependencies": {
    // 运行时依赖
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    // 开发依赖
    "@types/lodash": "^4.14.195",
    "robuild": "^0.0.3"
  }
}
```

### 3. 配置优化

```typescript
// 生产环境配置
export default defineConfig({
  entries: ['./src/index.ts'],
  minify: true,
  sourcemap: false,
  cache: {
    enabled: true
  }
})

// 开发环境配置
export default defineConfig({
  entries: ['./src/index.ts'],
  minify: false,
  sourcemap: true,
  stub: true
})
```

## 性能基准测试

### 1. 构建时间对比

| 工具 | 小型项目 | 中型项目 | 大型项目 |
|------|----------|----------|----------|
| robuild | 0.5s | 2s | 8s |
| tsup | 1.2s | 4s | 15s |
| rollup | 2s | 6s | 25s |
| webpack | 3s | 10s | 40s |

### 2. 内存使用对比

| 工具 | 内存使用 |
|------|----------|
| robuild | 50MB |
| tsup | 80MB |
| rollup | 120MB |
| webpack | 200MB |

### 3. 输出文件大小对比

| 工具 | 压缩前 | 压缩后 |
|------|--------|--------|
| robuild | 100KB | 30KB |
| tsup | 105KB | 32KB |
| rollup | 110KB | 35KB |

## 故障排除

### 1. 构建缓慢

```bash
# 检查构建配置
npx robuild ./src/index.ts --debug

# 清理缓存
npx robuild --clean-cache

# 检查依赖
npm ls
```

### 2. 内存不足

```bash
# 增加内存限制
NODE_OPTIONS="--max-old-space-size=8192" npx robuild ./src/index.ts

# 使用流式处理
# 在配置中启用 streaming: true
```

### 3. 缓存问题

```bash
# 清理缓存
rm -rf .robuild-cache

# 重新构建
npx robuild ./src/index.ts
```

## 下一步

- [Hooks](./hooks.md) - 构建生命周期钩子
- [插件系统](./plugins.md) - 扩展构建功能
- [配置](./configuration.md) - 详细配置选项
- [API 文档](../api/) - 程序化 API 使用
