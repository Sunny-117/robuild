# Tree Shaking {#tree-shaking}

Tree Shaking 是一种消除未使用代码的优化技术。`robuild` 默认启用 Tree Shaking。

## 默认行为 {#default-behavior}

Tree Shaking 默认启用，会自动移除未使用的导出。

## CLI 用法 {#cli-usage}

```sh
# 启用（默认）
robuild --treeshake ./src/index.ts

# 禁用
robuild --no-treeshake ./src/index.ts
```

## 配置文件用法 {#config-usage}

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

## 副作用处理 {#side-effects}

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

## 高级配置 {#advanced-config}

传入对象进行更精细的控制：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      treeshake: {
        moduleSideEffects: false,
      },
    },
  ],
})
```

:::warning
Tree Shaking 基于 ES 模块的静态结构分析。使用动态导入或 CommonJS 的 `require()` 可能会影响效果。
:::

## 仅 DCE 模式 {#dce-only}

如果只想进行死代码消除（DCE）而不进行完整的 Tree Shaking：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: 'dce-only',
    },
  ],
})
```

## 下一步 {#next-steps}

- [代码压缩](./minification.md) - 压缩配置
- [依赖处理](./dependencies.md) - 依赖处理选项
