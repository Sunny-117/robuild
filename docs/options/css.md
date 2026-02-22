# CSS 处理

`robuild` 提供了 CSS 处理能力，支持 CSS 打包、代码分割以及通过 LightningCSS 进行现代化 CSS 转换。

## 基本用法

在代码中直接导入 CSS 文件，`robuild` 会自动处理：

```ts
// src/index.ts
import './styles.css'

export const app = 'hello'
```

```css
/* src/styles.css */
.container {
  display: flex;
  gap: 1rem;
}
```

构建后，CSS 会被提取到单独的文件中。

## 选项

### 禁用 CSS 代码分割

默认情况下，CSS 可能会根据入口文件被拆分为多个文件。如果您希望禁用 CSS 代码分割并生成单一 CSS 文件，可以在配置中将 `css.splitting` 设置为 `false`：

```ts
export default defineConfig({
  css: {
    splitting: false,
  },
})
```

### 设置输出 CSS 文件名

您可以通过 `css.fileName` 选项自定义合并后 CSS 文件的名称：

```ts
export default defineConfig({
  css: {
    splitting: false,
    fileName: 'my-library.css',
  },
})
```

这样会在输出目录下生成名为 `my-library.css` 的合并 CSS 文件。

### 启用 LightningCSS

[LightningCSS](https://lightningcss.dev/) 是一个用 Rust 编写的高性能 CSS 解析器、转换器和压缩器。启用后可获得：

- 自动添加浏览器前缀
- 现代 CSS 语法降级
- CSS 压缩

首先安装依赖：

::: code-group

```sh [pnpm]
pnpm add -D unplugin-lightningcss lightningcss
```

```sh [npm]
npm install -D unplugin-lightningcss lightningcss
```

```sh [yarn]
yarn add -D unplugin-lightningcss lightningcss
```

:::

然后在配置中启用：

```ts
export default defineConfig({
  target: 'es2017', // 影响 CSS 浏览器前缀
  css: {
    lightningcss: true,
  },
})
```

## 配置参考

| 选项           | 类型      | 默认值        | 说明                                                   |
| -------------- | --------- | ------------- | ------------------------------------------------------ |
| `splitting`    | `boolean` | `true`        | 启用/禁用 CSS 代码分割。禁用时所有 CSS 合并为单个文件  |
| `fileName`     | `string`  | `'style.css'` | 禁用分割时，合并后的 CSS 文件名                        |
| `lightningcss` | `boolean` | `false`       | 启用 LightningCSS 进行 CSS 转换、压缩和添加浏览器前缀  |

## 完整示例

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      splitting: true, // 启用 JS 代码分割
    },
  ],
  css: {
    splitting: false,    // 禁用 CSS 代码分割，合并为单个文件
    fileName: 'style.css',
    lightningcss: true,  // 启用 LightningCSS
  },
})
```

## TypeScript 支持

为了获得 CSS 导入的类型支持，创建类型声明文件：

```ts [src/types/css.d.ts]
declare module '*.css' {
  const content: string
  export default content
}
```

## 示例项目

完整示例请参考 [playground/css-processing](https://github.com/Sunny-117/robuild/tree/main/playground/css-processing)。
