# Rolldown 选项

`robuild` 允许直接传递 Rolldown 原生配置选项，实现更精细的控制。

## 使用方法

通过 `rolldown` 字段传递 Rolldown 配置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      rolldown: {
        treeshake: false,
        logLevel: 'debug',
      },
    },
  ],
})
```

## 输入选项

支持的 Rolldown 输入选项：

```ts [build.config.ts]
{
  rolldown: {
    // 模块解析
    resolve: {
      alias: { '@': './src' },
      extensions: ['.ts', '.js'],
    },

    // Tree Shaking
    treeshake: {
      moduleSideEffects: false,
    },

    // 日志
    logLevel: 'warn',

    // 额外插件
    plugins: [customPlugin()],
  },
}
```

## 输出选项

通过 `rolldown.output` 传递输出选项：

```ts [build.config.ts]
{
  rolldown: {
    output: {
      // 代码生成选项
      generatedCode: {
        arrowFunctions: true,
        constBindings: true,
      },

      // 入口文件名
      entryFileNames: '[name].[hash].js',

      // Chunk 文件名
      chunkFileNames: 'chunks/[name].[hash].js',
    },
  },
}
```

## 优先级

`rolldown` 选项具有最高优先级，会覆盖 robuild 的其他设置：

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
  treeshake: true,           // robuild 选项
  rolldown: {
    treeshake: false,        // 会覆盖上面的设置
  },
}
```

## 完整示例

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm'],
      rolldown: {
        treeshake: {
          moduleSideEffects: 'no-external',
        },
        output: {
          generatedCode: {
            arrowFunctions: true,
          },
        },
        plugins: [
          // 额外的 Rolldown 插件
        ],
      },
    },
  ],
})
```

> [!WARNING]
> 直接修改 Rolldown 配置可能与 robuild 的内置功能冲突。请谨慎使用，并测试构建结果。

详细选项请参阅 [Rolldown 配置文档](https://rolldown.rs/reference/config-options)。
