# Hooks

robuild 提供了强大的 Hooks 系统，允许你在构建过程的不同阶段执行自定义逻辑。

## 什么是 Hooks？

Hooks 是构建过程中的生命周期钩子，让你可以：

- **自定义构建流程**: 在特定阶段执行自定义代码
- **环境准备**: 设置构建环境，清理临时文件
- **后处理**: 构建完成后的自定义操作
- **集成外部工具**: 与 CI/CD、测试工具等集成

## 可用的 Hooks

### 1. `start` - 构建开始

在构建开始前执行：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: (ctx) => {
      console.log(`开始构建 ${ctx.pkg.name} v${ctx.pkg.version}`)
      console.log(`工作目录: ${ctx.pkgDir}`)
    }
  }
})
```

### 2. `end` - 构建结束

在构建完成后执行：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    end: (ctx) => {
      console.log('构建完成!')
      console.log(`输出目录: ${ctx.pkgDir}/dist`)
    }
  }
})
```

### 3. `beforeBuild` - 构建前

在每个构建入口开始前执行：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    beforeBuild: (ctx, entry) => {
      console.log(`准备构建: ${entry.input}`)

      // 可以修改构建配置
      if (entry.type === 'bundle') {
        entry.minify = true
      }
    }
  }
})
```

### 4. `afterBuild` - 构建后

在每个构建入口完成后执行：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    afterBuild: (ctx, entry, result) => {
      console.log(`构建完成: ${entry.input}`)
      console.log(`输出文件: ${result.outputFiles}`)
    }
  }
})
```

## Hook 上下文

每个 Hook 都接收一个上下文对象，包含有用的信息：

### `BuildContext`

```typescript
interface BuildContext {
  pkgDir: string        // 项目根目录
  pkg: {                // package.json 信息
    name: string
    version: string
    [key: string]: any
  }
  entries: BuildEntry[] // 构建入口列表
  config: BuildConfig   // 完整配置
}
```

### `BuildEntry`

```typescript
interface BuildEntry {
  type: 'bundle' | 'transform'
  input: string
  outDir?: string
  minify?: boolean
  stub?: boolean
  // ... 其他配置
}
```

### `BuildResult`

```typescript
interface BuildResult {
  outputFiles: string[]  // 输出文件列表
  duration: number       // 构建耗时
  errors: Error[]        // 错误信息
}
```

## 实际使用示例

### 1. 环境检查和准备

```typescript
import { defineConfig } from 'robuild'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

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

      // 检查环境变量
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
import { copyFileSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

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
  entries: ['./src/index.ts'],
  hooks: {
    beforeBuild: (ctx, entry) => {
      // 根据环境变量调整构建配置
      if (process.env.NODE_ENV === 'development') {
        entry.minify = false
        entry.sourcemap = true
      } else {
        entry.minify = true
        entry.sourcemap = false
      }

      // 根据平台调整配置
      if (process.platform === 'win32') {
        // Windows 特定配置
        entry.rolldown = {
          ...entry.rolldown,
          target: 'node18'
        }
      }
    }
  }
})
```

### 4. 集成测试

```typescript
import { defineConfig } from 'robuild'
import { execSync } from 'child_process'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    afterBuild: async (ctx, entry, result) => {
      if (result.errors.length === 0) {
        console.log('构建成功，运行测试...')

        try {
          execSync('npm test', {
            cwd: ctx.pkgDir,
            stdio: 'inherit'
          })
          console.log('测试通过!')
        } catch (error) {
          console.error('测试失败:', error.message)
          process.exit(1)
        }
      }
    }
  }
})
```

### 5. 多阶段构建

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    './src/index.ts',
    './src/runtime/:./dist/runtime'
  ],
  hooks: {
    start: (ctx) => {
      console.log('开始多阶段构建...')
    },

    beforeBuild: (ctx, entry) => {
      if (entry.type === 'bundle') {
        console.log('阶段 1: 打包主文件')
      } else if (entry.type === 'transform') {
        console.log('阶段 2: 转换运行时文件')
      }
    },

    afterBuild: (ctx, entry, result) => {
      console.log(`阶段完成: ${entry.input}`)
    },

    end: (ctx) => {
      console.log('所有阶段构建完成!')
    }
  }
})
```

## 异步 Hooks

Hooks 支持异步操作：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: async (ctx) => {
      // 异步操作
      await new Promise(resolve => setTimeout(resolve, 1000))
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

### 1. Hook 错误处理

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: (ctx) => {
      try {
        // 可能出错的操作
        validateEnvironment()
      } catch (error) {
        console.error('环境检查失败:', error.message)
        process.exit(1)
      }
    }
  }
})
```

### 2. 构建错误处理

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    afterBuild: (ctx, entry, result) => {
      if (result.errors.length > 0) {
        console.error('构建失败:')
        result.errors.forEach(error => {
          console.error(`- ${error.message}`)
        })

        // 发送错误通知
        sendErrorNotification(result.errors)
      }
    }
  }
})
```

## 最佳实践

### 1. 保持 Hooks 简洁

```typescript
// ✅ 好的做法
hooks: {
  start: (ctx) => {
    console.log(`构建 ${ctx.pkg.name}`)
  }
}

// ❌ 避免的做法
hooks: {
  start: (ctx) => {
    // 避免在 Hook 中放置过多逻辑
    // 复杂的逻辑应该提取到单独的函数中
  }
}
```

### 2. 使用类型安全

```typescript
import { defineConfig, type BuildContext } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: (ctx: BuildContext) => {
      // 享受完整的类型提示
      console.log(ctx.pkg.name)
    }
  }
})
```

### 3. 错误处理

```typescript
hooks: {
  start: (ctx) => {
    try {
      // 关键操作
      prepareEnvironment()
    } catch (error) {
      console.error('启动失败:', error)
      process.exit(1)
    }
  }
}
```

## 下一步

- [插件系统](./plugins.md) - 扩展构建功能
- [性能优化](./performance.md) - 优化构建性能
- [配置](./configuration.md) - 详细配置选项
- [API 文档](../api/) - 程序化 API 使用
