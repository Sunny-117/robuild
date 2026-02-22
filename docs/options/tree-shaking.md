# Tree Shaking

Tree Shaking 是一种消除未使用代码的优化技术。`robuild` 默认启用 Tree Shaking。

## 默认行为

Tree Shaking 默认启用，会自动移除未使用的导出。

## CLI 用法

```bash
# 启用（默认）
robuild --treeshake ./src/index.ts

# 禁用
robuild --no-treeshake ./src/index.ts
```

## 配置文件用法

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      treeshake: true, // 默认值
    },
  ],
})
```

## 副作用处理

某些代码可能有副作用（如修改全局变量），需要保留。您可以在 `package.json` 中声明：

```json [package.json]
{
  "sideEffects": false
}
```

或指定有副作用的文件：

```json [package.json]
{
  "sideEffects": [
    "*.css",
    "./src/polyfills.ts"
  ]
}
```

## 高级配置

传入对象进行更精细的控制：

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
  treeshake: {
    moduleSideEffects: false,
  },
}
```

> [!NOTE]
> Tree Shaking 基于 ES 模块的静态结构分析。使用动态导入或 CommonJS 的 `require()` 可能会影响效果。

## 仅 DCE 模式

如果只想进行死代码消除（DCE）而不进行完整的 Tree Shaking：

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
  minify: 'dce-only',
}
```
