# Stub 模式

Stub 模式是 robuild 的一个强大功能，它允许你在开发时跳过实际的构建过程，直接链接到源码文件，从而显著提升开发体验。

## 什么是 Stub 模式？

Stub 模式是一种开发模式，它不会执行实际的构建过程，而是创建指向源码文件的链接或重新导出文件。这样可以：

- **极速开发**: 跳过构建时间，立即生效
- **热重载支持**: 支持实时更新
- **调试友好**: 直接调试源码文件
- **减少资源消耗**: 避免重复构建

## 启用 Stub 模式

### CLI 方式

```bash
# 使用 --stub 标志
robuild --stub ./src/index.ts

# 多个入口
robuild --stub ./src/index.ts ./src/cli.ts

# 混合模式
robuild --stub ./src/index.ts ./src/runtime/:./dist/runtime
```

### 配置文件方式

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: true, // 启用 stub 模式
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      stub: true, // 启用 stub 模式
    },
  ],
})
```

### 程序化 API

```typescript
import { build } from 'robuild'

await build({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: true,
    },
  ],
})
```

## Stub 模式的工作原理

### Bundle 模式下的 Stub

在 Bundle 模式下，stub 模式会：

1. **创建重新导出文件**: 生成 `.mjs` 文件，重新导出源码
2. **生成类型声明**: 创建 `.d.mts` 文件，重新导出类型
3. **保持 shebang**: 如果源码有 shebang，会保留并设置可执行权限

```typescript
// 源码: src/index.ts
#!/usr/bin/env node
export function greet(name: string) {
  return `Hello, ${name}!`
}

export default greet
```

```javascript
// 生成的 stub: dist/index.mjs
#!/usr/bin/env node
export * from "/absolute/path/to/src/index.ts";
export { default } from "/absolute/path/to/src/index.ts";
```

```typescript
// 生成的类型声明: dist/index.d.mts
export * from "/absolute/path/to/src/index.ts";
export { default } from "/absolute/path/to/src/index.ts";
```

### Transform 模式下的 Stub

在 Transform 模式下，stub 模式会：

1. **创建符号链接**: 将输出目录链接到源码目录
2. **保持文件结构**: 完全保持原始目录结构
3. **即时生效**: 任何源码更改立即反映

```bash
# 创建符号链接
ln -s /absolute/path/to/src/runtime /absolute/path/to/dist/runtime
```

## 运行时要求

### Node.js 环境

Stub 模式需要运行时能够直接执行 TypeScript 文件。有几种方式：

#### 1. Node.js 22.6+ (推荐)

```bash
# 使用 --experimental-strip-types 标志
node --experimental-strip-types dist/index.mjs
```

#### 2. 使用 jiti

```bash
# 安装 jiti
npm install -g jiti

# 使用 jiti 运行
node --import jiti/register dist/index.mjs
```

#### 3. 使用 oxc-node

```bash
# 安装 oxc-node
npm install -g @oxc-node/core

# 使用 oxc-node 运行
node --import @oxc-node/core/register dist/index.mjs
```

#### 4. 使用 unloader

```bash
# 安装 unloader
npm install -g unloader

# 使用 unloader 运行
node --import unloader/register dist/index.mjs
```

### 其他运行时

- **Deno**: 原生支持 TypeScript
- **Bun**: 原生支持 TypeScript
- **Vite**: 原生支持 TypeScript

## 使用场景

### 1. 库开发

```bash
# 开发时使用 stub 模式
robuild --stub ./src/index.ts

# 在另一个项目中测试
npm link
node --experimental-strip-types ./node_modules/your-lib/dist/index.mjs
```

### 2. CLI 工具开发

```bash
# 开发 CLI 工具
robuild --stub ./src/cli.ts

# 测试 CLI
node --experimental-strip-types ./dist/cli.mjs --help
```

### 3. 运行时文件开发

```bash
# 开发运行时文件
robuild --stub ./src/runtime/:./dist/runtime

# 在应用中引用
import { runtime } from './dist/runtime/index.mjs'
```

## 配置示例

### 开发配置

```typescript
// build.config.dev.ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: true, // 开发时启用 stub
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      stub: true, // 开发时启用 stub
    },
  ],
})
```

### 生产配置

```typescript
// build.config.prod.ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: true,
      dts: true,
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      minify: false,
    },
  ],
})
```

### 条件配置

```typescript
// build.config.ts
import { defineConfig } from 'robuild'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: isDev,
      minify: !isDev,
      dts: !isDev,
    },
  ],
})
```

## package.json 脚本

```json
{
  "scripts": {
    "build": "robuild ./src/index.ts",
    "build:dev": "robuild --stub ./src/index.ts",
    "dev": "robuild --stub ./src/index.ts && node --experimental-strip-types ./dist/index.mjs",
    "start": "node ./dist/index.mjs"
  }
}
```

## 注意事项

### 1. 路径解析

Stub 模式使用绝对路径，确保路径正确：

```typescript
// 正确的路径
export * from "/absolute/path/to/src/index.ts";

// 错误的路径
export * from "./src/index.ts";
```

### 2. 依赖处理

在 stub 模式下，依赖解析可能不同：

```typescript
// 源码中的相对导入
import { utils } from './utils'

// stub 文件中的绝对路径
import { utils } from "/absolute/path/to/src/utils.ts"
```

### 3. 类型声明

Stub 模式生成的类型声明文件指向源码：

```typescript
// dist/index.d.mts
export * from "/absolute/path/to/src/index.ts";
```

### 4. 文件权限

对于 CLI 工具，确保 stub 文件有执行权限：

```bash
chmod +x ./dist/cli.mjs
```

## 故障排除

### 1. 运行时错误

如果遇到运行时错误，检查：

```bash
# 检查 Node.js 版本
node --version

# 确保使用正确的标志
node --experimental-strip-types ./dist/index.mjs
```

### 2. 路径错误

如果路径解析有问题：

```bash
# 检查生成的 stub 文件
cat ./dist/index.mjs

# 验证路径是否存在
ls -la /absolute/path/to/src/index.ts
```

### 3. 权限问题

对于 CLI 工具：

```bash
# 设置执行权限
chmod +x ./dist/cli.mjs

# 测试执行
./dist/cli.mjs --help
```

## 最佳实践

### 1. 开发工作流

```bash
# 1. 启动 stub 模式
robuild --stub ./src/index.ts

# 2. 在另一个终端测试
node --experimental-strip-types ./dist/index.mjs

# 3. 修改源码，立即生效
# 4. 发布前构建正式版本
robuild ./src/index.ts
```

### 2. 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug robuild",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.mjs",
      "runtimeArgs": ["--experimental-strip-types"],
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.mjs"]
    }
  ]
}
```

### 3. 测试配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
})
```

```typescript
// test/setup.ts
import { execSync } from 'child_process'

// 确保 stub 文件存在
execSync('robuild --stub ./src/index.ts', { stdio: 'inherit' })
```

## 下一步

- [TypeScript 支持](./typescript.md) - TypeScript 集成详解
- [ESM 兼容性](./esm.md) - ESM 模块支持
- [配置](./configuration.md) - 详细配置选项
- [性能优化](./performance.md) - 性能优化技巧
