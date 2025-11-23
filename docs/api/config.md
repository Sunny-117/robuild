# 配置选项

robuild 提供了丰富的配置选项，让你可以精细控制构建过程。

## 配置接口

### `BuildConfig`

主要的配置接口：

```typescript
interface BuildConfig {
  cwd?: string | URL                    // 工作目录
  entries?: (BuildEntry | string)[]     // 构建入口
  hooks?: BuildHooks                    // 构建钩子
  clean?: CleanOptions                  // 清理选项
  cache?: CacheOptions                  // 缓存选项
  watch?: WatchOptions                  // 监听选项
}
```

## 核心配置

### `cwd`

工作目录，默认为当前目录：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  cwd: './packages/core',
  entries: ['./src/index.ts']
})
```

### `entries`

构建入口配置，支持字符串和对象两种格式：

```typescript
export default defineConfig({
  entries: [
    // 字符串格式
    './src/index.ts',
    './src/runtime/:./dist/runtime',

    // 对象格式
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist'
    }
  ]
})
```

### `hooks`

构建生命周期钩子（用于构建流程控制）：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    // 构建开始时调用
    start: (ctx) => {
      console.log('构建开始')
    },
    // 构建结束时调用
    end: (ctx) => {
      console.log('构建完成')
    },
    // 入口标准化后调用
    entries: (entries, ctx) => {
      console.log('处理入口:', entries)
    },
    // rolldown 配置最终确定前调用
    rolldownConfig: (cfg, ctx) => {
      console.log('rolldown 配置:', cfg)
    },
    // rolldown 输出配置最终确定前调用
    rolldownOutput: (cfg, res, ctx) => {
      console.log('rolldown 输出配置:', cfg)
    }
  }
})
```

**注意：** 如果需要使用插件钩子（如 `buildStart`、`writeBundle`、`transform` 等），请使用 `plugins` 字段而不是 `hooks`。

### `plugins`

插件配置（用于自定义构建逻辑）：

```typescript
import type { RobuildPlugin } from 'robuild'

const myPlugin: RobuildPlugin = {
  name: 'my-plugin',
  // Rolldown 插件钩子
  buildStart: async () => {
    console.log('插件：构建开始')
  },
  writeBundle: async (options, bundle) => {
    console.log('插件：写入完成', Object.keys(bundle))
  },
  transform: async (code, id) => {
    // 转换代码
    return { code: transformedCode }
  }
}

export default defineConfig({
  entries: ['./src/index.ts'],
  plugins: [myPlugin]
})
```

## Bundle 配置

### `BundleEntry`

Bundle 模式的配置选项：

```typescript
interface BundleEntry {
  type: 'bundle'
  input: string | string[]              // 入口文件
  outDir?: string                       // 输出目录
  minify?: boolean | MinifyOptions      // 压缩选项
  stub?: boolean                        // 是否启用 stub 模式
  sourcemap?: boolean | SourcemapOptions // 源码映射
  dts?: boolean | DtsOptions            // TypeScript 声明文件
  rolldown?: RolldownOptions            // rolldown 配置
}
```

### 基本配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
      minify: true,
      dts: true
    }
  ]
})
```

### 高级配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts'],
      outDir: './dist',
      minify: {
        enabled: true,
        mangle: true,
        compress: true
      },
      sourcemap: {
        enabled: true,
        inline: false
      },
      dts: {
        compilerOptions: {
          declaration: true,
          stripInternal: true
        }
      },
      rolldown: {
        platform: 'neutral',
        external: ['lodash'],
        plugins: []
      }
    }
  ]
})
```

## Transform 配置

### `TransformEntry`

Transform 模式的配置选项：

```typescript
interface TransformEntry {
  type: 'transform'
  input: string                         // 输入目录
  outDir: string                        // 输出目录
  minify?: boolean | MinifyOptions      // 压缩选项
  stub?: boolean                        // 是否启用 stub 模式
  sourcemap?: boolean | SourcemapOptions // 源码映射
  oxc?: OxcOptions                      // oxc 配置
  resolve?: ResolveOptions              // 解析选项
}
```

### 基本配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      minify: false
    }
  ]
})
```

### 高级配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      minify: {
        enabled: true,
        mangle: false
      },
      sourcemap: true,
      oxc: {
        typescript: {
          target: 'ES2020',
          declaration: { stripInternal: true }
        }
      },
      resolve: {
        extensions: ['.ts', '.js', '.mjs'],
        suffixes: ['', '/index']
      }
    }
  ]
})
```

## 压缩配置

### `MinifyOptions`

