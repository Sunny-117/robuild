# Stub 模式 {#stub-mode}

Stub 模式是一种特殊的开发模式，它不会真正构建代码，而是生成指向源文件的重导出文件。这样可以实现近乎零延迟的开发体验。

## 启用 Stub 模式 {#enable-stub}

### CLI {#cli}

```sh
robuild --stub ./src/index.ts
```

### 配置文件 {#config-file}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: true,
    },
  ],
})
```

## 工作原理 {#how-it-works}

普通构建会打包所有代码：

```
src/index.ts → [构建] → dist/index.mjs (打包后的代码)
```

Stub 模式只生成重导出：

```ts [dist/index.mjs]
// Stub 生成的文件
export * from '../src/index.ts'
```

这样，修改源文件后无需重新构建，导入方会直接读取最新的源码。

## 生成的文件 {#generated-files}

### JavaScript Stub {#js-stub}

```ts [dist/index.mjs]
export * from '../src/index.ts'
export { default } from '../src/index.ts'
```

### 类型声明 Stub {#dts-stub}

```ts [dist/index.d.mts]
export * from '../src/index.ts'
export { default } from '../src/index.ts'
```

## 使用场景 {#use-cases}

### 本地开发 {#local-development}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: isDev,
      minify: !isDev,
    },
  ],
})
```

### Monorepo 开发 {#monorepo}

在 monorepo 中，Stub 模式特别有用。当一个包依赖另一个本地包时，使用 Stub 模式可以实时看到更改：

```sh
# packages/core
robuild --stub ./src/index.ts

# packages/app (依赖 @my/core)
# 修改 core 后，app 立即可以使用最新代码
```

## 结合 Watch 模式 {#with-watch}

Stub 模式通常不需要 Watch 模式，因为不需要重新构建。但如果需要监听配置变化：

```sh
robuild --stub --watch ./src/index.ts
```

## 限制 {#limitations}

- Stub 文件只能在开发环境使用，发布时需要真正构建
- 需要 Node.js 支持直接运行 TypeScript（如使用 tsx、esno 或 Node.js 的 TypeScript 支持）
- 某些需要打包转换的功能（如环境变量替换）在 Stub 模式下不可用

:::warning
Stub 模式生成的文件不应该发布到 npm。发布前请使用正常构建。
:::

:::tip
Stub 模式是开发阶段的最佳实践，可以显著提升开发效率。建议在 `package.json` 中添加两个脚本：

```json [package.json]
{
  "scripts": {
    "dev": "robuild --stub",
    "build": "robuild"
  }
}
```
:::

## 下一步 {#next-steps}

- [监听模式](../options/watch-mode.md) - 监听模式配置
- [程序化使用](./programmatic-usage.md) - API 调用
