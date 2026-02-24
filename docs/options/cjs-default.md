# CJS 默认导出 {#cjs-default}

`cjsDefault` 选项用于改善生成 CommonJS (CJS) 模块时的兼容性。该选项**默认启用**。

## 工作原理 {#how-it-works}

当你的模块**只有一个默认导出**且输出格式为 CJS 时，`robuild` 会自动转换：

**JavaScript 输出：**

- `export default ...` 转换为 `module.exports = ...`

**TypeScript 声明文件 (.d.cts)：**

- `export default ...` 转换为 `export = ...`

这确保使用 CommonJS require 语法的消费者（`require('your-module')`）能直接获取默认导出，提高与旧版工具和环境的互操作性。

## 启用/禁用 {#enable-disable}

### CLI {#cli}

```sh
# 自动模式（默认）
robuild ./src/index.ts --cjs-default auto

# 强制启用
robuild ./src/index.ts --cjs-default true

# 禁用转换
robuild ./src/index.ts --cjs-default false
```

### 配置文件 {#config-file}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      cjsDefault: true, // 默认值，可省略
    },
  ],
})
```

## 示例 {#example}

**源代码：**

```ts
// src/index.ts
export default function greet(name: string = 'World') {
  return `Hello, ${name}!`
}
```

**生成的 CJS 输出 (dist/index.cjs)：**

```js
function greet(name = "World") {
  return `Hello, ${name}!`;
}
module.exports = greet;
```

**生成的 ESM 输出 (dist/index.mjs)：**

```js
function greet(name = "World") {
  return `Hello, ${name}!`;
}
export { greet as default };
```

**生成的 ESM 类型声明 (dist/index.d.mts)：**

```ts
declare function greet(name?: string): string;
export { greet as default };
```

**生成的 CJS 类型声明 (dist/index.d.cts)：**

```ts
declare function greet(name?: string): string;
export = greet;
```

## 消费者使用方式 {#consumer-usage}

启用 `cjsDefault` 后，消费者可以更简洁地使用你的模块：

**ESM 消费者：**

```ts
import greet from 'your-module'
greet('World') // Hello, World!
```

**CJS 消费者：**

```js
const greet = require('your-module')
greet('World') // Hello, World!
```

两种方式都能直接获得 `greet` 函数，无需 `.default` 属性。

## package.json 配置 {#package-json}

为了完整支持 ESM 和 CJS 消费者，建议配置 `exports` 字段：

```json
{
  "name": "your-module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

## 使用场景 {#use-cases}

- 创建同时兼容 ESM 和 CJS 的库
- 提高与旧版 Node.js 工具的兼容性
- 简化消费者的导入语法

## 注意事项 {#notes}

:::tip
`cjsDefault` 主要影响只有默认导出的模块。如果你的模块同时有命名导出和默认导出，输出行为可能会有所不同。
:::

:::warning
在某些情况下，混合使用默认导出和命名导出可能会产生 `MIXED_EXPORT` 警告。启用 `cjsDefault` 可以帮助避免这类警告。
:::

## 下一步 {#next-steps}

- [输出格式](./output-format.md) - 了解不同的输出格式选项
- [兼容性垫片](./shims.md) - CJS/ESM 互操作垫片
- [类型声明](./dts.md) - 类型声明生成选项