```typescript
interface MinifyOptions {
  enabled?: boolean                     // 是否启用压缩
  mangle?: boolean                      // 是否混淆变量名
  compress?: boolean | CompressOptions  // 压缩选项
  comments?: boolean | string           // 注释处理
}
```

### 压缩示例

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: {
        enabled: true,
        mangle: true,
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        comments: false
      }
    }
  ]
})
```

## 源码映射配置

### `SourcemapOptions`

```typescript
interface SourcemapOptions {
  enabled?: boolean                     // 是否启用源码映射
  inline?: boolean                      // 是否内联
  external?: boolean                    // 是否生成外部文件
  sourcesContent?: boolean              // 是否包含源码内容
}
```

### 源码映射示例

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      sourcemap: {
        enabled: true,
        inline: false,
        external: true,
        sourcesContent: true
      }
    }
  ]
})
```

## TypeScript 声明文件配置

### `DtsOptions`

```typescript
interface DtsOptions {
  enabled?: boolean                     // 是否启用
  compilerOptions?: CompilerOptions     // TypeScript 编译器选项
  include?: string[]                    // 包含的文件
  exclude?: string[]                    // 排除的文件
  emitDeclarationOnly?: boolean         // 是否只生成声明文件
}
```

### 声明文件示例

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      dts: {
        enabled: true,
        compilerOptions: {
          declaration: true,
          emitDeclarationOnly: false,
          stripInternal: true,
          removeComments: false
        },
        include: ['src/**/*'],
        exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
      }
    }
  ]
})
```

## Rolldown 配置

### 高级透传配置

`rolldown` 字段允许你直接传递任何 Rolldown 的 `InputOptions` 和 `OutputOptions`。这些配置具有**最高优先级**，会覆盖 robuild 的默认配置。

```typescript
interface RolldownOptions extends InputOptions {
  plugins?: Plugin[]                        // 插件列表
  output?: OutputOptions                    // 输出选项
  // ... 所有 Rolldown InputOptions
}
```

**优先级说明：**
- `rolldown` 配置 > robuild 生成的配置
- 适用于需要精细控制 Rolldown 行为的场景
- 使用时需注意可能与 robuild 的其他功能冲突

### 基础示例

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        // 直接传递 Rolldown 配置
        platform: 'neutral',
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
        },
        logLevel: 'debug',
      }
    }
  ]
})
```

### 高级示例

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        // Input 配置
        platform: 'neutral',
        external: [
          'lodash',
          'chalk',
          /^@types\//,
          (id) => id.startsWith('node:')
        ],
        define: {
          'process.env.NODE_ENV': '"production"',
          'global': 'globalThis'
        },
        treeshake: {
          moduleSideEffects: 'no-external',
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        // 添加额外的 Rolldown 插件
        plugins: [
          customRolldownPlugin(),
        ],
        // Output 配置（会覆盖 robuild 的输出配置）
        output: {
          manualChunks: {
            vendor: ['lodash', 'chalk']
          },
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          // 高级输出选项
          generatedCode: {
            arrowFunctions: true,
            constBindings: true,
            objectShorthand: true,
          },
          interop: 'auto',
          esModule: 'if-default-prop',
        }
      }
    }
  ]
})
```

### 与其他配置的关系

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
      
      // rolldown 配置（优先级最高，会覆盖上面的配置）
      rolldown: {
        platform: 'neutral',  // 覆盖 platform: 'node'
        external: ['chalk'],  // 覆盖 external: ['lodash']
        // 其他 Rolldown 特有的配置
        treeshake: false,
        logLevel: 'debug',
      }
    }
  ]
})
```

### 完整的 Rolldown 配置选项

