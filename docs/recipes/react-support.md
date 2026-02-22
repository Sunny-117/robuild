# React 支持 {#react-support}

`robuild` 为构建 React 组件库提供一流的支持。由于 [Rolldown](https://rolldown.rs/) 原生支持打包 JSX/TSX 文件，您无需任何额外插件即可开始使用。

## 快速开始 {#quick-start}

React 组件库开箱即用，只需确保安装了 React 相关的类型定义：

::: code-group

```sh [pnpm]
pnpm add -D @types/react @types/react-dom
```

```sh [npm]
npm install -D @types/react @types/react-dom
```

```sh [yarn]
yarn add -D @types/react @types/react-dom
```

```sh [bun]
bun add -D @types/react @types/react-dom
```

:::

## 最小配置示例 {#minimal-example}

要为 React 库配置 `robuild`，只需使用标准的 `build.config.ts`：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  dts: true,
})
```

创建你的 React 组件：

```tsx [Button.tsx]
import React from 'react'

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}
```

在入口文件中导出：

```ts [index.ts]
export { Button } from './Button'
export type { ButtonProps } from './Button'
```

## JSX 转换模式 {#jsx-transform}

`robuild` 中有两种转换 JSX/TSX 文件的方式：

- **automatic**（默认）- React 17+ 的新 JSX 转换，无需导入 React
- **classic** - 传统转换，需要 `import React from 'react'`

::: warning
如果需要使用 classic JSX 转换，可以在配置文件中设置 Rolldown 的 [`inputOptions.jsx`](https://rolldown.rs/reference/config-options#jsx) 选项：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  dts: true,
  rolldown: {
    transform: {
      jsx: 'react', // 使用 classic JSX 转换
    },
  },
})
```

:::

## 使用 entries 风格配置 {#entries-style-config}

如果你喜欢使用 unbuild 风格的 entries 配置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.tsx',
      format: ['esm', 'cjs'],
      dts: true,
    }
  ],
  external: ['react', 'react-dom']
})
```

## 外部化 React {#externalizing-react}

构建组件库时，通常需要将 `react` 和 `react-dom` 作为外部依赖：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  dts: true,
  external: ['react', 'react-dom'],
})
```

同时在 `package.json` 中声明对等依赖：

```json [package.json]
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## 启用 React Compiler {#enabling-react-compiler}

React Compiler 是一款创新的构建时工具，可自动优化 React 应用程序。React 建议库作者使用 React Compiler 预编译代码以提高性能。

目前，React Compiler 仅作为 Babel 插件提供。要手动集成：

::: code-group

```sh [pnpm]
pnpm add -D @rollup/plugin-babel babel-plugin-react-compiler
```

```sh [npm]
npm install -D @rollup/plugin-babel babel-plugin-react-compiler
```

```sh [yarn]
yarn add -D @rollup/plugin-babel babel-plugin-react-compiler
```

```sh [bun]
bun add -D @rollup/plugin-babel babel-plugin-react-compiler
```

:::

然后在配置中添加 Babel 插件：

```ts [build.config.ts]
import pluginBabel from '@rollup/plugin-babel'
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  plugins: [
    pluginBabel({
      babelHelpers: 'bundled',
      parserOpts: {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      },
      plugins: ['babel-plugin-react-compiler'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
  dts: true,
  external: ['react', 'react-dom'],
})
```

## 多格式输出 {#multi-format-output}

构建同时支持 ESM 和 CJS 的库：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom'],
})
```

## 示例项目 {#example-project}

完整示例请参考 [playground/react-app](https://github.com/Sunny-117/robuild/tree/main/playground/react-app)。

## 下一步 {#next-steps}

- [插件](../advanced/plugins.md) - 了解更多插件使用方式
- [声明文件 (dts)](../options/dts.md) - DTS 生成配置
- [配置选项](../reference/config.md) - 完整配置参考
