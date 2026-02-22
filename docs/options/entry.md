# 入口 {#entry}

入口文件是构建的起点。`robuild` 支持多种入口配置方式。

## 基本用法 {#basic-usage}

### CLI {#cli}

```sh
# 单入口
robuild ./src/index.ts

# 多入口
robuild ./src/index.ts ./src/cli.ts

# Transform 模式（目录）
robuild ./src/runtime/:./dist/runtime
```

### 配置文件 {#config-file}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
})
```

## 入口格式 {#entry-formats}

### 单文件入口 {#single-file}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
})
```

### 多文件入口 {#multiple-files}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts'],
    },
  ],
})
```

### 命名入口 {#named-entries}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: {
        index: './src/index.ts',
        cli: './src/cli.ts',
      },
    },
  ],
})
```

## tsup 风格配置 {#tsup-style}

`robuild` 也支持 tsup 风格的扁平配置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts', './src/cli.ts'],
  format: ['esm', 'cjs'],
  dts: true,
})
```

:::tip
两种配置风格可以根据项目需求自由选择，`robuild` 会自动识别并处理。
:::

## Transform 模式入口 {#transform-entry}

Transform 模式使用目录作为入口：

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

或通过 CLI 使用 `:` 分隔输入和输出目录：

```sh
robuild ./src/runtime/:./dist/runtime
```

## 下一步 {#next-steps}

- [配置文件](./config-file.md) - 配置文件详解
- [输出目录](./output-directory.md) - 自定义输出位置
