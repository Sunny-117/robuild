# 配置选项

## BuildConfig

全局配置：

```typescript
interface BuildConfig {
  cwd?: string                           // 工作目录
  entries?: (BuildEntry | string)[]      // 构建入口
  hooks?: BuildHooks                     // 构建钩子
  watch?: WatchOptions                   // 监听配置
  exports?: ExportsConfig                // 导出配置
  logLevel?: LogLevel                    // 日志级别
  failOnWarn?: boolean                   // 警告时失败
  onSuccess?: string | Function          // 成功回调
  ignoreWatch?: string[]                 // 忽略监听的文件
}
```

## BundleEntry

Bundle 模式配置：

```typescript
interface BundleEntry {
  type: 'bundle'
  input: string | string[] | Record<string, string>
  outDir?: string                        // 输出目录
  fileName?: string                      // 自定义输出文件名
  format?: ModuleFormat | ModuleFormat[] // esm, cjs, iife, umd
  platform?: 'browser' | 'node' | 'neutral'
  target?: string                        // es2015, es2020, esnext
  globalName?: string                    // IIFE/UMD 全局变量名

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
  rolldown?: InputOptions                // rolldown 原生配置
}
```

## TransformEntry

Transform 模式配置：

```typescript
interface TransformEntry {
  type: 'transform'
  input: string                          // 输入目录
  outDir?: string                        // 输出目录

  // 优化
  minify?: boolean
  sourcemap?: boolean
  target?: string

  // 路径
  alias?: Record<string, string>
  nodeProtocol?: boolean                 // 添加 node: 前缀

  // 其他
  clean?: boolean
  stub?: boolean
  banner?: string
  footer?: string
}
```

## WatchOptions

监听配置：

```typescript
interface WatchOptions {
  enabled?: boolean                      // 启用监听
  include?: string[]                     // 监听的文件
  exclude?: string[]                     // 排除的文件
  delay?: number                         // 重建延迟（毫秒）
  ignoreInitial?: boolean                // 跳过初始构建
  watchNewFiles?: boolean                // 监听新文件
}
```

## ExportsConfig

导出配置：

```typescript
interface ExportsConfig {
  enabled?: boolean                      // 启用导出生成
  includeTypes?: boolean                 // 包含类型
  autoUpdate?: boolean                   // 自动更新 package.json
  custom?: Record<string, string>        // 自定义映射
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

## 配置示例

### 基本库

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

### CLI 工具

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/cli.ts',
      platform: 'node',
      minify: true,
    },
  ],
})
```

### 混合模式

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      dts: true,
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
    },
  ],
})
```

## 下一步

- [类型定义](./types.md) - 完整类型
- [CLI 参数](./cli.md) - 命令行
