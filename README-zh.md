# 📦 robuild 😯

简体中文 | <a href="./README-zh.md">English</a>

⚡️ 零配置的 ESM/TS 包构建工具。基于 [**oxc**](https://oxc.rs/)、[**rolldown**](https://rolldown.rs/) 和 [**rolldown-plugin-dts**](https://github.com/sxzz/rolldown-plugin-dts) 驱动。

- 👌 专注于 ESM 兼容性。
- 🌱 全新重构，清理代码并移除遗留功能。
- 🚀 使用 [**oxc**](https://oxc.rs/)（转换）和 [**rolldown**](https://rolldown.rs/)（打包），构建速度大幅提升！

## Proof of concept

> [!IMPORTANT]
>
> 功能尚不完善，API 和输出行为可能在 0.x 版本间发生变化。
>
> 欢迎反馈和贡献！如需修改的代码量较大，请先提交 issue 讨论。

## 使用方法

### CLI

```sh
# bundle
npx robuild ./src/index.ts

# transform
npx robuild ./src/runtime/:./dist/runtime
```

可通过 `--dir` 指定工作目录。

若路径以 `/` 结尾，robuild 将使用 [oxc-transform](https://www.npmjs.com/package/oxc-transform) 进行代码转换（而非 [rolldown](https://rolldown.rs/) 打包）。

### API 调用

```js
import { build } from 'robuild'

await build({
  cwd: '.',
  entries: ['./src/index.ts'],
})
```

## 配置

可在 `build.config.mjs`（或 `.ts`）中定义配置，或直接传入 `build()` 函数。

```js
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts'],
      // outDir: "./dist",
      // minify: false,
      // stub: false,
      // rolldown: {}, // 参见 https://rolldown.rs/reference/config-options
      // dts: {}, // 参见 https://github.com/sxzz/rolldown-plugin-dts#options
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      // minify: false,
      // stub: false,
      // oxc: {},
      // resolve: {}
    },
  ],
  hooks: {
    // start: (ctx) => {},
    // end: (ctx) => {},
    // entries: (entries, ctx) => {},
    // rolldownConfig: (config, ctx) => {},
    // rolldownOutput: (output, res, ctx) => {},
  },
})
```

## Stub Mode

在本地开发时，反复执行构建或监听命令可能较为繁琐。

可通过 `stub: true`（条目配置）或 `--stub` CLI 参数启用存根模式。此模式下，robuild 会跳过实际构建，改为将预期输出路径链接至源文件。

- **打包条目**：生成 `.mjs` 和 `.d.mts` 文件直接重新导出源文件。
- **转换条目**：将 src 目录符号链接至 dist 目录。

**注意事项：**

1. 需运行时原生支持 TypeScript（如 Deno、Bun、Vite 或 Node.js¹）
2. **转换模式**：需配置打包工具解析 `.ts` 或 `.mjs` 扩展名。
3. **打包模式**：若新增条目或修改 `default` 导出，需重新执行存根构建。

(1) 对于 Node.js 的解决方案：

- 使用 `node --experimental-strip-types`（需 Node.js [22.6](https://nodejs.org/en/blog/release/v22.6.0) 及以上）
- 使用 [jiti](https://github.com/unjs/jiti)（`node --import jiti/register`）
- 使用 [oxc-node](https://github.com/oxc-project/oxc-node)（`node --import @oxc-node/core/register`）
- 使用 [unloader](https://github.com/sxzz/unloader)（`node --import unloader/register`）

## 相关项目

- [unbuild](https://github.com/unjs/unbuild)：基于 rollup 和 [mkdist](https://github.com/unjs/mkdist) 的稳定方案。
- [tsdown](https://tsdown.dev/)：基于 rolldown 的替代打包工具。

## 许可

💛 基于 [MIT](./LICENSE) 协议。
