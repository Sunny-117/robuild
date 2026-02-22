# 目标版本 {#target}

`target` 选项指定输出代码的 ECMAScript 目标版本。

## 默认值 {#default}

默认目标版本为 `es2022`。

## CLI 用法 {#cli-usage}

```sh
robuild --target es2020 ./src/index.ts
robuild --target esnext ./src/index.ts
```

## 配置文件用法 {#config-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      target: 'es2020',
    },
  ],
})
```

## 可用值 {#available-values}

- `es2015` (ES6)
- `es2016`
- `es2017`
- `es2018`
- `es2019`
- `es2020`
- `es2021`
- `es2022` (默认)
- `esnext`

## 选择建议 {#recommendations}

| 目标环境 | 推荐值 |
|---------|-------|
| 现代浏览器 | `es2020` 或 `es2022` |
| Node.js 18+ | `es2022` |
| Node.js 16+ | `es2020` |
| 旧版浏览器 | `es2015` |
| 最新特性 | `esnext` |

:::tip
选择较新的目标版本可以生成更小、更高效的代码，但需要确保运行环境支持。
:::

## 与 platform 配合 {#with-platform}

`target` 通常与 `platform` 选项配合使用：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      platform: 'node',
      target: 'es2022',
    },
  ],
})
```

## 下一步 {#next-steps}

- [目标平台](./platform.md) - 平台配置
- [代码压缩](./minification.md) - 压缩配置
