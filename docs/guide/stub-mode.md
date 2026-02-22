# Stub 模式

Stub 模式是 robuild 的开发模式，跳过实际构建，直接创建指向源码的重新导出文件，实现极速开发体验。

## 启用 Stub 模式

### CLI 方式

```bash
robuild --stub ./src/index.ts
```

### 配置文件方式

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: true,
    },
  ],
})
```

## 工作原理

Stub 模式会生成重新导出源码的文件，而不是实际打包：

```typescript
// 源码: src/index.ts
export function greet(name: string) {
  return `Hello, ${name}!`
}
export default greet
```

```javascript
// 生成的 stub: dist/index.mjs
export * from "/absolute/path/to/src/index.ts";
export { default } from "/absolute/path/to/src/index.ts";
```

```typescript
// 生成的类型声明: dist/index.d.mts
export * from "/absolute/path/to/src/index.ts";
export { default } from "/absolute/path/to/src/index.ts";
```

### Shebang 处理

CLI 工具的 shebang 会被保留，文件会设置可执行权限：

```typescript
// 源码: src/cli.ts
#!/usr/bin/env node
export function main() { console.log("Hello") }
```

```javascript
// 生成的 stub: dist/cli.mjs
#!/usr/bin/env node
export * from "/absolute/path/to/src/cli.ts";
```

## 运行 Stub 文件

Stub 文件需要能执行 TypeScript 的运行时：

### Node.js 22.6+

```bash
node --experimental-strip-types dist/index.mjs
```

### 使用 jiti

```bash
node --import jiti/register dist/index.mjs
```

### 使用 Bun/Deno

```bash
bun dist/index.mjs
deno run dist/index.mjs
```

## 开发工作流

```typescript
// build.config.ts
import { defineConfig } from 'robuild'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: isDev,      // 开发时用 stub
      minify: !isDev,   // 生产时压缩
      dts: !isDev,      // 生产时生成类型
    },
  ],
})
```

```json
{
  "scripts": {
    "build": "robuild",
    "dev": "NODE_ENV=development robuild"
  }
}
```

## 下一步

- [TypeScript 支持](./typescript.md) - TypeScript 集成
- [ESM 兼容性](./esm.md) - ESM 模块支持
