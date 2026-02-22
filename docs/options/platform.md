# 目标平台 {#platform}

`platform` 选项指定构建目标平台，影响模块解析和内置模块处理。

## 默认值 {#default}

默认平台为 `node`。

## CLI 用法 {#cli-usage}

```sh
robuild --platform node ./src/index.ts
robuild --platform browser ./src/index.ts
robuild --platform neutral ./src/index.ts
```

## 配置文件用法 {#config-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      platform: 'browser',
    },
  ],
})
```

## 可用值 {#available-values}

### `node` {#node}

- 适用于 Node.js 环境
- 自动将 Node.js 内置模块标记为外部
- 输出 `.mjs` / `.cjs` 扩展名

### `browser` {#browser}

- 适用于浏览器环境
- 可以打包 Node.js polyfills
- 输出 `.js` 扩展名

### `neutral` {#neutral}

- 通用平台，不做特殊处理
- 适用于同时支持多环境的库
- 输出 `.js` 扩展名

## 使用场景 {#use-cases}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    // Node.js CLI 工具
    {
      type: 'bundle',
      input: './src/cli.ts',
      platform: 'node',
    },
    // 浏览器库
    {
      type: 'bundle',
      input: './src/browser.ts',
      platform: 'browser',
      format: 'iife',
      globalName: 'MyLib',
    },
    // 同构库（同时支持 Node.js 和浏览器）
    {
      type: 'bundle',
      input: './src/index.ts',
      platform: 'neutral',
      format: ['esm', 'cjs'],
    },
  ],
})
```

:::tip
对于纯库项目，通常使用 `neutral` 平台，让最终使用者决定如何处理平台特定的依赖。
:::

## 下一步 {#next-steps}

- [目标版本](./target.md) - ECMAScript 目标版本
- [依赖处理](./dependencies.md) - 依赖处理选项
