# TypeScript 支持

robuild 原生支持 TypeScript，无需额外配置即可构建 TypeScript 文件并生成类型声明。

## 快速开始

```bash
# 直接构建 TypeScript 文件
robuild ./src/index.ts
```

## 类型声明生成

### 启用 dts

通过 `dts` 选项启用类型声明文件生成：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      dts: true, // 启用类型声明生成
    },
  ],
})
```

### 输入输出示例

```typescript
// 源码: src/index.ts
export function greet(name: string): string {
  return `Hello, ${name}!`
}

export interface User {
  id: number
  name: string
}
```

```typescript
// 生成的声明文件: dist/index.d.mts
export declare function greet(name: string): string;
export interface User {
  id: number;
  name: string;
}
```

### dts 配置选项

`dts` 选项支持传入 [rolldown-plugin-dts](https://github.com/sxzz/rolldown-plugin-dts) 的配置：

```typescript
{
  type: 'bundle',
  input: './src/index.ts',
  dts: {
    compilerOptions: {
      stripInternal: true, // 移除 @internal 标记的内容
    },
    include: ['src/**/*'],
    exclude: ['src/**/*.test.ts'],
  },
}
```

### 仅生成声明文件

使用 `dtsOnly` 选项只生成类型声明，不输出 JavaScript：

```typescript
{
  type: 'bundle',
  input: './src/index.ts',
  dtsOnly: true,
}
```

## tsconfig.json 集成

robuild 会自动读取项目的 `tsconfig.json` 配置。推荐配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 类型安全的配置

robuild 导出完整的 TypeScript 类型定义，提供 IDE 智能提示：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      // IDE 会提示所有可用选项
      format: ['esm', 'cjs'],
      dts: true,
      minify: true,
    },
  ],
})
```

## 下一步

- [ESM 兼容性](./esm.md) - ESM 模块支持
- [配置](./configuration.md) - 详细配置选项
