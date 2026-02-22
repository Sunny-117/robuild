# 类型定义

## 导出的类型

```typescript
import type {
  BuildConfig,
  BuildEntry,
  BundleEntry,
  TransformEntry,
  ExportsConfig,
  RobuildPlugin,
} from 'robuild'
```

## BuildConfig

主要的构建配置类型：

```typescript
interface BuildConfig {
  cwd?: string | URL
  entries?: (BuildEntry | string)[]
  hooks?: BuildHooks
  watch?: WatchOptions
  exports?: ExportsConfig
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'verbose'
  failOnWarn?: boolean
  onSuccess?: string | ((result: BuildResult) => void)
  ignoreWatch?: string[]
  clean?: boolean | string[]
  plugins?: RobuildPlugin[]
}
```

## BuildEntry

```typescript
type BuildEntry = BundleEntry | TransformEntry
```

## BundleEntry

Bundle 模式配置：

```typescript
interface BundleEntry {
  type: 'bundle'
  input?: string | string[] | Record<string, string>
  outDir?: string
  fileName?: string
  format?: ModuleFormat | ModuleFormat[]
  platform?: 'browser' | 'node' | 'neutral'
  target?: string
  globalName?: string

  // 优化
  minify?: boolean | 'dce-only'
  sourcemap?: boolean | 'inline' | 'hidden'
  splitting?: boolean
  treeshake?: boolean

  // 类型声明
  dts?: boolean | DtsOptions
  dtsOnly?: boolean

  // 依赖
  external?: (string | RegExp)[]
  noExternal?: (string | RegExp)[]
  skipNodeModules?: boolean

  // 代码注入
  banner?: string
  footer?: string
  env?: Record<string, string>
  define?: Record<string, string>

  // 其他
  alias?: Record<string, string>
  clean?: boolean | string[]
  stub?: boolean
  shims?: boolean | ShimsConfig
  plugins?: RolldownPlugin[]
  rolldown?: InputOptions
}
```

## TransformEntry

Transform 模式配置：

```typescript
interface TransformEntry {
  type: 'transform'
  input: string
  outDir?: string
  minify?: boolean
  sourcemap?: boolean
  target?: string
  alias?: Record<string, string>
  nodeProtocol?: boolean
  clean?: boolean
  stub?: boolean
  banner?: string
  footer?: string
}
```

## BuildHooks

构建钩子：

```typescript
interface BuildHooks {
  start?: (ctx: BuildContext) => void | Promise<void>
  entries?: (entries: BuildEntry[], ctx: BuildContext) => void | Promise<void>
  rolldownConfig?: (cfg: InputOptions, ctx: BuildContext) => void | Promise<void>
  rolldownOutput?: (cfg: OutputOptions, res: RolldownBuild, ctx: BuildContext) => void | Promise<void>
  end?: (ctx: BuildContext) => void | Promise<void>
}
```

## BuildContext

```typescript
interface BuildContext {
  pkgDir: string
  pkg: { name: string } & Record<string, unknown>
}
```

## WatchOptions

```typescript
interface WatchOptions {
  enabled?: boolean
  include?: string[]
  exclude?: string[]
  delay?: number
  ignoreInitial?: boolean
  watchNewFiles?: boolean
}
```

## ExportsConfig

```typescript
interface ExportsConfig {
  enabled?: boolean
  includeTypes?: boolean
  autoUpdate?: boolean
  custom?: Record<string, string>
}
```

## RobuildPlugin

```typescript
interface RobuildPlugin extends RolldownPlugin {
  robuildSetup?: (ctx: RobuildPluginContext) => void | Promise<void>
  robuildBuildStart?: (ctx: RobuildPluginContext) => void | Promise<void>
  robuildBuildEnd?: (ctx: RobuildPluginContext) => void | Promise<void>
}
```

## 使用示例

```typescript
import { defineConfig, type BuildConfig, type BundleEntry } from 'robuild'

const entry: BundleEntry = {
  type: 'bundle',
  input: './src/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
}

const config: BuildConfig = {
  entries: [entry],
}

export default defineConfig(config)
```

## 下一步

- [配置选项](./config.md) - 详细配置
- [CLI 参数](./cli.md) - 命令行

