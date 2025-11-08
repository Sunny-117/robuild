# @oxc-project/runtime 自动内联

## 问题描述

在使用 `skipNodeModules: true` 配置时，如果代码中包含 async/await 等需要转换的语法，rolldown 会自动注入 `@oxc-project/runtime` 的 helper 函数。但是这些 helper 会被错误地标记为外部依赖，导致产物中出现类似这样的导入：

```js
import _asyncToGenerator from "@oxc-project/runtime/helpers/asyncToGenerator";
```

由于 `@oxc-project/runtime` 不是 package.json 中的依赖，这会导致运行时错误。

## 解决方案

robuild 现在会自动检测并内联 `@oxc-project/runtime` 的 helper 函数，确保它们被打包到产物中，而不是作为外部依赖。这与 tsdown 的行为保持一致。

## 示例

### 配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [{
    type: 'bundle',
    input: './src/index.tsx',
    dts: true,
    format: ['esm'],
    target: 'es2015',
    skipNodeModules: true,
    sourcemap: true,
  }],
})
```

### 源代码

```typescript
// src/index.tsx
export async function fetchData() {
  const response = await fetch('https://api.example.com/data')
  return response.json()
}

export const asyncArrow = async () => {
  await Promise.resolve()
  return 'done'
}
```

### 产物（修复前）

```js
// ❌ 错误：外部依赖导入
import _asyncToGenerator from "@oxc-project/runtime/helpers/asyncToGenerator";

export const fetchData = _asyncToGenerator(function* () {
  const response = yield fetch('https://api.example.com/data');
  return response.json();
});
```

### 产物（修复后）

```js
// ✅ 正确：helper 函数被内联
//#region @oxc-project/runtime/helpers/asyncToGenerator.js
var require_asyncToGenerator = /* @__PURE__ */ __commonJS({
  "node_modules/@oxc-project/runtime/src/helpers/asyncToGenerator.js": ((exports, module) => {
    function asyncGeneratorStep(n, t, e, r, o, a, c) {
      // ... helper 实现
    }
    function _asyncToGenerator$1(n) {
      return function() {
        // ... helper 实现
      }
    }
    module.exports = _asyncToGenerator$1;
  })
});
//#endregion

// 使用内联的 helper
var _asyncToGenerator = require_asyncToGenerator();

export const fetchData = _asyncToGenerator(function* () {
  const response = yield fetch('https://api.example.com/data');
  return response.json();
});
```

## 技术细节

robuild 在 `skipNodeModules` 插件中添加了 `noExternal` 配置，默认包含 `@oxc-project/runtime`：

```typescript
if (entry.skipNodeModules) {
  const skipPlugin = createSkipNodeModulesPlugin({
    // 始终内联 @oxc-project/runtime helpers
    noExternal: ['@oxc-project/runtime'],
  })
  // ...
}
```

这确保了即使启用了 `skipNodeModules`，`@oxc-project/runtime` 的代码也会被打包到产物中。

## 相关配置

- `skipNodeModules`: 跳过 node_modules 打包
- `noExternal`: 指定需要内联的依赖
- `target`: 目标 ES 版本（影响是否需要转换）

## 参考

- [tsdown skipNodeModulesBundle](https://tsdown.dev/)
- [rolldown external](https://rolldown.rs/guide/external)
