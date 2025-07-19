# CLI 使用

robuild 提供了强大的命令行接口，支持多种构建模式和选项。

## 基本语法

```bash
robuild [options] <entries...>
```

## 参数说明

### 位置参数

#### `<entries...>`
构建入口文件或目录，支持多种格式：

```bash
# 单个文件
robuild ./src/index.ts

# 多个文件
robuild ./src/index.ts ./src/cli.ts

# 使用逗号分隔
robuild ./src/index.ts,./src/cli.ts

# Transform 模式（目录）
robuild ./src/runtime/:./dist/runtime

# 混合模式
robuild ./src/index.ts ./src/runtime/:./dist/runtime
```

### 选项参数

#### `--dir <directory>`
设置工作目录，默认为当前目录。

```bash
robuild --dir ./packages/core ./src/index.ts
```

#### `--stub`
启用 stub 模式，跳过实际构建，创建源码链接。

```bash
robuild --stub ./src/index.ts
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
