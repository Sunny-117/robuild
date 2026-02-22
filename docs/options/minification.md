# 代码压缩

`robuild` 使用 Rolldown 内置的压缩功能，基于 Oxc 实现极速压缩。

## CLI 用法

```bash
robuild --minify ./src/index.ts
```

## 配置文件用法

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: true,
    },
  ],
})
```

## 可用值

### `true`

启用完整压缩（包括标识符混淆、空白移除、语句简化等）：

```ts
{
  minify: true,
}
```

### `false`

禁用压缩（默认）：

```ts
{
  minify: false,
}
```

### `'dce-only'`

仅进行死代码消除，不进行其他压缩：

```ts
{
  minify: 'dce-only',
}
```

适用于需要保持代码可读性但想移除未使用代码的场景。

## Transform 模式

Transform 模式同样支持压缩，使用 `oxc-minify`：

```ts [build.config.ts]
{
  type: 'transform',
  input: './src/runtime',
  outDir: './dist/runtime',
  minify: true,
}
```

## 性能

`robuild` 的压缩基于 Oxc，速度比 Terser 快约 50 倍。

> [!TIP]
> 建议只在生产构建时启用压缩。开发时禁用压缩可以加快构建速度并便于调试。
