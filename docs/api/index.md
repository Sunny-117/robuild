# API 参考

robuild 提供了完整的 TypeScript API，支持程序化使用和自定义构建流程。

## 快速开始

```typescript
import { build, defineBuildConfig } from 'robuild'

// 基本使用
await build({
  entries: ['./src/index.ts']
})

// 使用配置函数
const config = defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist'
    }
  ]
})

await build(config)
```

## 核心 API

### `build(config: BuildConfig): Promise<void>`

主要的构建函数，接受配置对象并执行构建流程。

```typescript
import { build } from 'robuild'

await build({
  cwd: '.',
  entries: [
    './src/index.ts',
    './src/runtime/:./dist/runtime'
  ],
  hooks: {
    start: (ctx) => console.log('开始构建'),
    end: (ctx) => console.log('构建完成')
  }
})
```

### `defineBuildConfig(config: BuildConfig): BuildConfig`

配置定义函数，提供类型安全和智能提示。

```typescript
import { defineBuildConfig } from 'robuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: true,
      dts: true
    }
  ]
})
```

## 类型定义

### `BuildConfig`

构建配置接口：

```typescript
interface BuildConfig {
  cwd?: string | URL
  entries?: (BuildEntry | string)[]
  hooks?: BuildHooks
}
```

### `BuildEntry`

构建入口接口，支持 Bundle 和 Transform 两种类型：

```typescript
type BuildEntry = BundleEntry | TransformEntry
```

### `BuildContext`

构建上下文，包含项目信息：

```typescript
interface BuildContext {
  pkgDir: string
  pkg: { name: string } & Record<string, unknown>
}
```

### `BuildHooks`

构建钩子接口：

```typescript
interface BuildHooks {
  start?: (ctx: BuildContext) => void | Promise<void>
  end?: (ctx: BuildContext) => void | Promise<void>
  entries?: (entries: BuildEntry[], ctx: BuildContext) => void | Promise<void>
  rolldownConfig?: (cfg: InputOptions, ctx: BuildContext) => void | Promise<void>
  rolldownOutput?: (cfg: OutputOptions, res: RolldownBuild, ctx: BuildContext) => void | Promise<void>
}
```

## 使用示例

### 1. 基本构建

```typescript
import { build } from 'robuild'

// 简单构建
await build({
  entries: ['./src/index.ts']
})

// 多入口构建
await build({
  entries: [
    './src/index.ts',
    './src/cli.ts',
    './src/runtime/:./dist/runtime'
  ]
})
```

### 2. 配置构建

```typescript
import { build, defineBuildConfig } from 'robuild'

const config = defineBuildConfig({
  cwd: './packages/core',
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
      minify: true,
      dts: true
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      minify: false
    }
  ]
})

await build(config)
```

### 3. 使用钩子

```typescript
import { build } from 'robuild'

await build({
  entries: ['./src/index.ts'],
  hooks: {
    start: (ctx) => {
      console.log(`构建 ${ctx.pkg.name} v${ctx.pkg.version}`)
    },
    entries: (entries, ctx) => {
      console.log(`处理 ${entries.length} 个构建入口`)
    },
    rolldownConfig: (config, ctx) => {
      // 修改 rolldown 配置
      config.define = {
        ...config.define,
        'process.env.VERSION': `"${ctx.pkg.version}"`
      }
    },
    end: (ctx) => {
      console.log('构建完成!')
    }
  }
})
```

### 4. 错误处理

```typescript
import { build } from 'robuild'

try {
  await build({
    entries: ['./src/index.ts']
  })
} catch (error) {
  console.error('构建失败:', error.message)
  process.exit(1)
}
```

### 5. 自定义构建流程

```typescript
import { build, defineBuildConfig } from 'robuild'

async function customBuild() {
  // 1. 验证环境
  const nodeVersion = process.version
  if (!nodeVersion.startsWith('v18')) {
    throw new Error('需要 Node.js 18+')
  }

  // 2. 准备配置
  const config = defineBuildConfig({
    entries: [
      {
        type: 'bundle',
        input: './src/index.ts',
        minify: process.env.NODE_ENV === 'production'
      }
    ],
    hooks: {
      start: (ctx) => {
        console.log(`开始构建 ${ctx.pkg.name}`)
      }
    }
  })

  // 3. 执行构建
  await build(config)
}

customBuild().catch(console.error)
```

## 集成示例

### 1. 与 Vite 集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { build } from 'robuild'

export default defineConfig({
  plugins: [
    {
      name: 'robuild',
      async closeBundle() {
        await build({
          entries: ['./src/runtime/:./dist/runtime']
        })
      }
    }
  ]
})
```

### 2. 与 Rollup 集成

```typescript
// rollup.config.js
import { build } from 'robuild'

export default {
  // ... rollup 配置
  plugins: [
    {
      name: 'robuild-transform',
      async writeBundle() {
        await build({
          entries: ['./src/types/:./dist/types']
        })
      }
    }
  ]
}
```

### 3. 与 Webpack 集成

```typescript
// webpack.config.js
const { build } = require('robuild')

module.exports = {
  // ... webpack 配置
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.afterEmit.tap('RobuildPlugin', async () => {
          await build({
            entries: ['./src/runtime/:./dist/runtime']
          })
        })
      }
    }
  ]
}
```

## 类型安全

robuild 提供完整的 TypeScript 类型定义：

```typescript
import type {
  BuildConfig,
  BuildEntry,
  BundleEntry,
  TransformEntry,
  BuildContext,
  BuildHooks
} from 'robuild'

// 类型安全的配置
const config: BuildConfig = {
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    } as BundleEntry
  ]
}
```

## 性能考虑

### 1. 并行构建

```typescript
// 并行处理多个项目
const projects = ['./packages/core', './packages/utils']

await Promise.all(
  projects.map(cwd =>
    build({ cwd, entries: ['./src/index.ts'] })
  )
)
```

### 2. 增量构建

```typescript
// 使用 stub 模式进行增量构建
await build({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: true
    }
  ]
})
```

### 3. 缓存优化

```typescript
// 缓存构建结果
const buildCache = new Map()

async function cachedBuild(config: BuildConfig) {
  const key = JSON.stringify(config)
  if (buildCache.has(key)) {
    return buildCache.get(key)
  }

  const result = await build(config)
  buildCache.set(key, result)
  return result
}
```

## 下一步

- [配置选项](./config.md) - 详细的配置选项说明
- [类型定义](./types.md) - 完整的类型定义参考
- [CLI 参数](./cli.md) - 命令行参数说明
- [钩子函数](./hooks.md) - 构建钩子详解
