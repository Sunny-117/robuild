# Hooks 钩子

`robuild` 提供构建生命周期钩子，允许在构建过程的不同阶段执行自定义逻辑。

## 可用钩子

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
  hooks: {
    start: (ctx) => {
      console.log('构建开始:', ctx.pkg.name)
    },
    entries: (entries, ctx) => {
      console.log('处理入口:', entries.length)
    },
    rolldownConfig: (config, ctx) => {
      console.log('Rolldown 配置:', config)
    },
    rolldownOutput: (output, result, ctx) => {
      console.log('输出配置:', output)
    },
    end: (ctx) => {
      console.log('构建完成')
    },
  },
})
```

## 钩子说明

### `start`

构建开始时触发。

```ts
start?: (ctx: BuildContext) => void | Promise<void>
```

### `entries`

入口解析完成后触发，可以修改入口配置。

```ts
entries?: (entries: BuildEntry[], ctx: BuildContext) => void | Promise<void>
```

### `rolldownConfig`

Rolldown 配置生成后触发，可以修改配置。

```ts
rolldownConfig?: (config: InputOptions, ctx: BuildContext) => void | Promise<void>
```

### `rolldownOutput`

输出配置生成后触发。

```ts
rolldownOutput?: (config: OutputOptions, result: RolldownBuild, ctx: BuildContext) => void | Promise<void>
```

### `end`

构建完成后触发。

```ts
end?: (ctx: BuildContext) => void | Promise<void>
```

## BuildContext

钩子函数接收的上下文对象：

```ts
interface BuildContext {
  pkgDir: string                              // 包目录
  pkg: { name: string } & Record<string, any> // package.json 内容
}
```

## 使用示例

### 构建耗时统计

```ts [build.config.ts]
let startTime: number

export default defineConfig({
  hooks: {
    start: () => {
      startTime = Date.now()
    },
    end: () => {
      console.log(`构建耗时: ${Date.now() - startTime}ms`)
    },
  },
})
```

### 修改 Rolldown 配置

```ts [build.config.ts]
export default defineConfig({
  hooks: {
    rolldownConfig: (config) => {
      config.treeshake = false
    },
  },
})
```

> [!TIP]
> 钩子适用于简单的构建过程扩展。对于复杂的代码转换需求，推荐使用插件。
