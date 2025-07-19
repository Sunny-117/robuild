# 类型定义

robuild 提供完整的 TypeScript 类型定义，确保类型安全和开发体验。

## 核心类型

### `BuildConfig`

主要的构建配置类型：

```typescript
interface BuildConfig {
  cwd?: string | URL
  entries?: (BuildEntry | string)[]
  hooks?: BuildHooks
  clean?: CleanOptions
  cache?: CacheOptions
  watch?: WatchOptions
}
```

### `BuildEntry`

构建入口类型，支持 Bundle 和 Transform 两种模式：

```typescript
type BuildEntry = BundleEntry | TransformEntry
```

### `BuildContext`

构建上下文，包含项目信息：

```typescript
interface BuildContext {
  pkgDir: string
  pkg: {
    name: string
    version: string
    [key: string]: any
  }
  entries: BuildEntry[]
  config: BuildConfig
}
```

## Bundle 类型

### `BundleEntry`

Bundle 模式的构建入口：

```typescript
interface BundleEntry {
  type: 'bundle'
  input: string | string[]
  outDir?: string
  minify?: boolean | MinifyOptions
  stub?: boolean
  sourcemap?: boolean | SourcemapOptions
  dts?: boolean | DtsOptions
  rolldown?: RolldownOptions
}
```

### `RolldownOptions`

Rolldown 打包器配置：

```typescript
interface RolldownOptions {
  platform?: 'neutral' | 'node' | 'browser'
  target?: string
  external?: (string | RegExp | ((id: string) => boolean))[]
  plugins?: Plugin[]
  define?: Record<string, string>
  output?: OutputOptions
}
```

### `OutputOptions`

输出配置选项：

```typescript
interface OutputOptions {
  format?: 'esm' | 'cjs' | 'iife' | ('esm' | 'cjs' | 'iife')[]
  name?: string
  dir?: string
  file?: string
  manualChunks?: Record<string, string[]>
  entryFileNames?: string
  chunkFileNames?: string
  assetFileNames?: string
}
```

## Transform 类型

### `TransformEntry`

Transform 模式的构建入口：

```typescript
interface TransformEntry {
  type: 'transform'
  input: string
  outDir: string
  minify?: boolean | MinifyOptions
  stub?: boolean
  sourcemap?: boolean | SourcemapOptions
  oxc?: OxcOptions
  resolve?: ResolveOptions
}
```

### `OxcOptions`

Oxc 转换器配置：

```typescript
interface OxcOptions {
  typescript?: TypeScriptOptions
  javascript?: JavaScriptOptions
  cwd?: string
}
```

### `TypeScriptOptions`

TypeScript 编译选项：

```typescript
interface TypeScriptOptions {
  target?: string
  module?: string
  moduleResolution?: string
  declaration?: boolean | DeclarationOptions
  stripInternal?: boolean
  removeComments?: boolean
  [key: string]: any
}
```

### `JavaScriptOptions`

JavaScript 编译选项：

```typescript
interface JavaScriptOptions {
  target?: string
  [key: string]: any
}
```

## 压缩类型

### `MinifyOptions`

压缩配置选项：

```typescript
interface MinifyOptions {
  enabled?: boolean
  mangle?: boolean
  compress?: boolean | CompressOptions
  comments?: boolean | string
}
```

### `CompressOptions`

压缩选项：

```typescript
interface CompressOptions {
  drop_console?: boolean
  drop_debugger?: boolean
  pure_funcs?: string[]
  [key: string]: any
}
```

## 源码映射类型

### `SourcemapOptions`

源码映射配置：

```typescript
interface SourcemapOptions {
  enabled?: boolean
  inline?: boolean
  external?: boolean
  sourcesContent?: boolean
}
```

## TypeScript 声明文件类型

### `DtsOptions`

TypeScript 声明文件配置：

```typescript
interface DtsOptions {
  enabled?: boolean
  compilerOptions?: CompilerOptions
  include?: string[]
  exclude?: string[]
  emitDeclarationOnly?: boolean
}
```

### `CompilerOptions`

TypeScript 编译器选项：

```typescript
interface CompilerOptions {
  target?: string
  module?: string
  moduleResolution?: string
  declaration?: boolean
  emitDeclarationOnly?: boolean
  stripInternal?: boolean
  removeComments?: boolean
  outDir?: string
  rootDir?: string
  [key: string]: any
}
```

## 解析类型

### `ResolveOptions`

模块解析配置：

```typescript
interface ResolveOptions {
  extensions?: string[]
  suffixes?: string[]
  alias?: Record<string, string>
  modules?: string[]
}
```

## Hooks 类型

### `BuildHooks`

构建生命周期钩子：

```typescript
interface BuildHooks {
  start?: (ctx: BuildContext) => void | Promise<void>
  end?: (ctx: BuildContext) => void | Promise<void>
  beforeBuild?: (ctx: BuildContext, entry: BuildEntry) => void | Promise<void>
  afterBuild?: (ctx: BuildContext, entry: BuildEntry, result: BuildResult) => void | Promise<void>
}
```

### `BuildResult`

构建结果：

```typescript
interface BuildResult {
  outputFiles: string[]
  duration: number
  errors: Error[]
}
```

## 清理类型

### `CleanOptions`

清理配置：

```typescript
interface CleanOptions {
  enabled?: boolean
  dirs?: string[]
  files?: string[]
  cache?: boolean
}
```

