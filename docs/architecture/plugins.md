# 插件系统

robuild 的插件系统提供了强大的扩展能力，允许你自定义构建流程和添加新功能。

## 插件系统架构

### 整体设计

```mermaid
graph TB
    A[构建引擎] --> B[插件管理器]
    B --> C[Bundle 插件]
    B --> D[Transform 插件]
    B --> E[通用插件]

    C --> F[rolldown 插件]
    C --> G[自定义插件]

    D --> H[oxc 插件]
    D --> I[文件处理插件]

    E --> J[Hooks 插件]
    E --> K[工具插件]

    subgraph "插件生命周期"
        L[注册]
        M[初始化]
        N[执行]
        O[清理]
    end

    B --> L
    B --> M
    B --> N
    B --> O
```

## 插件类型

### 1. Bundle 插件

用于 Bundle 模式的插件，基于 rolldown 的插件系统：

```typescript
interface BundlePlugin {
  name: string
  setup?: (build: BuildContext) => void | Promise<void>
  transform?: (code: string, id: string) => string | Promise<string>
  load?: (id: string) => string | Promise<string>
  generateBundle?: (options: GenerateBundleOptions) => void | Promise<void>
}
```

### 2. Transform 插件

用于 Transform 模式的插件，基于 oxc 的转换系统：

```typescript
interface TransformPlugin {
  name: string
  setup?: (context: TransformContext) => void | Promise<void>
  transform?: (code: string, id: string) => string | Promise<string>
  resolve?: (id: string, importer?: string) => string | Promise<string>
}
```

### 3. 通用插件

可以在任何构建模式下使用的插件：

```typescript
interface UniversalPlugin {
  name: string
  setup?: (context: BuildContext) => void | Promise<void>
  beforeBuild?: (entry: BuildEntry) => void | Promise<void>
  afterBuild?: (result: BuildResult) => void | Promise<void>
}
```

## 插件管理器

### 核心实现

```typescript
// src/plugins/manager.ts
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private bundlePlugins: BundlePlugin[] = []
  private transformPlugins: TransformPlugin[] = []
  private universalPlugins: UniversalPlugin[] = []

  constructor(private context: BuildContext) {}

  // 注册插件
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`插件已存在: ${plugin.name}`)
    }

    this.plugins.set(plugin.name, plugin)

    // 分类插件
    if (this.isBundlePlugin(plugin)) {
      this.bundlePlugins.push(plugin as BundlePlugin)
    } else if (this.isTransformPlugin(plugin)) {
      this.transformPlugins.push(plugin as TransformPlugin)
    } else if (this.isUniversalPlugin(plugin)) {
      this.universalPlugins.push(plugin as UniversalPlugin)
    }
  }

  // 获取插件
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  // 获取 Bundle 插件
  getBundlePlugins(): BundlePlugin[] {
    return this.bundlePlugins
  }

  // 获取 Transform 插件
  getTransformPlugins(): TransformPlugin[] {
    return this.transformPlugins
  }

  // 获取通用插件
  getUniversalPlugins(): UniversalPlugin[] {
    return this.universalPlugins
  }
}
```

### 插件生命周期管理

```typescript
export class PluginLifecycleManager {
  constructor(private pluginManager: PluginManager) {}

  // 初始化所有插件
  async initialize(): Promise<void> {
    const plugins = [
      ...this.pluginManager.getBundlePlugins(),
      ...this.pluginManager.getTransformPlugins(),
      ...this.pluginManager.getUniversalPlugins()
    ]

    for (const plugin of plugins) {
      if (plugin.setup) {
        try {
          await plugin.setup(this.context)
        } catch (error) {
          throw new PluginError(`插件初始化失败: ${plugin.name}`, error)
        }
      }
    }
  }

  // 执行构建前钩子
  async beforeBuild(entry: BuildEntry): Promise<void> {
    const plugins = this.pluginManager.getUniversalPlugins()

    for (const plugin of plugins) {
      if (plugin.beforeBuild) {
        try {
          await plugin.beforeBuild(entry)
        } catch (error) {
          console.warn(`插件 beforeBuild 失败: ${plugin.name}`, error)
        }
      }
    }
  }

  // 执行构建后钩子
  async afterBuild(result: BuildResult): Promise<void> {
    const plugins = this.pluginManager.getUniversalPlugins()

    for (const plugins of plugins) {
      if (plugin.afterBuild) {
        try {
          await plugin.afterBuild(result)
        } catch (error) {
          console.warn(`插件 afterBuild 失败: ${plugin.name}`, error)
        }
      }
    }
  }
}
```

