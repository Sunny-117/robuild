# 包导出生成 {#package-exports}

`robuild` 可以自动生成 `package.json` 的 `exports` 字段，简化包发布配置。

## 启用导出生成 {#enable-exports}

### CLI {#cli}

```sh
robuild --generate-exports ./src/index.ts
```

### 配置文件 {#config-file}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  exports: {
    enabled: true,
    autoUpdate: true,
  },
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
    },
  ],
})
```

## 生成结果 {#generated-result}

构建后会在 `package.json` 中生成：

```json [package.json]
{
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

## 配置选项 {#config-options}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  exports: {
    enabled: true,        // 启用导出生成
    autoUpdate: true,     // 自动更新 package.json
    includeTypes: true,   // 包含类型定义
  },
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      generateExports: true,
    },
  ],
})
```

## 自定义导出路径 {#custom-export-path}

使用 `exportPath` 指定导出路径：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  exports: { enabled: true, autoUpdate: true },
  entries: [
    {
      type: 'bundle',
      input: './src/utils/index.ts',
      generateExports: true,
      exportPath: './utils', // 导出为 "package-name/utils"
    },
  ],
})
```

生成：

```json [package.json]
{
  "exports": {
    "./utils": {
      "types": "./dist/utils/index.d.mts",
      "import": "./dist/utils/index.mjs"
    }
  }
}
```

## 多入口导出 {#multiple-exports}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  exports: { enabled: true, autoUpdate: true },
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      generateExports: true,
      exportPath: '.',
    },
    {
      type: 'bundle',
      input: './src/cli.ts',
      generateExports: true,
      exportPath: './cli',
    },
  ],
})
```

:::tip
使用自动导出生成可以确保 `exports` 字段始终与实际构建产物保持同步，减少发布错误。
:::

## 下一步 {#next-steps}

- [配置文件](./config-file.md) - 配置文件详解
- [类型声明](./dts.md) - 类型声明生成
