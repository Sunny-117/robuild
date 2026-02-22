# API 参考

robuild 提供程序化 API 用于构建 TypeScript/JavaScript 项目。

## 导出

```typescript
import { build, defineConfig } from 'robuild'
import type { BuildConfig, BuildEntry, BundleEntry, TransformEntry } from 'robuild'
```

## build

主构建函数：

```typescript
import { build } from 'robuild'

await build({
  entries: ['./src/index.ts'],
})
```

### 参数

```typescript
function build(config: BuildConfig): Promise<void>
```

### 示例

```typescript
// 基本构建
await build({
  entries: ['./src/index.ts'],
})

// 多入口
await build({
  entries: [
    './src/index.ts',
    './src/cli.ts',
    './src/runtime/:./dist/runtime',
  ],
})

// 完整配置
await build({
  cwd: '.',
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      minify: true,
    },
  ],
  hooks: {
    start: (ctx) => console.log('开始构建:', ctx.pkg.name),
    end: (ctx) => console.log('构建完成'),
  },
})
```

## defineConfig

配置辅助函数，提供类型提示：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      dts: true,
    },
  ],
})
```

## 类型

### BuildConfig

```typescript
interface BuildConfig {
  cwd?: string
  entries?: (BuildEntry | string)[]
  hooks?: BuildHooks
  watch?: WatchOptions
  exports?: ExportsConfig
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'verbose'
  failOnWarn?: boolean
  onSuccess?: string | ((result: BuildResult) => void)
}
```

### BuildEntry

```typescript
type BuildEntry = BundleEntry | TransformEntry
```

### BuildHooks

```typescript
interface BuildHooks {
  start?: (ctx: BuildContext) => void | Promise<void>
  entries?: (entries: BuildEntry[], ctx: BuildContext) => void | Promise<void>
  rolldownConfig?: (cfg: InputOptions, ctx: BuildContext) => void | Promise<void>
  rolldownOutput?: (cfg: OutputOptions, res: RolldownBuild, ctx: BuildContext) => void | Promise<void>
  end?: (ctx: BuildContext) => void | Promise<void>
}
```

### BuildContext

```typescript
interface BuildContext {
  pkgDir: string
  pkg: { name: string; version?: string; [key: string]: unknown }
}
```

## 下一步

- [配置选项](./config.md) - 详细配置
- [类型定义](./types.md) - 完整类型
- [CLI 参数](./cli.md) - 命令行
