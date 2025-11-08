# 配置

robuild 支持通过配置文件进行精细化的构建配置，提供灵活性和可维护性。

## 配置文件

robuild 支持以下配置文件格式：

- `build.config.ts` (推荐)
- `build.config.mjs`
- `build.config.js`

## 基本配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  cwd: '.',
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
    },
  ],
})
```

## 配置选项

### `cwd`
工作目录，默认为当前目录。

```typescript
export default defineConfig({
  cwd: './packages/core',
  // ...
})
```

### `entries`
构建入口配置数组，支持字符串和对象两种格式。

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
      outDir: './dist',
    },
  ],
})
```

### `workspace`
工作区配置，用于 monorepo 项目。

```typescript
export default defineConfig({
  workspace: {
    packages: ['packages/*', 'apps/*'],  // 包路径模式
    filter: '@mycompany/*',              // 包过滤器
    dependencyOrder: true,               // 依赖顺序构建
    parallel: true                       // 并行构建
  }
})
```

### `watch`
监听模式配置。

```typescript
export default defineConfig({
  watch: {
    enabled: false,                      // 启用监听
    include: ['src/**/*'],               // 监听文件
    exclude: ['**/*.test.ts'],           // 忽略文件
    delay: 100,                          // 重建延迟
    ignoreInitial: false,                // 跳过初始构建
    watchNewFiles: true                  // 监听新文件
  }
})
```

### `exports`
包导出生成配置。

```typescript
export default defineConfig({
  exports: {
    enabled: true,                       // 启用导出生成
    includeTypes: true,                  // 包含类型定义
    autoUpdate: true,                    // 自动更新 package.json
    customMappings: {                    // 自定义映射
      './utils': './dist/utils/index.js'
    }
  }
})
```

### `logLevel`
日志级别配置。

```typescript
export default defineConfig({
  logLevel: 'info'                       // 'silent' | 'error' | 'warn' | 'info' | 'debug'
})
```

### `failOnWarn`
警告时是否失败。

```typescript
export default defineConfig({
  failOnWarn: true                       // 警告时构建失败
})
```

### `onSuccess`
成功回调配置。

```typescript
export default defineConfig({
  onSuccess: 'echo "Build completed!"',  // 命令字符串
  // 或者
  onSuccess: (ctx) => {                  // 回调函数
    console.log('构建成功:', ctx.pkg.name)
  }
})
```

### `ignoreWatch`
忽略监听的文件模式。

```typescript
export default defineConfig({
  ignoreWatch: ['**/*.test.ts', 'dist/**']
})
```

### `hooks`
构建钩子函数，用于自定义构建流程。

```typescript
export default defineConfig({
  hooks: {
    start: (ctx) => {
      console.log('开始构建:', ctx.pkg.name)
    },
    end: (ctx) => {
      console.log('构建完成')
    },
  },
})
```

## Bundle 配置

Bundle 模式用于将多个文件打包成单个文件。

### 基本配置

```typescript
{
  type: 'bundle',
  input: './src/index.ts',
  outDir: './dist',
}
```

### 完整配置

```typescript
{
  type: 'bundle',
  input: ['./src/index.ts', './src/cli.ts'],
  outDir: './dist',
  minify: false,
  stub: false,
  rolldown: {
    platform: 'neutral',
    external: ['lodash'],
  },
  dts: {
    compilerOptions: {
      declaration: true,
    },
  },
}
```

### 配置选项

#### `input`
入口文件路径，支持字符串或字符串数组。

```typescript
input: './src/index.ts'
input: ['./src/index.ts', './src/cli.ts']
```

#### `outDir`
输出目录，默认为 `dist/`。

```typescript
outDir: './lib'
```

#### `format`
输出格式，支持多种格式。

```typescript
format: 'esm'                    // 单一格式
format: ['esm', 'cjs']          // 多种格式
format: ['esm', 'cjs', 'iife', 'umd']
```

#### `platform`
目标平台。

```typescript
platform: 'browser'             // 浏览器
platform: 'node'               // Node.js
platform: 'neutral'            // 中性平台
```

#### `globalName`
IIFE/UMD 格式的全局变量名。

```typescript
globalName: 'MyLib'
```

#### `minify`
是否压缩代码，支持多种选项：

