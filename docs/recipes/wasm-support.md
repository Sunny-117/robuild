# WASM 支持 {#wasm-support}

`robuild` 通过 [`rolldown-plugin-wasm`](https://github.com/sxzz/rolldown-plugin-wasm) 支持打包 WebAssembly（WASM）模块。该插件允许您在 TypeScript 或 JavaScript 代码中直接导入 `.wasm` 文件，同时支持同步和异步实例化。

## 快速开始 {#quick-start}

### 安装依赖 {#install-dependencies}

首先安装 `rolldown-plugin-wasm`：

::: code-group

```sh [pnpm]
pnpm add -D rolldown-plugin-wasm
```

```sh [npm]
npm install -D rolldown-plugin-wasm
```

```sh [yarn]
yarn add -D rolldown-plugin-wasm
```

```sh [bun]
bun add -D rolldown-plugin-wasm
```

:::

### 配置 robuild {#configure-robuild}

在 `build.config.ts` 中启用 WASM 支持：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  wasm: true, // 启用 WASM 支持
})
```

或者使用详细配置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  wasm: {
    enabled: true,
    maxFileSize: 14 * 1024, // 小于 14KB 的文件将被内联
    targetEnv: 'auto',      // 自动检测运行环境
  },
})
```

## 导入 WASM 模块 {#import-wasm-modules}

### 直接导入 {#direct-import}

您可以直接导入 WASM 模块的导出函数：

```ts
import { add } from './math.wasm'

const result = add(1, 2) // 3
```

### 异步初始化 {#async-initialization}

使用 `?init` 查询参数获取异步初始化函数：

```ts
import init from './math.wasm?init'

const instance = await init(
  imports, // 可选的 imports 对象
)

instance.exports.add(1, 2)
```

### 同步初始化 {#sync-initialization}

使用 `?init&sync` 查询参数进行同步初始化：

```ts
import initSync from './math.wasm?init&sync'

const instance = initSync(
  imports, // 可选的 imports 对象
)

instance.exports.add(1, 2)
```

## 配置选项 {#configuration-options}

### 全局配置 {#global-config}

在顶层 `wasm` 选项中配置，对所有入口生效：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  wasm: {
    enabled: true,
    maxFileSize: 14 * 1024,
    fileName: '[hash][extname]',
    publicPath: '/assets/',
    targetEnv: 'auto',
  },
})
```

### 入口级配置 {#entry-config}

在入口配置中设置，仅对该入口生效，并覆盖全局配置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      wasm: {
        enabled: true,
        maxFileSize: 0, // 强制输出为单独文件
      },
    },
  ],
})
```

### 选项说明 {#options-reference}

| 选项          | 类型                                      | 默认值              | 说明                                                       |
| ------------- | ----------------------------------------- | ------------------- | ---------------------------------------------------------- |
| `enabled`     | `boolean`                                 | `false`             | 是否启用 WASM 支持                                         |
| `maxFileSize` | `number`                                  | `14336` (14KB)      | 内联的最大文件大小（字节）。超过此限制的文件将输出为单独文件 |
| `fileName`    | `string`                                  | `'[hash][extname]'` | 输出文件名模式，支持 `[hash]`、`[name]`、`[extname]` 占位符 |
| `publicPath`  | `string`                                  | `''`                | 非内联 WASM 文件的 URL 路径前缀                            |
| `targetEnv`   | `'auto' \| 'auto-inline' \| 'browser' \| 'node'` | `'auto'`   | 目标运行环境                                               |

### targetEnv 详解 {#target-env}

- **`'auto'`**（默认）- 运行时自动检测环境，同时支持 Node.js 和浏览器
- **`'auto-inline'`** - 始终内联，根据环境解码
- **`'browser'`** - 仅浏览器环境，省略 Node.js 内置模块
- **`'node'`** - 仅 Node.js 环境（需要 Node.js 20.16.0+）

## wasm-bindgen 支持 {#wasm-bindgen-support}

### 目标 `bundler`（推荐）{#target-bundler}

这是 `wasm-bindgen` 的默认目标，可以直接使用：

```ts
import { add } from 'some-wasm-pkg'

add(1, 2)
```

### 目标 `web` {#target-web}

#### Node.js 环境 {#node-env}

```ts
import { readFile } from 'node:fs/promises'
import init, { add } from 'some-pkg'
import wasmUrl from 'some-pkg/add_bg.wasm?url'

await init({
  module_or_path: readFile(new URL(wasmUrl, import.meta.url)),
})

add(1, 2)
```

#### 浏览器环境 {#browser-env}

```ts
import init, { add } from 'some-pkg/add.js'
import wasmUrl from 'some-pkg/add_bg.wasm?url'

await init({
  module_or_path: wasmUrl,
})

add(1, 2)
```

:::warning
不支持其他 `wasm-bindgen` 目标，如 `nodejs` 和 `no-modules`。
:::

## TypeScript 支持 {#typescript-support}

要获得 `.wasm` 导入的类型支持，请在 `tsconfig.json` 中添加类型声明：

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["rolldown-plugin-wasm/types"]
  }
}
```

这将为以下导入方式提供类型支持：

- `import { fn } from './module.wasm'` - 导出的函数
- `import init from './module.wasm?init'` - 异步初始化函数
- `import initSync from './module.wasm?init&sync'` - 同步初始化函数

## 使用插件方式 {#using-plugin-directly}

如果您需要更细粒度的控制，也可以直接使用 `rolldown-plugin-wasm` 插件：

```ts [build.config.ts]
import { wasm } from 'rolldown-plugin-wasm'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [wasm({
        maxFileSize: 0,
        targetEnv: 'browser',
      })],
    },
  ],
})
```

## 示例项目 {#example-project}

完整示例请参考 [playground/wasm-support](https://github.com/Sunny-117/robuild/tree/main/playground/wasm-support)。

## 下一步 {#next-steps}

- [插件](../advanced/plugins.md) - 了解更多插件使用方式
- [配置选项](../reference/config.md) - 完整配置参考
