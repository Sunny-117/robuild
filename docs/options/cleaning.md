# 清理 {#cleaning}

`robuild` 默认在构建前清理输出目录，确保不会残留旧文件。

## CLI 用法 {#cli-usage}

```sh
# 默认启用清理
robuild ./src/index.ts

# 显式启用清理
robuild --clean ./src/index.ts

# 禁用清理
robuild --no-clean ./src/index.ts
```

## 配置文件用法 {#config-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  clean: true, // 全局设置
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      clean: true, // 入口级设置
    },
  ],
})
```

## 清理特定文件 {#clean-specific}

您可以指定只清理特定的文件或目录：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      clean: ['*.js', '*.map'], // 只清理 .js 和 .map 文件
    },
  ],
})
```

## 多入口注意事项 {#multiple-entries}

当有多个入口输出到同一目录时，后续入口应禁用清理，避免覆盖之前的构建产物：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
      clean: true,  // 第一个入口清理
    },
    {
      type: 'bundle',
      input: './src/cli.ts',
      outDir: './dist',
      clean: false, // 后续入口不清理
    },
  ],
})
```

:::warning
如果多个入口输出到同一目录且都启用清理，后面的入口可能会删除前面入口的输出文件。
:::

## 下一步 {#next-steps}

- [输出目录](./output-directory.md) - 输出目录配置
- [依赖处理](./dependencies.md) - 依赖处理选项
