# 入口

入口文件是构建的起点。`robuild` 支持多种入口配置方式。

## 基本用法

### CLI

```bash
# 单入口
robuild ./src/index.ts

# 多入口
robuild ./src/index.ts ./src/cli.ts

# Transform 模式（目录）
robuild ./src/runtime/:./dist/runtime
```

### 配置文件

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

## 入口格式

### 单文件入口

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
}
```

### 多文件入口

```ts [build.config.ts]
{
  type: 'bundle',
  input: ['./src/index.ts', './src/cli.ts'],
}
```

### 命名入口

```ts [build.config.ts]
{
  type: 'bundle',
  input: {
    index: './src/index.ts',
    cli: './src/cli.ts',
  },
}
```

## tsup 风格配置

`robuild` 也支持 tsup 风格的扁平配置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts', './src/cli.ts'],
  format: ['esm', 'cjs'],
  dts: true,
})
```

> [!TIP]
> 两种配置风格可以根据项目需求自由选择，`robuild` 会自动识别并处理。

## Transform 模式入口

Transform 模式使用目录作为入口：

```ts [build.config.ts]
{
  type: 'transform',
  input: './src/runtime',
  outDir: './dist/runtime',
}
```

或通过 CLI 使用 `:` 分隔输入和输出目录：

```bash
robuild ./src/runtime/:./dist/runtime
```