## 缓存类型

### `CacheOptions`

缓存配置：

```typescript
interface CacheOptions {
  enabled?: boolean
  dir?: string
  ttl?: number
  strategy?: 'content-hash' | 'timestamp'
}
```

## 监听类型

### `WatchOptions`

文件监听配置：

```typescript
interface WatchOptions {
  enabled?: boolean
  include?: string[]
  exclude?: string[]
  ignoreInitial?: boolean
  delay?: number
}
```

## 插件类型

### `Plugin`

插件接口：

```typescript
interface Plugin {
  name: string
  setup?: (build: BuildContext) => void | Promise<void>
  transform?: (code: string, id: string) => string | Promise<string>
  [key: string]: any
}
```

## 工具类型

### `DeepPartial`

深度部分类型：

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

### `RequiredKeys`

必需键类型：

```typescript
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]
```

### `OptionalKeys`

可选键类型：

```typescript
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]
```

## 类型守卫

### `isBundleEntry`

检查是否为 Bundle 入口：

```typescript
function isBundleEntry(entry: BuildEntry): entry is BundleEntry {
  return entry.type === 'bundle'
}
```

### `isTransformEntry`

检查是否为 Transform 入口：

```typescript
function isTransformEntry(entry: BuildEntry): entry is TransformEntry {
  return entry.type === 'transform'
}
```

### `isStringEntry`

检查是否为字符串入口：

```typescript
function isStringEntry(entry: BuildEntry | string): entry is string {
  return typeof entry === 'string'
}
```

## 类型导出

### 主要导出

```typescript
// 核心类型
export type {
  BuildConfig,
  BuildEntry,
  BundleEntry,
  TransformEntry,
  BuildContext,
  BuildResult,
  BuildHooks
}

// 配置类型
export type {
  RolldownOptions,
  OxcOptions,
  MinifyOptions,
  SourcemapOptions,
  DtsOptions,
  ResolveOptions,
  CleanOptions,
  CacheOptions,
  WatchOptions
}

// 插件类型
export type {
  Plugin
}

// 工具类型
export type {
  DeepPartial,
  RequiredKeys,
  OptionalKeys
}
```

### 类型守卫导出

```typescript
export {
  isBundleEntry,
  isTransformEntry,
  isStringEntry
}
```

## 类型使用示例

### 1. 基本配置类型

```typescript
import { defineBuildConfig, type BuildConfig } from 'robuild/config'

const config: BuildConfig = {
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist'
    }
  ]
}

export default defineBuildConfig(config)
```

### 2. 类型安全配置

```typescript
import { defineBuildConfig, type BundleEntry } from 'robuild/config'

const bundleEntry: BundleEntry = {
  type: 'bundle',
  input: './src/index.ts',
  rolldown: {
    platform: 'neutral',
    external: ['lodash']
  }
}

export default defineBuildConfig({
  entries: [bundleEntry]
})
```

### 3. 条件类型配置

```typescript
import { defineBuildConfig, type BuildEntry } from 'robuild/config'

function createEntry(type: 'bundle' | 'transform'): BuildEntry {
  if (type === 'bundle') {
    return {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist'
    }
  } else {
    return {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime'
    }
  }
}

export default defineBuildConfig({
  entries: [createEntry('bundle')]
})
```

### 4. 类型守卫使用

```typescript
import { defineBuildConfig, isBundleEntry } from 'robuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  hooks: {
    beforeBuild: (ctx, entry) => {
      if (isBundleEntry(entry)) {
        // TypeScript 知道这是 BundleEntry
        console.log('Bundle 入口:', entry.input)
      }
    }
  }
})
```

### 5. 深度部分类型

```typescript
import { defineBuildConfig, type DeepPartial } from 'robuild/config'

const baseConfig = {
  entries: [
    {
      type: 'bundle' as const,
      input: './src/index.ts',
      rolldown: {
        platform: 'neutral' as const,
        external: ['lodash']
      }
    }
  ]
}

// 可以部分覆盖配置
const overrideConfig: DeepPartial<typeof baseConfig> = {
  entries: [
    {
      rolldown: {
        external: ['lodash', 'chalk']
      }
    }
  ]
}

export default defineBuildConfig({
  ...baseConfig,
  ...overrideConfig
})
```

## 类型扩展

### 1. 扩展配置类型

```typescript
import { defineBuildConfig, type BuildConfig } from 'robuild/config'

// 扩展配置类型
interface ExtendedBuildConfig extends BuildConfig {
  customOption?: string
}

const config: ExtendedBuildConfig = {
  entries: ['./src/index.ts'],
  customOption: 'value'
}

export default defineBuildConfig(config)
```

### 2. 自定义插件类型

```typescript
import { type Plugin } from 'robuild/config'

interface MyPlugin extends Plugin {
  customMethod?: () => void
}

function myPlugin(): MyPlugin {
  return {
    name: 'my-plugin',
    setup(build) {
      console.log('插件初始化')
    },
    customMethod() {
      console.log('自定义方法')
    }
  }
}
```

## 下一步

- [配置选项](./config.md) - 详细配置选项
- [CLI 参数](./cli.md) - 命令行参数详解
- [API 文档](./) - 程序化 API 使用
- [配置示例](../guide/configuration.md) - 实际配置示例
