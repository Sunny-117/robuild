# 输出目录 {#output-directory}

`robuild` 默认将构建产物输出到 `dist` 目录。您可以通过配置自定义输出目录。

## CLI 用法 {#cli-usage}

```sh
# 指定输出目录
robuild --out-dir ./lib ./src/index.ts

# 简写形式
robuild -d ./lib ./src/index.ts
```

## 配置文件用法 {#config-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './lib',
    },
  ],
})
```

## 多入口不同输出目录 {#multiple-outputs}

每个入口可以指定不同的输出目录：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
    },
    {
      type: 'bundle',
      input: './src/cli.ts',
      outDir: './dist/cli',
    },
  ],
})
```

## Transform 模式 {#transform-mode}

Transform 模式也支持自定义输出目录：

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

或通过 CLI：

```sh
robuild ./src/runtime/:./lib/runtime
```

## 自定义文件名 {#custom-filename}

使用 `fileName` 选项自定义输出文件名：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      fileName: 'bundle.min.js',
    },
  ],
})
```

:::warning
`fileName` 选项仅适用于单入口构建。
:::

## 下一步 {#next-steps}

- [清理](./cleaning.md) - 输出目录清理
- [输出格式](./output-format.md) - 输出格式选项
