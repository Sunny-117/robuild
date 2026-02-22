# 快速上手

:::warning 🚧 测试版软件
[Rolldown](https://rolldown.rs) 当前处于测试阶段。虽然它已经可以满足大多数生产环境的使用需求，但仍可能存在一些 bug 或不完善之处。
:::

## 安装 {#installation}

有多种方式可以开始使用 `robuild`：

- [手动安装](#manual-installation)：将其作为开发依赖添加到您的项目中
- 直接通过 [npx 运行](#npx)：无需安装即可体验

### 手动安装 {#manual-installation}

使用您喜欢的包管理器将 `robuild` 安装为开发依赖：

::: code-group

```sh [npm]
npm install -D robuild
```

```sh [pnpm]
pnpm add -D robuild
```

```sh [yarn]
yarn add -D robuild
```

```sh [bun]
bun add -D robuild
```

:::

可选地，如果您未启用 [`isolatedDeclarations`](https://www.typescriptlang.org/tsconfig/#isolatedDeclarations)，还应将 TypeScript 作为开发依赖进行安装：

::: code-group

```sh [npm]
npm install -D typescript
```

```sh [pnpm]
pnpm add -D typescript
```

```sh [yarn]
yarn add -D typescript
```

```sh [bun]
bun add -D typescript
```

:::

:::tip 兼容性说明
`robuild` 需要 Node.js 18 或更高版本。请确保您的开发环境满足此要求后再进行安装。
:::

### 使用 npx {#npx}

如果您只想快速试用，可以直接使用 npx 运行：

```sh
npx robuild ./src/index.ts
```

## 使用 CLI {#using-cli}

要验证 `robuild` 是否正确安装，请在项目目录中运行以下命令：

```sh
./node_modules/.bin/robuild --version
```

您还可以通过以下命令查看可用的 CLI 选项和示例：

```sh
./node_modules/.bin/robuild --help
```

### 创建您的第一个打包 {#first-bundle}

首先，创建两个源 TypeScript 文件：

```ts [src/index.ts]
import { hello } from './hello'

hello()
```

```ts [src/hello.ts]
export function hello(): void {
  console.log('Hello robuild!')
}
```

接下来，初始化 `robuild` 配置文件：

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

现在，运行以下命令来打包您的代码：

```sh
./node_modules/.bin/robuild
```

您应该会看到打包后的输出文件写入到 `dist/index.mjs`。为了验证它是否正常工作，运行输出文件：

```sh
node dist/index.mjs
```

您应该会在控制台中看到消息 `Hello robuild!`。

### 在 npm 脚本中使用 CLI {#npm-scripts}

为了简化命令，您可以将其添加到 `package.json` 的脚本中：

```json [package.json]
{
  "name": "my-robuild-project",
  "type": "module",
  "main": "./dist/index.mjs",
  "scripts": {
    "build": "robuild"
  },
  "devDependencies": {
    "robuild": "^0.1.0"
  }
}
```

现在，您可以通过以下命令构建项目：

```sh
npm run build
```

## 使用配置文件 {#config-file}

虽然可以直接使用 CLI，但对于更复杂的项目，推荐使用配置文件。这可以让您以集中且可复用的方式定义和管理构建设置。

robuild 支持以下配置文件：

- `build.config.ts` (推荐)
- `build.config.mjs`
- `build.config.js`

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

有关更多详细信息，请参阅 [配置](./configuration.md) 文档。

## 使用插件 {#plugins}

`robuild` 支持通过插件扩展其功能。您可以无缝使用 Rolldown 插件、Unplugin 插件以及大多数 Rollup 插件。要使用插件，请将它们添加到配置文件的 `plugins` 数组中。例如：

```ts [build.config.ts]
import SomePlugin from 'some-plugin'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [SomePlugin()],
    },
  ],
})
```

有关更多详细信息，请参阅 [插件](./plugins.md) 文档。

## 使用监听模式 {#watch-mode}

您可以启用监听模式，在文件更改时自动重新构建项目。这在开发过程中非常有用，可以简化您的工作流程。使用 `--watch`（或 `-w`）选项：

```sh
robuild --watch
```

有关更多详细信息，请参阅 [监听模式](./watch-mode.md) 文档。

## 下一步 {#next-steps}

- [CLI 命令行](./cli.md) - 完整的命令行选项
- [配置](./configuration.md) - 配置文件详解
- [构建模式](./build-modes.md) - Bundle 与 Transform 模式
