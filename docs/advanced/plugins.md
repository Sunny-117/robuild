# 插件

`robuild` 以 [Rolldown](https://rolldown.rs) 作为核心引擎，支持丰富的插件生态。

## 支持的插件生态

### Rolldown 插件

由于 `robuild` 基于 Rolldown 构建，因此支持所有 Rolldown 插件：

```ts [build.config.ts]
import SomeRolldownPlugin from 'some-rolldown-plugin'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [SomeRolldownPlugin()],
    },
  ],
})
```

### Unplugin

[Unplugin](https://unplugin.unjs.io/) 是一个现代化的插件框架，支持多种打包器。大多数 Unplugin 插件都可以与 `robuild` 配合使用：

```ts [build.config.ts]
import UnpluginIcons from 'unplugin-icons/rollup'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [UnpluginIcons()],
    },
  ],
})
```

### Rollup 插件

Rolldown 与 Rollup 的插件 API 高度兼容，大多数 Rollup 插件可以直接使用：

```ts [build.config.ts]
import json from '@rollup/plugin-json'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [json()],
    },
  ],
})
```

> [!NOTE]
> 由于 Rollup 和 Rolldown 的 API 并非 100% 兼容，某些插件可能有类型错误。可以使用 `as any` 忽略：
> ```ts
> plugins: [SomeRollupPlugin() as any]
> ```

## 全局插件 vs 入口插件

### 全局插件

在顶层配置，对所有入口生效：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  plugins: [globalPlugin()],
  entries: [
    { type: 'bundle', input: './src/index.ts' },
    { type: 'bundle', input: './src/cli.ts' },
  ],
})
```

### 入口插件

在入口配置，只对该入口生效：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [entrySpecificPlugin()],
    },
  ],
})
```

## 编写自定义插件

可以使用 Rolldown 的插件 API 编写自定义插件：

```ts [build.config.ts]
const myPlugin = () => ({
  name: 'my-plugin',
  transform(code, id) {
    if (id.endsWith('.ts')) {
      return code.replace('__VERSION__', '"1.0.0"')
    }
  },
})

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [myPlugin()],
    },
  ],
})
```

详细信息请参阅 [Rolldown 插件开发指南](https://rolldown.rs/guide/plugin-development)。
