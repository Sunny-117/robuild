# 源码映射

源码映射（Source Maps）用于调试，将打包后的代码映射回原始源码。

## CLI 用法

```bash
robuild --sourcemap ./src/index.ts
```

## 配置文件用法

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

## 可用值

### `true`

生成独立的 `.map` 文件：

```ts
{
  sourcemap: true,
}
```

输出：
```
dist/
├── index.mjs
└── index.mjs.map
```

### `'inline'`

将源码映射内嵌到输出文件中：

```ts
{
  sourcemap: 'inline',
}
```

### `'hidden'`

生成 `.map` 文件但不添加 sourceMappingURL 注释：

```ts
{
  sourcemap: 'hidden',
}
```

适用于生产环境上传到错误监控服务，但不暴露给最终用户。

## 使用建议

| 环境 | 推荐设置 |
|-----|---------|
| 开发 | `true` 或 `'inline'` |
| 生产（公开） | `false` |
| 生产（错误监控） | `'hidden'` |

> [!TIP]
> 源码映射会增加构建时间和输出体积。在生产环境中，除非需要调试，否则建议禁用。
