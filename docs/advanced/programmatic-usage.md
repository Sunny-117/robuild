# 程序化使用

除了 CLI，`robuild` 还提供程序化 API，可以在 Node.js 脚本中调用。

## 基本用法

```ts [scripts/build.ts]
import { build } from 'robuild'

await build({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

## API

### `build(config)`

执行构建：

```ts
import { build } from 'robuild'

await build({
  cwd: '.',
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
  hooks: {
    start: (ctx) => console.log('开始构建:', ctx.pkg.name),
    end: (ctx) => console.log('构建完成'),
  },
})
```

### `defineConfig(config)`

配置辅助函数，提供类型提示：

```ts
import { defineConfig } from 'robuild'

const config = defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
})
```

## 完整示例

### 条件构建

```ts [scripts/build.ts]
import { build } from 'robuild'

const isDev = process.env.NODE_ENV === 'development'

await build({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      minify: !isDev,
      sourcemap: isDev,
      dts: !isDev,
    },
  ],
})
```

### 多包构建

```ts [scripts/build.ts]
import { build } from 'robuild'

const packages = ['core', 'utils', 'cli']

for (const pkg of packages) {
  await build({
    cwd: `./packages/${pkg}`,
    entries: [
      {
        type: 'bundle',
        input: './src/index.ts',
        format: ['esm', 'cjs'],
        dts: true,
      },
    ],
  })
}
```

### 与其他工具集成

```ts [scripts/build.ts]
import { build } from 'robuild'
import { execSync } from 'node:child_process'

// 构建
await build({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
})

// 构建后运行测试
execSync('pnpm test', { stdio: 'inherit' })
```

## 类型导出

```ts
import type {
  BuildConfig,
  BuildEntry,
  BundleEntry,
  TransformEntry,
  ExportsConfig,
  RobuildPlugin,
} from 'robuild'
```

> [!TIP]
> 程序化 API 适合复杂的构建场景，如 monorepo 批量构建、条件构建、与 CI/CD 集成等。
