# 构建模式

robuild 支持两种主要的构建模式：**Bundle 模式**和**Transform 模式**，每种模式都有其特定的使用场景和优势。

## Bundle 模式

Bundle 模式将多个文件打包成单个文件，适合库发布和应用程序构建。

### 特点

- **单文件输出**: 将依赖打包成单个文件
- **代码分割**: 支持动态导入和代码分割
- **依赖外部化**: 自动处理外部依赖
- **类型声明**: 自动生成 TypeScript 声明文件

### 使用场景

- 库发布
- CLI 工具构建
- 应用程序打包
- 需要代码分割的项目

### 基本用法

```bash
# 单个文件打包
robuild ./src/index.ts

# 多入口打包
robuild ./src/index.ts,./src/cli.ts

# 指定输出目录
robuild ./src/index.ts:./lib
```

### 配置示例

```typescript
import { defineConfig } from 'robuild/config'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
      minify: true,
      dts: true,
      rolldown: {
        platform: 'neutral',
        external: ['lodash'],
      },
    },
  ],
})
```

### 输出文件

```
dist/
├── index.mjs          # 主文件
├── index.d.mts        # 类型声明文件
└── _chunks/           # 代码分割文件（如果有）
    └── chunk-abc123.mjs
```

### 高级配置

#### 代码分割

```typescript
{
  type: 'bundle',
  input: './src/index.ts',
  rolldown: {
    output: {
      manualChunks: {
        vendor: ['lodash', 'chalk'],
        utils: ['./src/utils'],
      },
    },
  },
}
```

#### 外部依赖

```typescript
{
  type: 'bundle',
  input: './src/index.ts',
  rolldown: {
    external: [
      'lodash',
      'chalk',
      /^@types\//,
      (id) => id.startsWith('node:'),
    ],
  },
}
```

#### 平台特定配置

```typescript
{
  type: 'bundle',
  input: './src/cli.ts',
  rolldown: {
    platform: 'node',
    target: 'node18',
  },
}
```

## Transform 模式

Transform 模式转换目录中的所有文件，保持文件结构，适合运行时文件和工具脚本。

### 特点

- **保持结构**: 保持原始目录结构
- **文件转换**: 将 TypeScript 转换为 JavaScript
- **模块重写**: 自动重写模块导入路径
- **声明生成**: 生成对应的类型声明文件

### 使用场景

- 运行时文件
- 工具脚本
- 配置文件
- 需要保持文件结构的项目

### 基本用法

```bash
# 转换整个目录
robuild ./src/runtime/:./dist/runtime

# 保持目录结构
robuild ./src/:./dist/
```

### 配置示例

```typescript
import { defineConfig } from 'robuild/config'

export default defineConfig({
  entries: [
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
})
```

### 输出文件

```
dist/runtime/
├── index.mjs          # 转换后的文件
├── index.d.mts        # 类型声明文件
├── utils.mjs
├── utils.d.mts
└── config.mjs
```

### 高级配置

#### TypeScript 配置

```typescript
{
  type: 'transform',
  input: './src/runtime',
  outDir: './dist/runtime',
  oxc: {
    typescript: {
      target: 'ES2020',
      declaration: {
        stripInternal: true,
        emitDeclarationOnly: false,
      },
    },
  },
}
```

#### 模块解析

```typescript
{
  type: 'transform',
  input: './src/runtime',
  outDir: './dist/runtime',
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.cjs', '.json'],
    suffixes: ['', '/index'],
    alias: {
      '@': './src',
    },
  },
}
```

#### 文件过滤

```typescript
{
  type: 'transform',
  input: './src/runtime',
  outDir: './dist/runtime',
  oxc: {
    include: ['**/*.ts'],
    exclude: ['**/*.test.ts', '**/*.spec.ts'],
  },
}
```

## 模式对比

| 特性 | Bundle 模式 | Transform 模式 |
|------|-------------|----------------|
| 输出格式 | 单文件 | 多文件 |
| 文件结构 | 扁平化 | 保持原结构 |
| 依赖处理 | 打包或外部化 | 重写路径 |
| 代码分割 | 支持 | 不支持 |
| 适用场景 | 库发布 | 运行时文件 |
| 构建速度 | 中等 | 快速 |
| 输出大小 | 优化 | 原始大小 |

## 混合使用

可以在同一个项目中混合使用两种模式：

```typescript
import { defineConfig } from 'robuild/config'

export default defineConfig({
  entries: [
    // Bundle 模式 - 主库文件
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
      minify: true,
      dts: true,
    },
    // Transform 模式 - 运行时文件
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      minify: false,
    },
    // Transform 模式 - 类型定义
    {
      type: 'transform',
      input: './src/types',
      outDir: './dist/types',
      minify: false,
    },
  ],
})
```

## 性能考虑

### Bundle 模式性能

- **优点**: 输出文件优化，支持代码分割
- **缺点**: 构建时间较长，内存占用较高
- **优化**: 使用外部依赖，合理配置代码分割

### Transform 模式性能

- **优点**: 构建速度快，内存占用低
- **缺点**: 输出文件较多，无代码优化
- **优化**: 并行处理，智能缓存

## 最佳实践

### 1. 选择合适的模式

```typescript
// 库发布 - 使用 Bundle 模式
{
  type: 'bundle',
  input: './src/index.ts',
  minify: true,
  dts: true,
}

// 运行时文件 - 使用 Transform 模式
{
  type: 'transform',
  input: './src/runtime',
  minify: false,
}
```

### 2. 合理配置外部依赖

```typescript
// Bundle 模式中配置外部依赖
{
  type: 'bundle',
  input: './src/index.ts',
  rolldown: {
    external: [
      // 运行时依赖
      'lodash',
      'chalk',
      // 开发依赖
      /^@types\//,
      // Node.js 内置模块
      (id) => id.startsWith('node:'),
    ],
  },
}
```

### 3. 优化构建性能

```typescript
// 并行构建多个入口
const entries = [
  { type: 'bundle', input: './src/index.ts' },
  { type: 'transform', input: './src/runtime' },
]

// 使用 stub 模式开发
const devEntries = entries.map(entry => ({
  ...entry,
  stub: true,
}))
```

### 4. 处理特殊文件

```typescript
// 处理 shebang
{
  type: 'bundle',
  input: './src/cli.ts',
  rolldown: {
    plugins: [shebangPlugin()],
  },
}

// 处理 JSON 文件
{
  type: 'transform',
  input: './src/config',
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
}
```

## 下一步

- [Stub 模式](./stub-mode.md) - 开发模式详解
- [TypeScript 支持](./typescript.md) - TypeScript 集成
- [ESM 兼容性](./esm.md) - ESM 模块支持
- [配置](./configuration.md) - 详细配置选项