## 内置插件

### 1. Shebang 插件

自动处理 shebang 行：

```typescript
// src/plugins/shebang.ts
export interface ShebangOptions {
  shebang?: string
  preserve?: boolean
}

export function shebangPlugin(options: ShebangOptions = {}): BundlePlugin {
  const { shebang = '#!/usr/bin/env node', preserve = true } = options

  return {
    name: 'shebang',
    setup(build) {
      build.onLoad({ filter: /\.(js|mjs)$/ }, async (args) => {
        const code = await readFile(args.path, 'utf-8')

        // 检查是否已有 shebang
        if (code.startsWith('#!')) {
          if (preserve) {
            return { contents: code, loader: 'js' }
          }
          // 移除现有 shebang
          const cleanCode = code.replace(/^#!.*\n/, '')
          return { contents: cleanCode, loader: 'js' }
        }

        // 添加 shebang
        return {
          contents: `${shebang}\n${code}`,
          loader: 'js'
        }
      })
    }
  }
}
```

### 2. JSON 插件

处理 JSON 文件：

```typescript
// src/plugins/json.ts
export function jsonPlugin(): BundlePlugin {
  return {
    name: 'json',
    setup(build) {
      build.onLoad({ filter: /\.json$/ }, async (args) => {
        try {
          const contents = await readFile(args.path, 'utf-8')
          const data = JSON.parse(contents)

          return {
            contents: `export default ${JSON.stringify(data)}`,
            loader: 'js'
          }
        } catch (error) {
          throw new Error(`JSON 解析失败: ${args.path}`)
        }
      })
    }
  }
}
```

### 3. 环境变量插件

替换环境变量：

```typescript
// src/plugins/env.ts
export interface EnvPluginOptions {
  env?: Record<string, string>
  prefix?: string
}

export function envPlugin(options: EnvPluginOptions = {}): BundlePlugin {
  const { env = process.env, prefix = 'process.env.' } = options

  return {
    name: 'env',
    transform(code, id) {
      // 替换 process.env.VARIABLE 为实际值
      return code.replace(
        new RegExp(`${prefix}(\\w+)`, 'g'),
        (match, key) => {
          const value = env[key]
          return value ? JSON.stringify(value) : 'undefined'
        }
      )
    }
  }
}
```

### 4. 文件大小分析插件

分析构建结果：

```typescript
// src/plugins/size-analyzer.ts
export function sizeAnalyzerPlugin(): UniversalPlugin {
  return {
    name: 'size-analyzer',
    afterBuild(result) {
      console.log('\n文件大小分析:')

      for (const file of result.outputFiles) {
        try {
          const stats = statSync(file)
          const sizeKB = (stats.size / 1024).toFixed(2)
          console.log(`  ${file}: ${sizeKB} KB`)
        } catch (error) {
          console.warn(`无法获取文件大小: ${file}`)
        }
      }
    }
  }
}
```

## 自定义插件开发

### 1. 基本插件结构

```typescript
// my-plugin.ts
interface MyPluginOptions {
  enabled?: boolean
  config?: Record<string, any>
}

export function myPlugin(options: MyPluginOptions = {}): BundlePlugin {
  const { enabled = true, config = {} } = options

  if (!enabled) {
    return { name: 'my-plugin' } // 空插件
  }

  return {
    name: 'my-plugin',
    setup(build) {
      console.log('My plugin initialized with config:', config)
    },
    transform(code, id) {
      // 转换逻辑
      if (id.endsWith('.ts') || id.endsWith('.js')) {
        return code.replace(/console\.log/g, '// console.log')
      }
      return code
    }
  }
}
```

### 2. 高级插件示例

```typescript
// auto-import-plugin.ts
interface AutoImportOptions {
  imports: Record<string, string[]>
}

export function autoImportPlugin(options: AutoImportOptions): BundlePlugin {
  const { imports } = options

  return {
    name: 'auto-import',
    transform(code, id) {
      if (!id.endsWith('.ts') && !id.endsWith('.js')) {
        return code
      }

      let importStatements = ''

      // 检查代码中使用的导入
      for (const [module, exports] of Object.entries(imports)) {
        const used = exports.filter(exp =>
          new RegExp(`\\b${exp}\\b`).test(code)
        )

        if (used.length > 0) {
          importStatements += `import { ${used.join(', ')} } from '${module}'\n`
        }
      }

      return importStatements + code
    }
  }
}
```

