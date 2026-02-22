# 声明文件 (dts)

声明文件（`.d.ts`）是 TypeScript 库的重要组成部分，它为您的库的使用者提供类型定义，使其能够享受 TypeScript 的类型检查和智能提示。

`robuild` 让生成和打包声明文件变得简单，确保为您的用户带来无缝的开发体验。

> [!NOTE]
> 您必须在项目中安装 `typescript`，声明文件的生成才能正常工作。

## robuild 中 dts 的工作原理

`robuild` 内部使用 [rolldown-plugin-dts](https://github.com/sxzz/rolldown-plugin-dts) 来生成和打包 `.d.ts` 文件。该插件专为高效处理声明文件生成而设计，并与 `robuild` 无缝集成。

## 启用 dts 生成

### CLI

```bash
robuild --dts ./src/index.ts
```

### 配置文件

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      dts: true,
    },
  ],
})
```

## 仅生成声明文件

如果只需要生成类型声明而不需要 JavaScript 输出：

```bash
robuild --dts-only ./src/index.ts
```

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
  dtsOnly: true,
}
```

## 性能注意事项

`.d.ts` 生成的性能取决于您的 `tsconfig.json` 配置：

### 启用 `isolatedDeclarations`

如果您的 `tsconfig.json` 中启用了 `isolatedDeclarations` 选项，`robuild` 将使用 **oxc-transform** 进行 `.d.ts` 生成。这种方式**极其快速**，强烈推荐以获得最佳性能。

```json [tsconfig.json]
{
  "compilerOptions": {
    "isolatedDeclarations": true
  }
}
```

### 未启用 `isolatedDeclarations`

如果未启用 `isolatedDeclarations`，`robuild` 会回退使用 TypeScript 编译器生成 `.d.ts` 文件。虽然这种方式可靠，但相较于 `oxc-transform` 会慢一些。

> [!TIP]
> 如果速度对您的工作流程至关重要，建议在 `tsconfig.json` 中启用 `isolatedDeclarations`。

## 高级选项

`dts` 选项支持传入对象进行更精细的配置：

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
  dts: {
    // rolldown-plugin-dts 选项
    respectExternal: true,
  },
}
```

详细选项请参阅 [rolldown-plugin-dts 文档](https://github.com/sxzz/rolldown-plugin-dts#options)。
