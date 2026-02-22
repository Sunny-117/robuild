# 输出格式 {#output-format}

默认情况下，`robuild` 会生成 ESM（ECMAScript 模块）格式的 JavaScript 代码。您可以通过 `--format` 选项指定所需的输出格式。

## 可用格式 {#available-formats}

- **`esm`**：ECMAScript 模块格式，适用于现代 JavaScript 环境（默认）
- **`cjs`**：CommonJS 格式，用于 Node.js 项目
- **`iife`**：立即调用函数表达式，适合嵌入 `<script>` 标签
- **`umd`**：通用模块定义，兼容 AMD、CommonJS 以及全局变量

## CLI 用法 {#cli-usage}

```sh
# 生成 ESM 格式输出（默认）
robuild --format esm ./src/index.ts

# 同时生成 ESM 和 CJS 格式输出
robuild --format esm --format cjs ./src/index.ts

# 生成适用于浏览器的 IIFE 格式输出
robuild --format iife --global-name MyLib ./src/index.ts
```

## 配置文件用法 {#config-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
    },
  ],
})
```

## 输出文件扩展名 {#file-extensions}

不同格式会生成不同的文件扩展名：

| 格式 | Node 平台 | Browser 平台 |
|------|----------|-------------|
| esm  | `.mjs`   | `.js`       |
| cjs  | `.cjs`   | `.js`       |
| iife | `.js`    | `.js`       |

## IIFE/UMD 全局变量名 {#global-name}

使用 `iife` 或 `umd` 格式时，需要指定全局变量名：

```sh
robuild --format iife --global-name MyLibrary ./src/index.ts
```

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      globalName: 'MyLibrary',
    },
  ],
})
```

:::tip
您可以在单个命令中指定多个格式，以生成适用于不同环境的输出。例如，结合使用 `esm` 和 `cjs` 格式可以确保同时兼容现代和传统系统。
:::

## 下一步 {#next-steps}

- [输出目录](./output-directory.md) - 自定义输出位置
- [目标平台](./platform.md) - 平台配置