### 3. 插件配置

```typescript
// 使用自定义插件
import { defineConfig } from 'robuild/config'
import { myPlugin, autoImportPlugin } from './my-plugins'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        plugins: [
          myPlugin({
            enabled: true,
            config: { debug: true }
          }),
          autoImportPlugin({
            imports: {
              'lodash': ['debounce', 'throttle'],
              'chalk': ['red', 'green', 'blue']
            }
          })
        ]
      }
    }
  ]
})
```

## 插件生态系统

### 1. 官方插件

robuild 提供了一些官方插件：

```typescript
import {
  shebangPlugin,
  jsonPlugin,
  envPlugin,
  sizeAnalyzerPlugin
} from 'robuild/plugins'
```

### 2. 社区插件

社区维护的插件：

```typescript
import {
  vuePlugin,
  reactPlugin,
  typescriptPlugin
} from '@robuild/plugins'
```

### 3. 插件开发工具

```bash
# 创建插件项目
mkdir robuild-plugin-example
cd robuild-plugin-example
npm init -y

# 安装开发依赖
npm install --save-dev typescript @types/node
npm install robuild
```

## 插件调试

### 1. 调试模式

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  rolldown: {
    plugins: [
      {
        name: 'debug-plugin',
        setup(build) {
          // 启用调试日志
          if (process.env.DEBUG) {
            console.log('插件调试信息:', build.config)
          }
        }
      }
    ]
  }
})
```

### 2. 插件测试

```typescript
// 测试插件
import { myPlugin } from './my-plugin'

const plugin = myPlugin({ enabled: true })
const result = plugin.transform('console.log("hello")', 'test.js')
console.log(result) // // console.log("hello")
```

### 3. 错误处理

```typescript
export function safePlugin(): BundlePlugin {
  return {
    name: 'safe-plugin',
    transform(code, id) {
      try {
        // 插件逻辑
        return modifiedCode
      } catch (error) {
        console.error(`插件错误 (${id}):`, error)
        return code // 返回原始代码
      }
    }
  }
}
```

## 性能优化

### 1. 插件缓存

```typescript
export function cachedPlugin(): BundlePlugin {
  const cache = new Map()

  return {
    name: 'cached-plugin',
    transform(code, id) {
      // 使用缓存避免重复处理
      if (cache.has(id)) {
        return cache.get(id)
      }

      const result = processCode(code)
      cache.set(id, result)
      return result
    }
  }
}
```

### 2. 条件执行

```typescript
export function conditionalPlugin(): BundlePlugin {
  return {
    name: 'conditional-plugin',
    transform(code, id) {
      // 只在特定条件下执行
      if (!shouldProcess(id)) {
        return code
      }

      return processCode(code)
    }
  }
}
```

### 3. 并行处理

```typescript
export function parallelPlugin(): BundlePlugin {
  return {
    name: 'parallel-plugin',
    async transform(code, id) {
      // 并行处理多个任务
      const [result1, result2] = await Promise.all([
        processTask1(code),
        processTask2(code)
      ])

      return combineResults(result1, result2)
    }
  }
}
```

## 最佳实践

### 1. 插件命名

```typescript
// ✅ 好的命名
export function robuildPluginVue() { }
export function robuildPluginReact() { }
export function robuildPluginTypescript() { }

// ❌ 避免的命名
export function plugin() { }
export function myPlugin() { }
```

### 2. 错误处理

```typescript
export function robustPlugin(): BundlePlugin {
  return {
    name: 'robust-plugin',
    transform(code, id) {
      try {
        return processCode(code)
      } catch (error) {
        // 记录错误但不中断构建
        console.warn(`插件错误: ${error.message}`)
        return code
      }
    }
  }
}
```

### 3. 类型安全

```typescript
import { type BundlePlugin } from 'robuild/plugins'

export function typedPlugin(): BundlePlugin {
  return {
    name: 'typed-plugin',
    setup(build) {
      // 享受完整的类型提示
      console.log(build.config)
    }
  }
}
```

## 下一步

- [构建器](./builders.md) - Bundle 和 Transform 构建器详解
- [核心架构](./core.md) - 深入了解核心组件
- [性能分析](./performance.md) - 性能优化和基准测试
- [API 文档](../api/) - 程序化 API 使用