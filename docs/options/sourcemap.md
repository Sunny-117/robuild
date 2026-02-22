# 源码映射 {#sourcemap}

源码映射（Source Maps）用于调试，将打包后的代码映射回原始源码。

## CLI 用法 {#cli-usage}

```sh
robuild --sourcemap ./src/index.ts
```

## 配置文件用法 {#config-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      sourcemap: true,
    },
  ],
})
```

## 可用值 {#available-values}

### `true` {#true}

生成独立的 `.map` 文件：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      sourcemap: true,
    },
  ],
})
```

输出：

```
dist/
├── index.mjs
└── index.mjs.map
```

### `'inline'` {#inline}

将源码映射内嵌到输出文件中：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      sourcemap: 'inline',
    },
  ],
})
```

### `'hidden'` {#hidden}

生成 `.map` 文件但不添加 sourceMappingURL 注释：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      sourcemap: 'hidden',
    },
  ],
})
```

适用于生产环境上传到错误监控服务，但不暴露给最终用户。

## 使用建议 {#recommendations}

| 环境 | 推荐设置 |
|-----|---------|
| 开发 | `true` 或 `'inline'` |
| 生产（公开） | `false` |
| 生产（错误监控） | `'hidden'` |

:::tip
源码映射会增加构建时间和输出体积。在生产环境中，除非需要调试，否则建议禁用。
:::

## 下一步 {#next-steps}

- [代码压缩](./minification.md) - 压缩配置
- [日志级别](./log-level.md) - 日志配置