```typescript
minify: false                    // 不压缩
minify: true                     // 压缩
minify: 'dce-only'              // 仅死代码消除
minify: {                        // 自定义压缩选项
  mangle: true,
  compress: true,
}
```

#### `clean`
是否清理输出目录。

```typescript
clean: true                      // 清理
clean: false                     // 不清理
clean: ['dist/old']             // 清理特定目录
```

#### `stub`
是否启用 stub 模式，默认为 `false`。

```typescript
stub: true
```

#### `env`
环境变量注入。

```typescript
env: {
  NODE_ENV: 'production',
  VERSION: '1.0.0',
  API_URL: 'https://api.example.com'
}
```

#### `define`
编译时常量定义。

```typescript
define: {
  __DEV__: 'false',
  BUILD_TIME: 'Date.now()',
  'process.env.NODE_ENV': '"production"'
}
```

#### `external`
外部依赖配置。

```typescript
external: ['lodash']             // 字符串数组
external: [/^@types\//]         // 正则表达式
external: (id) => id.includes('node_modules') // 函数
```

#### `noExternal`
强制打包的依赖。

```typescript
noExternal: ['some-package']
```

#### `alias`
路径别名配置。

```typescript
alias: {
  '@': './src',
  '@utils': './src/utils',
  '@components': './src/components'
}
```

#### `banner` / `footer`
代码横幅和页脚。

```typescript
banner: '/* My Library v1.0.0 */'
footer: '/* End of library */'
```

#### `hash`
文件名哈希。

```typescript
hash: true                       // 启用哈希
hash: false                      // 禁用哈希
```

#### `copy`
文件复制配置。

```typescript
copy: [
  { from: './README.md', to: './dist/' },
  { from: './assets/', to: './dist/assets/' }
]
```

#### `rolldown`
rolldown 配置选项。

```typescript
rolldown: {
  platform: 'neutral',           // 平台类型
  external: ['lodash'],          // 外部依赖
  plugins: [],                   // 插件
  define: {                      // 全局变量定义
    'process.env.NODE_ENV': '"production"',
  },
}
```

#### `dts`
TypeScript 声明文件配置。

```typescript
dts: {
  compilerOptions: {
    declaration: true,
    emitDeclarationOnly: false,
  },
  include: ['src/**/*'],
  exclude: ['src/**/*.test.ts'],
}
```

#### `loaders`
文件加载器配置。

```typescript
loaders: {
  '.json': { loader: 'json' },
  '.css': { loader: 'css' },
  '.txt': { loader: 'text' },
  '.png': { loader: 'file' },
  '.svg': { loader: 'dataurl' }
}
```

#### `cjsDefault`
CommonJS 默认导出处理。

```typescript
cjsDefault: 'auto'               // 自动检测
cjsDefault: true                 // 强制转换
cjsDefault: false                // 禁用转换
```

#### `shims`
兼容性垫片配置。

```typescript
shims: true                      // 启用所有垫片
shims: {                         // 详细配置
  dirname: true,                 // __dirname 垫片
  require: true,                 // require 垫片
  exports: true,                 // exports 垫片
  env: true                      // process.env 垫片
}
```

#### `skipNodeModules`
跳过 node_modules 打包。

```typescript
skipNodeModules: true            // 跳过打包
skipNodeModules: false           // 正常打包
```

**注意**: 当启用 `skipNodeModules: true` 时，`@oxc-project/runtime` 的 helper 函数（如 `asyncToGenerator`）会自动内联到产物中，而不是作为外部依赖。这确保了与 tsdown 相同的行为，避免运行时依赖缺失的问题。

#### `unbundle`
保持文件结构模式。

```typescript
unbundle: true                   // 启用 unbundle
unbundle: false                  // 正常打包
```

#### `plugins`
插件配置。

```typescript
plugins: [
  // Rollup 插件
  json(),
  resolve(),

  // Vite 插件（自动适配）
  react(),

  // Unplugin（自动适配）
  unpluginExample(),

  // 自定义插件
  {
    name: 'my-plugin',
    transform(code, id) {
      // 插件逻辑
    }
  }
]
```

#### `globImport`
Glob 导入配置。

```typescript
globImport: {
  enabled: true,                 // 启用 glob import
  patterns: ['**/*.vue'],        // 允许的文件模式
  eager: false                   // 默认懒加载
}
```

