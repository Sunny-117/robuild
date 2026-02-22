# 配置文件 {#config-file}

`robuild` 支持使用配置文件来定义构建选项，提供更灵活的配置方式。

## 支持的配置文件 {#supported-files}

`robuild` 会自动查找以下配置文件：

- `build.config.ts` (推荐)
- `build.config.mjs`
- `build.config.js`

## 基本用法 {#basic-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

## 指定配置文件 {#specify-config}

通过 `--config` 选项指定自定义配置文件：

```sh
robuild --config custom.config.ts
```

禁用配置文件：

```sh
robuild --no-config ./src/index.ts
```

## 配置风格 {#config-styles}

### entries 风格（unbuild 风格） {#entries-style}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
    },
  ],
})
```

### 扁平风格（tsup 风格） {#flat-style}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  minify: true,
})
```

:::tip
两种风格可以混合使用。当同时存在 `entries` 和 `entry` 时，`entries` 优先。
:::

## 从 Vite 配置加载 {#from-vite}

使用 `--from-vite` 选项可以从 Vite 配置文件加载配置：

```sh
robuild --from-vite
```

这对于已有 Vite 项目的集成非常有用。

## 下一步 {#next-steps}

- [入口](./entry.md) - 入口配置详解
- [输出格式](./output-format.md) - 输出格式选项
