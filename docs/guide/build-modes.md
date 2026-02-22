# 构建模式 {#build-modes}

robuild 支持两种构建模式：**Bundle 模式**和 **Transform 模式**。

## Bundle 模式 {#bundle-mode}

将多个文件打包成单个文件，适合库发布。

### 基本用法 {#bundle-basic}

```sh
robuild ./src/index.ts
```

### 配置示例 {#bundle-config}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      minify: true,
    },
  ],
})
```

### 输出结构 {#bundle-output}

```
dist/
├── index.mjs      # ESM 格式
├── index.cjs      # CJS 格式
├── index.d.mts    # 类型声明
└── _chunks/       # 代码分割文件
```

### 特点 {#bundle-features}

- 单文件输出
- 支持代码分割
- 自动处理外部依赖
- 生成类型声明

## Transform 模式 {#transform-mode}

转换目录中的所有文件，保持文件结构，适合运行时文件。

### 基本用法 {#transform-basic}

```sh
robuild ./src/runtime/:./dist/runtime
```

### 配置示例 {#transform-config}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
    },
  ],
})
```

### 输出结构 {#transform-output}

```
dist/runtime/
├── index.mjs      # 转换后的文件
├── index.d.mts    # 类型声明
├── utils.mjs
└── utils.d.mts
```

### 特点 {#transform-features}

- 保持目录结构
- 文件级转换
- 构建速度快

## 模式对比 {#comparison}

| 特性 | Bundle 模式 | Transform 模式 |
|------|-------------|----------------|
| 输出 | 单文件 | 多文件 |
| 结构 | 扁平化 | 保持原结构 |
| 依赖 | 打包/外部化 | 重写路径 |
| 代码分割 | 支持 | 不支持 |
| 适用 | 库发布 | 运行时文件 |

## 混合使用 {#mixed-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    // 主库 - Bundle
    {
      type: 'bundle',
      input: './src/index.ts',
      dts: true,
    },
    // 运行时 - Transform
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
    },
  ],
})
```

## 下一步 {#next-steps}

- [Stub 模式](./stub-mode.md) - 开发模式
- [TypeScript 支持](./typescript.md) - 类型声明生成
- [ESM 兼容性](./esm.md) - 模块格式
