# Solid 支持 {#solid-support}

`robuild` 通过集成 [`rolldown-plugin-solid`](https://github.com/g-mero/rolldown-plugin-solid) 或 [`unplugin-solid`](https://github.com/unplugin/unplugin-solid) 来简化 Solid 组件库的开发。这种集成允许您打包 Solid 组件并使用现代 TypeScript 工具自动生成类型声明。

## 快速开始 {#quick-start}

### 安装依赖 {#install-dependencies}

::: code-group

```sh [pnpm]
pnpm add -D rolldown-plugin-solid
```

```sh [npm]
npm install -D rolldown-plugin-solid
```

```sh [yarn]
yarn add -D rolldown-plugin-solid
```

```sh [bun]
bun add -D rolldown-plugin-solid
```

:::

或者，如果您更喜欢使用 `unplugin-solid`：

::: code-group

```sh [pnpm]
pnpm add -D unplugin-solid
```

```sh [npm]
npm install -D unplugin-solid
```

```sh [yarn]
yarn add -D unplugin-solid
```

```sh [bun]
bun add -D unplugin-solid
```

:::

## 最小配置示例 {#minimal-example}

要为 Solid 库配置 `robuild`，请在 `build.config.ts` 中使用以下设置：

```ts [build.config.ts]
import solid from 'rolldown-plugin-solid' // 或使用 'unplugin-solid/rolldown'
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  dts: true,
  plugins: [solid()],
})
```

创建你的 Solid 组件：

```tsx [Button.tsx]
import type { Component, JSX } from 'solid-js'

interface ButtonProps {
  children: JSX.Element
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      class={`btn btn-${props.variant || 'primary'}`}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
```

在入口文件中导出：

```ts [index.ts]
export { Button } from './Button'
```

## 使用 entries 风格配置 {#entries-style-config}

如果你喜欢使用 unbuild 风格的 entries 配置：

```ts [build.config.ts]
import solid from 'rolldown-plugin-solid'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm'],
      platform: 'neutral',
      dts: true,
    }
  ],
  plugins: [solid()],
  external: ['solid-js']
})
```

## 外部化 Solid {#externalizing-solid}

构建组件库时，通常需要将 `solid-js` 作为外部依赖：

```ts [build.config.ts]
import solid from 'rolldown-plugin-solid'
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  plugins: [solid()],
  dts: true,
  external: ['solid-js'],
})
```

同时在 `package.json` 中声明对等依赖：

```json [package.json]
{
  "peerDependencies": {
    "solid-js": "^1.7.0"
  }
}
```

## 使用 unplugin-solid {#using-unplugin-solid}

如果您更喜欢使用 `unplugin-solid`，配置方式类似：

```ts [build.config.ts]
import solid from 'unplugin-solid/rolldown'
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  dts: true,
  plugins: [solid()],
  external: ['solid-js'],
})
```

## 服务端渲染 (SSR) {#ssr-support}

Solid 的 SSR 支持需要特殊配置。您可以使用 `solid-js/web` 的服务端模块：

```ts [build.config.ts]
import solid from 'rolldown-plugin-solid'
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  plugins: [
    solid({
      solid: {
        generate: 'ssr', // 生成 SSR 兼容代码
        hydratable: true, // 启用客户端水合
      },
    }),
  ],
  dts: true,
  external: ['solid-js', 'solid-js/web'],
})
```

## 示例项目 {#example-project}

完整示例请参考 [playground/solid-app](https://github.com/Sunny-117/robuild/tree/main/playground/solid-app)。

## 下一步 {#next-steps}

- [插件](../advanced/plugins.md) - 了解更多插件使用方式
- [声明文件 (dts)](../options/dts.md) - DTS 生成配置
- [配置选项](../reference/config.md) - 完整配置参考
