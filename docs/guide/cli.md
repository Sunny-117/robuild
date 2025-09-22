# CLI 命令行

robuild 提供了强大的命令行界面，支持多种构建选项和模式，包括基础功能、企业级功能和高级构建选项。

## 基本用法

### 构建命令

```bash
# 基本构建
npx robuild ./src/index.ts

# 指定输出目录
npx robuild ./src/index.ts --outDir ./lib

# 多个入口文件
npx robuild ./src/index.ts ./src/cli.ts

# Transform 模式（路径以 / 结尾）
npx robuild ./src/runtime/:./dist/runtime
```

### 监听模式

```bash
# 启用监听模式
npx robuild ./src/index.ts --watch

# 监听模式简写
npx robuild ./src/index.ts -w

# 指定工作目录
npx robuild ./src/index.ts --watch --dir ./my-project
```

## 🎨 高级功能

### 多格式输出

robuild 支持同时输出多种格式，满足不同环境的需求：

```bash
# 单一格式
npx robuild ./src/index.ts --format esm

# 多种格式
npx robuild ./src/index.ts --format esm --format cjs

# 所有格式
npx robuild ./src/index.ts --format esm --format cjs --format iife --format umd
```

**支持的格式：**
- `esm` - ES 模块，适用于现代 JavaScript 环境
- `cjs` - CommonJS，适用于 Node.js 环境
- `iife` - 立即执行函数，适用于浏览器脚本标签
- `umd` - 通用模块定义，兼容多种环境

### 平台目标配置

指定构建目标平台，优化输出代码：

```bash
# 浏览器平台
npx robuild ./src/index.ts --platform browser

# Node.js 平台
npx robuild ./src/index.ts --platform node

# 中性平台（跨平台兼容）
npx robuild ./src/index.ts --platform neutral
```

### 全局变量名

为 IIFE 和 UMD 格式指定全局变量名：

```bash
npx robuild ./src/index.ts --format iife --global-name MyLibrary
```

### 环境变量和常量

在构建时注入环境变量和定义常量：

```bash
# 注入环境变量
npx robuild ./src/index.ts --env NODE_ENV=production --env VERSION=1.0.0

# 定义常量
npx robuild ./src/index.ts --define __DEV__=false --define API_URL="https://api.example.com"
```

### 外部依赖配置

控制哪些依赖应该被外部化或强制打包：

```bash
# 外部化依赖
npx robuild ./src/index.ts --external lodash --external react

# 强制打包依赖
npx robuild ./src/index.ts --no-external some-package
```

### 别名配置

设置模块路径别名：

```bash
npx robuild ./src/index.ts --alias @=./src --alias @utils=./src/utils
```

## 🏢 企业级功能

### 工作区支持

```bash
# 启用工作区模式
npx robuild --workspace

# 过滤特定包
npx robuild --workspace --filter "@mycompany/core"

# 多个过滤器
npx robuild --workspace --filter "@mycompany/*" --filter "packages/utils"

# 排除模式
npx robuild --workspace --filter "!@mycompany/test-*"
```

### 包导出生成

```bash
# 生成 package.json exports 字段
npx robuild ./src/index.ts --generate-exports

# 结合工作区使用
npx robuild --workspace --generate-exports
```

## 构建模式

### Bundle 模式

当入口路径不以 `/` 结尾时，robuild 使用 bundle 模式：

```bash
# 单个文件
robuild ./src/index.ts

# 多个文件
robuild ./src/index.ts,./src/cli.ts

# 指定输出目录
robuild ./src/index.ts:./dist/bundle
```

**输出文件：**
- `index.mjs` - 主文件
- `index.d.mts` - 类型声明文件
- `_chunks/` - 代码分割文件（如果有）

### Transform 模式

当入口路径以 `/` 结尾时，robuild 使用 transform 模式：

```bash
# 转换整个目录
robuild ./src/runtime/:./dist/runtime

# 保持目录结构
robuild ./src/:./dist/
```

**输出文件：**
- 保持原始目录结构
- `.ts` 文件转换为 `.mjs`
- 生成对应的 `.d.mts` 文件
- 其他文件直接复制

## 实际示例

### 1. 构建库

```bash
# 基本构建
robuild ./src/index.ts

# 多入口构建
robuild ./src/index.ts,./src/cli.ts

# 指定输出目录
robuild ./src/index.ts:./lib
```

### 2. 构建 CLI 工具

```bash
# 构建 CLI 入口
robuild ./src/cli.ts

# 包含 shebang 的处理
robuild ./src/cli.ts
```

### 3. 转换运行时文件

```bash
# 转换运行时目录
robuild ./src/runtime/:./dist/runtime

# 转换整个 src 目录
robuild ./src/:./dist/
```

### 4. 开发模式

```bash
# 使用 stub 模式
robuild --stub ./src/index.ts

# 指定工作目录
robuild --dir ./packages/core --stub ./src/index.ts
```

### 5. 复杂项目

```bash
# 混合构建
robuild \
  ./src/index.ts \
  ./src/cli.ts \
  ./src/runtime/:./dist/runtime \
  ./src/types/:./dist/types
```

## 配置文件集成

CLI 会自动加载配置文件：

```bash
# 自动加载 build.config.ts
robuild

# 指定配置文件
robuild --dir ./packages/core
```

配置文件中的 entries 会被 CLI 参数覆盖：

```typescript
// build.config.ts
export default defineConfig({
  entries: [
    { type: 'bundle', input: './src/index.ts' }
  ]
})
```

```bash
# CLI 参数会覆盖配置文件
robuild ./src/cli.ts
```

## 错误处理

### 常见错误

1. **找不到入口文件**
```bash
Error: Build entry missing `input`
```

2. **路径错误**
```bash
Error: Source should be within the package directory
```

3. **解析错误**
```bash
Error: Errors while parsing src/index.ts
```

### 调试技巧

1. **查看详细输出**
```bash
# 启用详细日志
DEBUG=* robuild ./src/index.ts
```

2. **检查配置文件**
```bash
# 验证配置文件
robuild --dir ./
```

3. **使用 stub 模式调试**
```bash
# 快速验证配置
robuild --stub ./src/index.ts
```

## 性能优化

### 1. 使用 stub 模式开发

```bash
# 开发时使用 stub 模式
robuild --stub ./src/index.ts
```

### 2. 合理使用 transform 模式

```bash
# 对于不需要打包的文件使用 transform
robuild ./src/runtime/:./dist/runtime
```

### 3. 避免重复构建

```bash
# 使用配置文件避免重复输入
robuild
```

## 集成到工作流

### package.json 脚本

```json
{
  "scripts": {
    "build": "robuild ./src/index.ts",
    "build:all": "robuild ./src/index.ts,./src/cli.ts ./src/runtime/:./dist/runtime",
    "dev": "robuild --stub ./src/index.ts",
    "build:prod": "robuild ./src/index.ts --minify"
  }
}
```

### CI/CD 集成

```yaml
# GitHub Actions
- name: Build
  run: npx robuild ./src/index.ts

# 或使用 npm script
- name: Build
  run: npm run build
```

## 下一步

- [配置](./configuration.md) - 了解配置文件选项
- [构建模式](./build-modes.md) - 深入了解 Bundle 和 Transform 模式
- [Stub 模式](./stub-mode.md) - 开发模式详解
- [API 文档](../api/) - 程序化 API 使用