参考 [Rolldown 官方文档](https://rolldown.rs/reference/config-options) 了解所有可用的配置选项：

- **Input Options**: `input`, `external`, `plugins`, `treeshake`, `platform`, `define`, `resolve`, `transform` 等
- **Output Options**: `dir`, `format`, `entryFileNames`, `chunkFileNames`, `assetFileNames`, `sourcemap`, `minify`, `banner`, `footer` 等

## Oxc 配置

### `OxcOptions`

```typescript
interface OxcOptions {
  typescript?: TypeScriptOptions         // TypeScript 选项
  javascript?: JavaScriptOptions         // JavaScript 选项
  cwd?: string                           // 工作目录
}
```

### Oxc 示例

```typescript
export default defineConfig({
  entries: [
    {
      type: 'transform',
      input: './src/runtime',
      oxc: {
        typescript: {
          target: 'ES2020',
          module: 'ESNext',
          declaration: { stripInternal: true }
        },
        javascript: {
          target: 'ES2020'
        },
        cwd: './src'
      }
    }
  ]
})
```

## 解析配置

### `ResolveOptions`

```typescript
interface ResolveOptions {
  extensions?: string[]                  // 文件扩展名
  suffixes?: string[]                    // 文件后缀
  alias?: Record<string, string>         // 路径别名
  modules?: string[]                     // 模块搜索路径
}
```

### 解析示例

```typescript
export default defineConfig({
  entries: [
    {
      type: 'transform',
      input: './src/runtime',
      resolve: {
        extensions: ['.ts', '.js', '.mjs', '.json'],
        suffixes: ['', '/index'],
        alias: {
          '@': './src',
          '~': './src/utils'
        },
        modules: ['node_modules', 'src']
      }
    }
  ]
})
```

## 清理配置

### `CleanOptions`

```typescript
interface CleanOptions {
  enabled?: boolean                      // 是否启用清理
  dirs?: string[]                        // 清理目录
  files?: string[]                       // 清理文件
  cache?: boolean                        // 是否清理缓存
}
```

### 清理示例

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  clean: {
    enabled: true,
    dirs: ['./dist', './lib'],
    files: ['./build.log'],
    cache: false
  }
})
```

## 缓存配置

### `CacheOptions`

```typescript
interface CacheOptions {
  enabled?: boolean                      // 是否启用缓存
  dir?: string                           // 缓存目录
  ttl?: number                           // 缓存过期时间
  strategy?: 'content-hash' | 'timestamp' // 缓存策略
}
```

### 缓存示例

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  cache: {
    enabled: true,
    dir: './.robuild-cache',
    ttl: 24 * 60 * 60 * 1000, // 24 小时
    strategy: 'content-hash'
  }
})
```

## 监听配置

### `WatchOptions`

```typescript
interface WatchOptions {
  enabled?: boolean                      // 是否启用监听
  include?: string[]                     // 包含的文件模式
  exclude?: string[]                     // 排除的文件模式
  delay?: number                         // 重建延迟时间（毫秒）
  ignoreInitial?: boolean                // 是否忽略初始构建
  watchNewFiles?: boolean                // 是否监听新文件
}
```

**选项说明：**

- `enabled`: 启用监听模式，默认 `false`
- `include`: 要监听的文件 glob 模式数组，默认根据构建条目自动推断
- `exclude`: 要排除的文件 glob 模式数组，默认排除 `node_modules`、`dist` 等
- `delay`: 文件变化后的重建延迟时间，默认 `100` 毫秒
- `ignoreInitial`: 是否跳过启动时的初始构建，默认 `false`
- `watchNewFiles`: 是否监听新增的文件，默认 `true`

### 监听示例

#### 基本监听配置

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,                        // 启用监听模式
    delay: 100,                          // 100ms 延迟
  }
})
```

#### 自定义监听模式

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,
    include: [                           // 自定义监听文件
      'src/**/*.ts',
      'src/**/*.js',
      'config/**/*'
    ],
    exclude: [                           // 排除文件
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/temp/**/*'
    ],
    delay: 200,                          // 增加延迟时间
    ignoreInitial: false,                // 启动时执行初始构建
    watchNewFiles: true,                 // 监听新文件
  }
})
```

#### 开发环境配置

```typescript
// build.config.dev.ts
export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,
    delay: 50,                           // 更快的响应
    watchNewFiles: true,
  }
})
```

## 环境变量配置

robuild 支持通过环境变量进行配置：

```bash
# 设置工作目录
ROBUILD_CWD=./packages/core

# 启用调试模式
DEBUG=robuild:*

# 设置缓存目录
ROBUILD_CACHE_DIR=./.cache

# 设置日志级别
ROBUILD_LOG_LEVEL=info
```

## 配置文件优先级

配置的优先级顺序：

1. **CLI 参数** - 最高优先级
2. **环境变量** - 次高优先级
3. **配置文件** - 中等优先级
4. **默认值** - 最低优先级

## 配置验证

robuild 会自动验证配置：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      // 无效配置会被自动检测
      invalidOption: 'value' // ❌ 会被忽略并警告
    }
  ]
})
```

## 配置类型安全

使用 TypeScript 获得完整的类型安全：

```typescript
import { defineConfig, type BuildConfig } from 'robuild'

// 享受完整的类型提示和检查
const config: BuildConfig = {
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      // TypeScript 会提供完整的类型提示
    }
  ]
}

export default defineConfig(config)
```

## 下一步

- [类型定义](./types.md) - 完整的类型定义
- [CLI 参数](./cli.md) - 命令行参数详解
- [API 文档](./) - 程序化 API 使用
- [配置示例](../guide/configuration.md) - 实际配置示例
