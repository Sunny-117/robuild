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

#### `stub`
是否启用 stub 模式，默认为 `false`。

```typescript
stub: true
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
