# 快速开始

## 安装

### 全局安装

```bash
npm install -g robuild
```

### 项目安装

```bash
npm install --save-dev robuild
```

### 使用 npx

```bash
npx robuild ./src/index.ts
```

## 基本使用

### 1. 创建项目结构

```bash
mkdir my-package
cd my-package
npm init -y
```

创建基本的项目结构：

```
my-package/
├── package.json
├── src/
│   ├── index.ts
│   └── utils.ts
└── tsconfig.json
```

### 2. 编写源码

**src/index.ts**
```typescript
export { add, multiply } from './utils'

export function greet(name: string): string {
  return `Hello, ${name}!`
}
```

**src/utils.ts**
```typescript
export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}
```

### 3. 构建项目

```bash
# 使用 npx
npx robuild ./src/index.ts

# 或使用全局安装的 robuild
robuild ./src/index.ts
```

### 4. 查看构建结果

构建完成后，会在 `dist/` 目录生成以下文件：

```
dist/
├── index.mjs          # 主文件
├── index.d.mts        # 类型声明文件
└── _chunks/           # 代码分割文件（如果有）
```

### 5. 配置 package.json

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.mjs",
  "types": "./dist/index.d.mts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.mts"
    }
  },
  "scripts": {
    "build": "robuild ./src/index.ts",
    "dev": "robuild ./src/index.ts --stub"
  }
}
```

## 高级示例

### 多入口构建

```bash
# 构建多个入口文件
npx robuild ./src/index.ts,./src/cli.ts
```

### Transform 模式

```bash
# 转换整个目录
npx robuild ./src/runtime/:./dist/runtime
```

### 开发模式

```bash
# 使用 stub 模式，快速开发
npx robuild ./src/index.ts --stub
```

## 配置文件

创建 `build.config.ts` 文件进行更精细的配置：

```typescript
import { defineBuildConfig } from 'robuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts'],
      outDir: './dist',
      minify: false,
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

## 常见问题

### Q: 如何处理依赖？

robuild 会自动处理依赖关系，将外部依赖标记为 external，不会打包进最终文件。

### Q: 如何生成类型声明文件？

默认情况下，robuild 会自动生成 TypeScript 声明文件。可以通过 `dts: false` 禁用。

### Q: 如何压缩代码？

在配置中设置 `minify: true` 或使用 `'dce-only'` 进行死代码消除。

### Q: 如何处理 shebang？

robuild 内置了 shebang 处理插件，会自动保留并设置可执行权限。

## 下一步

- [CLI 使用](./cli.md) - 了解更多命令行选项
- [配置](./configuration.md) - 详细的配置选项
- [构建模式](./build-modes.md) - Bundle 和 Transform 模式详解
- [Stub 模式](./stub-mode.md) - 开发模式的使用
