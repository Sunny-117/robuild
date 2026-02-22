# Hooks

robuild 提供了构建生命周期 Hooks，允许你在构建过程的不同阶段执行自定义逻辑。

## 什么是 Hooks？

Hooks 是构建过程中的生命周期钩子，让你可以：

- **自定义构建流程**: 在特定阶段执行自定义代码
- **环境准备**: 设置构建环境，清理临时文件
- **后处理**: 构建完成后的自定义操作
- **修改配置**: 动态调整 Rolldown 配置

## 可用的 Hooks

### 1. `start` - 构建开始

在构建开始时执行，是最早执行的 hook：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: (ctx) => {
      console.log(`开始构建 ${ctx.pkg.name}`)
      console.log(`工作目录: ${ctx.pkgDir}`)
    }
  }
})
```

### 2. `entries` - 入口处理后

在构建入口被规范化后执行，可以用来修改入口配置：

```typescript
export default defineConfig({
  entries: [{ type: 'bundle', input: './src/index.ts', minify: false }],
  hooks: {
    entries: (entries, ctx) => {
      console.log(`处理 ${entries.length} 个入口`)

      // 可以修改入口配置
      for (const entry of entries) {
        if (entry.type === 'bundle') {
          entry.minify = true
        }
      }
    }
  }
})
```

### 3. `rolldownConfig` - Rolldown 配置前

在 Rolldown 配置最终确定前执行，可以修改输入配置：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    rolldownConfig: (cfg, ctx) => {
      console.log('Rolldown 输入配置:', cfg.input)

      // 可以修改 Rolldown 配置
      cfg.treeshake = {
        moduleSideEffects: false
      }
    }
  }
})
```

### 4. `rolldownOutput` - Rolldown 输出配置前

在 Rolldown 输出配置最终确定前执行：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    rolldownOutput: (cfg, res, ctx) => {
      console.log('输出格式:', cfg.format)
      console.log('输出目录:', cfg.dir)

      // 可以修改输出配置
      cfg.banner = '/* 自定义 banner */'
    }
  }
})
```

### 5. `end` - 构建结束

在构建完成后执行：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    end: (ctx) => {
      console.log('构建完成!')
    }
  }
})
```

## Hook 执行顺序

Hooks 按以下顺序执行：

```
start → entries → rolldownConfig → rolldownOutput → end
```

完整示例：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: () => console.log('1. start'),
    entries: () => console.log('2. entries'),
    rolldownConfig: () => console.log('3. rolldownConfig'),
    rolldownOutput: () => console.log('4. rolldownOutput'),
    end: () => console.log('5. end'),
  }
})
```

## Hook 上下文

每个 Hook 都接收一个 `BuildContext` 对象：

```typescript
interface BuildContext {
  pkgDir: string  // 项目根目录的绝对路径
  pkg: {          // package.json 的内容
    name: string
    [key: string]: unknown
  }
}
```

## 类型定义

完整的 Hooks 类型定义：

```typescript
interface BuildHooks {
  start?: (ctx: BuildContext) => void | Promise<void>
  end?: (ctx: BuildContext) => void | Promise<void>
  entries?: (entries: BuildEntry[], ctx: BuildContext) => void | Promise<void>
  rolldownConfig?: (cfg: InputOptions, ctx: BuildContext) => void | Promise<void>
  rolldownOutput?: (cfg: OutputOptions, res: RolldownBuild, ctx: BuildContext) => void | Promise<void>
}
```

## 实际使用示例

### 1. 环境检查和准备

```typescript
import { defineConfig } from 'robuild'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: (ctx) => {
      // 检查必要目录
      const distDir = join(ctx.pkgDir, 'dist')
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
        console.log('创建输出目录:', distDir)
      }

      // 设置环境变量
      if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production'
      }
    }
  }
})
```

### 2. 构建后处理

```typescript
import { defineConfig } from 'robuild'
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    end: (ctx) => {
      // 复制 README 到输出目录
      const readmeSrc = join(ctx.pkgDir, 'README.md')
      const readmeDest = join(ctx.pkgDir, 'dist', 'README.md')

      if (existsSync(readmeSrc)) {
        copyFileSync(readmeSrc, readmeDest)
        console.log('复制 README.md 到输出目录')
      }

      // 生成构建信息
      const buildInfo = {
        timestamp: new Date().toISOString(),
        version: ctx.pkg.version,
        nodeVersion: process.version
      }

      writeFileSync(
        join(ctx.pkgDir, 'dist', 'build-info.json'),
        JSON.stringify(buildInfo, null, 2)
      )
    }
  }
})
```

### 3. 条件构建

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [{ type: 'bundle', input: './src/index.ts' }],
  hooks: {
    entries: (entries, ctx) => {
      for (const entry of entries) {
        if (entry.type !== 'bundle') continue

        // 根据环境变量调整构建配置
        if (process.env.NODE_ENV === 'development') {
          entry.minify = false
          entry.sourcemap = true
        } else {
          entry.minify = true
          entry.sourcemap = false
        }
      }
    }
  }
})
```

### 4. 自定义 Rolldown 配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    rolldownConfig: (cfg, ctx) => {
      // 添加自定义 external
      cfg.external = [
        ...(Array.isArray(cfg.external) ? cfg.external : []),
        /^@internal\//
      ]
    },

    rolldownOutput: (cfg, res, ctx) => {
      // 添加自定义 banner
      cfg.banner = `/**
 * ${ctx.pkg.name}
 * Built at: ${new Date().toISOString()}
 */`
    }
  }
})
```

## 异步 Hooks

所有 Hooks 都支持异步操作：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: async (ctx) => {
      // 异步操作
      await prepareEnvironment()
      console.log('环境准备完成')
    },

    end: async (ctx) => {
      // 异步后处理
      await uploadToCDN(ctx.pkgDir + '/dist')
      console.log('文件已上传到 CDN')
    }
  }
})
```

## 错误处理

在 Hook 中抛出错误会中断构建：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: (ctx) => {
      // 检查必要条件
      if (!process.env.API_KEY) {
        throw new Error('缺少 API_KEY 环境变量')
      }
    }
  }
})
```

## Hooks vs Plugins

robuild 同时支持 Hooks 和 Plugins，它们有不同的用途：

| 特性 | Hooks | Plugins |
|------|-------|---------|
| 用途 | 简单的构建生命周期操作 | 复杂的代码转换和处理 |
| 配置位置 | `config.hooks` | `config.plugins` |
| 能力 | 修改配置、执行副作用 | Rolldown 完整插件能力 |
| 复杂度 | 简单 | 较复杂 |

对于简单的生命周期操作，使用 Hooks；对于需要访问 Rolldown 插件系统的复杂操作，使用 Plugins。

## 下一步

- [插件系统](./plugins.md) - 使用插件扩展构建功能
- [配置](./configuration.md) - 详细配置选项
