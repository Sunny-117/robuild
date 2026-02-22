# 兼容性垫片 {#shims}

`robuild` 提供 CJS/ESM 互操作的兼容性垫片，解决模块格式之间的差异。

## 启用垫片 {#enable-shims}

### CLI {#cli}

```sh
robuild --shims ./src/index.ts
```

### 配置文件 {#config-file}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      shims: true,
    },
  ],
})
```

## 垫片内容 {#shim-contents}

启用 `shims` 后，会自动注入以下兼容代码：

### ESM 输出中的 CJS 变量 {#cjs-vars-in-esm}

在 ESM 输出中提供 `__dirname` 和 `__filename`：

```js
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

### ESM 输出中的 require {#require-in-esm}

在 ESM 输出中提供 `require` 函数：

```js
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
```

## 精细控制 {#fine-grained-control}

使用对象配置精确控制需要哪些垫片：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      shims: {
        dirname: true,   // __dirname 和 __filename
        require: true,   // require() 函数
        exports: true,   // module.exports
        env: false,      // process.env（浏览器）
      },
    },
  ],
})
```

## 使用场景 {#use-cases}

- 将 CJS 库迁移到 ESM
- 在 ESM 中使用依赖 `__dirname` 的库
- 创建同时兼容 CJS 和 ESM 的包

:::warning
垫片会增加输出体积。只在确实需要时启用。
:::

## 下一步 {#next-steps}

- [输出格式](./output-format.md) - 输出格式选项
- [依赖处理](./dependencies.md) - 依赖处理选项
