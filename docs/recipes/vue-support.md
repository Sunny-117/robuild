# Vue 支持 {#vue-support}

`robuild` 通过 [`unplugin-vue`](https://github.com/unplugin/unplugin-vue) 和 [`rolldown-plugin-dts`](https://github.com/sxzz/rolldown-plugin-dts) 的无缝集成，为构建 Vue 组件库提供一流的支持。这种设置使您能够打包 Vue 组件并使用现代 TypeScript 工具生成类型声明。

## 快速开始 {#quick-start}

### 安装依赖 {#install-dependencies}

::: code-group

```sh [pnpm]
pnpm add -D unplugin-vue vue-tsc
```

```sh [npm]
npm install -D unplugin-vue vue-tsc
```

```sh [yarn]
yarn add -D unplugin-vue vue-tsc
```

```sh [bun]
bun add -D unplugin-vue vue-tsc
```

:::

## 最小配置示例 {#minimal-example}

要为 Vue 库配置 `robuild`，请在 `build.config.ts` 中使用以下设置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  plugins: [Vue({ isProduction: true })],
  dts: { vue: true },
})
```

创建你的 Vue 组件：

```vue [MyButton.vue]
<template>
  <button
    :class="['btn', `btn-${variant}`]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007acc;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}
</style>
```

在入口文件中导出：

```ts [index.ts]
export { default as MyButton } from './components/MyButton.vue'
```

## 工作原理 {#how-it-works}

- **`unplugin-vue`** 将 `.vue` 单文件组件编译为 JavaScript 并提取 CSS，使其可用于打包。
- **`rolldown-plugin-dts`**（启用 `vue: true`）和 **`vue-tsc`** 协同工作，为 Vue 组件生成准确的 TypeScript 声明文件，确保库的使用者获得完整的类型支持。

::: tip
设置 `platform: 'neutral'` 可以最大化兼容性，适用于可能在浏览器和 Node.js 环境中使用的库。
:::

## 使用 entries 风格配置 {#entries-style-config}

如果你喜欢使用 unbuild 风格的 entries 配置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm'],
      platform: 'neutral',
      dts: { vue: true },
    }
  ],
  plugins: [Vue({ isProduction: true })],
  external: ['vue']
})
```

## 外部化 Vue {#externalizing-vue}

构建组件库时，通常需要将 `vue` 作为外部依赖：

```ts [build.config.ts]
import { defineConfig } from 'robuild'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  plugins: [Vue({ isProduction: true })],
  dts: { vue: true },
  external: ['vue'],
})
```

同时在 `package.json` 中声明对等依赖：

```json [package.json]
{
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}
```

## CSS 处理 {#css-handling}

`unplugin-vue` 会自动提取 `.vue` 文件中的 `<style>` 块。默认情况下，CSS 会输出到与 JavaScript 同名的 `.css` 文件中。

如果你需要更多 CSS 处理选项，可以结合其他插件：

```ts [build.config.ts]
import { defineConfig } from 'robuild'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  plugins: [
    Vue({
      isProduction: true,
      style: {
        // 自定义 CSS 处理选项
      }
    })
  ],
  dts: { vue: true },
})
```

## 示例项目 {#example-project}

完整示例请参考 [playground/vue-app](https://github.com/Sunny-117/robuild/tree/main/playground/vue-app)。

## 下一步 {#next-steps}

- [插件](../advanced/plugins.md) - 了解更多插件使用方式
- [声明文件 (dts)](../options/dts.md) - DTS 生成配置
- [配置选项](../reference/config.md) - 完整配置参考