## Transform 配置

Transform 模式用于转换目录中的所有文件。

### 基本配置

```typescript
{
  type: 'transform',
  input: './src/runtime',
  outDir: './dist/runtime',
}
```

### 完整配置

```typescript
{
  type: 'transform',
  input: './src/runtime',
  outDir: './dist/runtime',
  minify: false,
  stub: false,
  oxc: {
    typescript: {
      declaration: { stripInternal: true },
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs'],
    suffixes: ['', '/index'],
  },
}
```

### 配置选项

#### `input`
输入目录路径。

```typescript
input: './src/runtime'
```

#### `outDir`
输出目录路径。

```typescript
outDir: './dist/runtime'
```

#### `minify`
是否压缩代码。

```typescript
minify: true
minify: {
  mangle: true,
  compress: true,
}
```

#### `stub`
是否启用 stub 模式。

```typescript
stub: true
```

#### `oxc`
oxc-transform 配置选项。

```typescript
oxc: {
  typescript: {
    declaration: { stripInternal: true },
    target: 'ES2020',
  },
  cwd: './src',
}
```

#### `resolve`
模块解析配置。

```typescript
resolve: {
  extensions: ['.ts', '.js', '.mjs', '.cjs', '.json'],
  suffixes: ['', '/index'],
  alias: {
    '@': './src',
  },
}
```

## Hooks 配置

Hooks 允许你在构建过程的不同阶段执行自定义逻辑。

### 可用 Hooks

#### `start`
构建开始时执行。

```typescript
hooks: {
  start: (ctx) => {
    console.log('开始构建:', ctx.pkg.name)
    console.log('项目目录:', ctx.pkgDir)
  },
}
```

#### `end`
构建结束时执行。

```typescript
hooks: {
  end: (ctx) => {
    console.log('构建完成')
  },
}
```

#### `entries`
处理构建入口时执行。

```typescript
hooks: {
  entries: (entries, ctx) => {
    console.log('构建入口:', entries.length)
    entries.forEach(entry => {
      console.log('-', entry.input)
    })
  },
}
```

#### `rolldownConfig`
处理 rolldown 配置时执行。

```typescript
hooks: {
  rolldownConfig: (config, ctx) => {
    // 修改 rolldown 配置
    config.define = {
      ...config.define,
      'process.env.VERSION': `"${ctx.pkg.version}"`,
    }
  },
}
```

#### `rolldownOutput`
处理 rolldown 输出时执行。

```typescript
hooks: {
  rolldownOutput: (output, res, ctx) => {
    console.log('输出配置:', output)
  },
}
```

## 实际示例

### 1. 简单库配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
      minify: false,
      dts: true,
    },
  ],
})
```

### 2. CLI 工具配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/cli.ts',
      outDir: './dist',
      minify: true,
      dts: false,
      rolldown: {
        platform: 'node',
      },
    },
  ],
})
```

### 3. 复杂项目配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts'],
      outDir: './dist',
      minify: true,
      dts: true,
      rolldown: {
        external: ['lodash', 'chalk'],
        define: {
          'process.env.NODE_ENV': '"production"',
        },
      },
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      minify: false,
      oxc: {
        typescript: {
          declaration: { stripInternal: true },
        },
      },
    },
  ],
  hooks: {
    start: (ctx) => {
      console.log(`构建 ${ctx.pkg.name} v${ctx.pkg.version}`)
    },
    end: (ctx) => {
      console.log('构建完成!')
    },
  },
})
```

### 4. Monorepo 配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  cwd: './packages/core',
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
      minify: false,
      dts: true,
      rolldown: {
        external: ['../utils', '../types'],
      },
    },
  ],
})
```

## 环境变量

robuild 支持通过环境变量进行配置：

```bash
# 设置工作目录
ROBUILD_CWD=./packages/core

# 启用调试模式
DEBUG=robuild:*
```

## 配置文件优先级

1. CLI 参数
2. 配置文件
3. 默认值

## 下一步

- [构建模式](./build-modes.md) - 深入了解 Bundle 和 Transform 模式
- [Stub 模式](./stub-mode.md) - 开发模式详解
- [Hooks](./hooks.md) - 构建钩子详解
- [API 文档](../api/) - 程序化 API 使用
