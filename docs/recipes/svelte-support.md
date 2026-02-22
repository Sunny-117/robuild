# Svelte 支持 {#svelte-support}

`robuild` 通过集成 [`rollup-plugin-svelte`](https://github.com/sveltejs/rollup-plugin-svelte) 支持构建 Svelte 组件库。这种设置可以编译 `.svelte` 组件并将其与您的 TypeScript 源码一起打包。

## 快速开始 {#quick-start}

### 安装依赖 {#install-dependencies}

::: code-group

```sh [pnpm]
pnpm add -D rollup-plugin-svelte svelte svelte-preprocess
```

```sh [npm]
npm install -D rollup-plugin-svelte svelte svelte-preprocess
```

```sh [yarn]
yarn add -D rollup-plugin-svelte svelte svelte-preprocess
```

```sh [bun]
bun add -D rollup-plugin-svelte svelte svelte-preprocess
```

:::

## 最小配置示例 {#minimal-example}

使用以下 `build.config.ts` 配置 `robuild` 以支持 Svelte 库：

```ts [build.config.ts]
import svelte from 'rollup-plugin-svelte'
import { sveltePreprocess } from 'svelte-preprocess'
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  plugins: [svelte({ preprocess: sveltePreprocess() })],
})
```

创建你的 Svelte 组件：

```svelte [Button.svelte]
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary'
  export let disabled: boolean = false
</script>

<button
  class="btn btn-{variant}"
  {disabled}
  on:click
>
  <slot />
</button>

<style>
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-primary {
    background-color: #ff3e00;
    color: white;
  }

  .btn-secondary {
    background-color: #f0f0f0;
    color: #333;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

在入口文件中导出：

```ts [index.ts]
export { default as Button } from './Button.svelte'
```

## 工作原理 {#how-it-works}

- **`rollup-plugin-svelte`** 编译 `.svelte` 单文件组件。
- **`robuild`** 将编译后的输出与您的 TypeScript 源码一起打包。

::: info
为 Svelte 组件生成 `.d.ts` 通常需要集成 [`svelte2tsx`](https://www.npmjs.com/package/svelte2tsx)。建议使用专门的构建脚本，在打包后使用 `svelte2tsx` 生成声明文件。
:::

## 使用 entries 风格配置 {#entries-style-config}

如果你喜欢使用 unbuild 风格的 entries 配置：

```ts [build.config.ts]
import svelte from 'rollup-plugin-svelte'
import { sveltePreprocess } from 'svelte-preprocess'
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm'],
      platform: 'neutral',
    }
  ],
  plugins: [svelte({ preprocess: sveltePreprocess() })],
  external: ['svelte', 'svelte/internal']
})
```

## 外部化 Svelte {#externalizing-svelte}

构建组件库时，将 `svelte` 及其内部模块作为外部依赖：

```ts [build.config.ts]
import svelte from 'rollup-plugin-svelte'
import { sveltePreprocess } from 'svelte-preprocess'
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  plugins: [svelte({ preprocess: sveltePreprocess() })],
  external: ['svelte', 'svelte/internal'],
})
```

同时在 `package.json` 中声明对等依赖：

```json [package.json]
{
  "peerDependencies": {
    "svelte": "^4.0.0"
  }
}
```

## 分发建议 {#distribution}

根据社区实践和 SvelteKit 的[打包指南](https://svelte.dev/docs/kit/packaging)，**避免发布预编译的 JS 组件**。建议发布 `.svelte` 源码，让使用者的 Svelte 工具链（如 Vite + `@sveltejs/vite-plugin-svelte`）在其应用中编译它们。

### 不预编译为 JS 的原因 {#reasons-not-to-precompile}

- **版本兼容性**：预编译输出绑定到特定的编译器和 `svelte/internal` 版本；版本不匹配可能导致运行时或 SSR/水合问题。
- **SSR/水合一致性**：库和应用之间不同的编译选项（`generate`、`hydratable`、`dev` 等）可能导致水合不匹配。
- **工具和优化**：源码形式可从更好的 HMR、诊断、CSS 处理和 tree-shaking 中受益；预编译的 JS 可能失去这些优势。
- **维护性**：Svelte 升级时无需重新发布，因为使用者使用自己选择的版本编译。

### 适合发布 JS 的情况（例外）{#when-shipping-js-makes-sense}

- 您提供可在 Svelte 外部使用的构件（如 `customElement` Web Components）。
- CDN 直接加载场景，无需消费者构建步骤。

::: tip
robuild 要点：
- 在 `robuild` 中将 `svelte`/`svelte/*` 标记为外部依赖，并在 `peerDependencies` 中声明 `svelte`。
- 使用 `rollup-plugin-svelte` 进行预处理/集成，并保持 `.svelte` 源码形式用于分发。
- 使用 `svelte2tsx` 生成与 `exports` 子路径导出对齐的 `.d.ts`。
:::

## 发布预编译组件 {#precompiled-components}

如果确实需要发布预编译组件（如 Web Components）：

```ts [build.config.ts]
import svelte from 'rollup-plugin-svelte'
import { sveltePreprocess } from 'svelte-preprocess'
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      compilerOptions: {
        customElement: true, // 生成 Web Components
      },
    }),
  ],
  external: ['svelte'],
})
```

## 示例项目 {#example-project}

完整示例请参考 [playground/svelte-app](https://github.com/Sunny-117/robuild/tree/main/playground/svelte-app)。

## 下一步 {#next-steps}

- [插件](../advanced/plugins.md) - 了解更多插件使用方式
- [配置选项](../reference/config.md) - 完整配置参考
