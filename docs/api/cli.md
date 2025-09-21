# CLI 参数

robuild 提供了丰富的命令行参数，支持灵活的使用方式。

## 基本用法

### 命令格式

```bash
robuild [选项] <入口文件...>
```

### 基本示例

```bash
# 构建单个文件
npx robuild ./src/index.ts

# 构建多个文件
npx robuild ./src/index.ts ./src/cli.ts

# Transform 模式
npx robuild ./src/runtime/:./dist/runtime
```

## 命令行选项

### `--dir, -d`

指定工作目录：

```bash
# 指定工作目录
npx robuild --dir ./packages/core ./src/index.ts

# 简写形式
npx robuild -d ./packages/core ./src/index.ts
```

### `--stub, -s`

启用 stub 模式：

```bash
# 启用 stub 模式
npx robuild --stub ./src/index.ts

# 简写形式
npx robuild -s ./src/index.ts
```

### `--config, -c`

指定配置文件：

```bash
# 指定配置文件
npx robuild --config build.config.ts

# 简写形式
npx robuild -c build.config.ts
```

### `--watch, -w`

启用监听模式，文件变化时自动重新构建：

```bash
# 启用监听模式
npx robuild --watch ./src/index.ts

# 简写形式
npx robuild -w ./src/index.ts

# 监听转换模式
npx robuild --watch ./src/runtime/:./dist/runtime

# 结合其他选项
npx robuild --watch --dir ./my-project ./src/index.ts
```

**监听模式特性：**
- 自动检测文件变化并重新构建
- 智能确定要监听的文件模式
- 防抖机制避免频繁重建
- 构建错误后继续监听
- 清晰的变化和重建日志
- 使用 Ctrl+C 优雅退出

### `--clean`

清理输出目录：

```bash
# 构建前清理
npx robuild --clean ./src/index.ts
```

### `--no-cache`

禁用缓存：

```bash
# 禁用缓存
npx robuild --no-cache ./src/index.ts
```

### `--minify`

启用压缩：

```bash
# 启用压缩
npx robuild --minify ./src/index.ts
```

### `--sourcemap`

生成源码映射：

```bash
# 生成源码映射
npx robuild --sourcemap ./src/index.ts
```

### `--dts`

生成 TypeScript 声明文件：

```bash
# 生成声明文件
npx robuild --dts ./src/index.ts
```

### `--out-dir, -o`

指定输出目录：

```bash
# 指定输出目录
npx robuild --out-dir ./lib ./src/index.ts

# 简写形式
npx robuild -o ./lib ./src/index.ts
```

### `--platform`

指定目标平台：

```bash
# 指定平台
npx robuild --platform node ./src/index.ts
npx robuild --platform browser ./src/index.ts
npx robuild --platform neutral ./src/index.ts
```

### `--target`

指定目标环境：

```bash
# 指定目标环境
npx robuild --target ES2020 ./src/index.ts
npx robuild --target node18 ./src/index.ts
```

### `--external`

指定外部依赖：

```bash
# 指定外部依赖
npx robuild --external lodash --external chalk ./src/index.ts

# 使用正则表达式
npx robuild --external "node:*" ./src/index.ts
```

### `--format`

指定输出格式：

```bash
# 指定输出格式
npx robuild --format esm ./src/index.ts
npx robuild --format cjs ./src/index.ts
npx robuild --format iife ./src/index.ts

# 多格式输出
npx robuild --format esm,cjs ./src/index.ts
```

### `--name`

指定 IIFE 格式的全局变量名：

```bash
# 指定全局变量名
npx robuild --format iife --name MyLibrary ./src/index.ts
```

### `--silent`

静默模式：

```bash
# 静默模式
npx robuild --silent ./src/index.ts
```

### `--verbose`

详细输出：

```bash
# 详细输出
npx robuild --verbose ./src/index.ts
```

### `--debug`

调试模式：

```bash
# 调试模式
npx robuild --debug ./src/index.ts
```

### `--help, -h`

显示帮助信息：

```bash
# 显示帮助
npx robuild --help

# 简写形式
npx robuild -h
```

### `--version, -v`

显示版本信息：

```bash
# 显示版本
npx robuild --version

# 简写形式
npx robuild -v
```

## 环境变量

### `ROBUILD_CWD`

设置工作目录：

```bash
# 设置工作目录
ROBUILD_CWD=./packages/core npx robuild ./src/index.ts
```

### `ROBUILD_CONFIG`

指定配置文件：

```bash
# 指定配置文件
ROBUILD_CONFIG=build.config.ts npx robuild ./src/index.ts
```

### `ROBUILD_CACHE_DIR`

设置缓存目录：

```bash
# 设置缓存目录
ROBUILD_CACHE_DIR=./.cache npx robuild ./src/index.ts
```

### `DEBUG`

启用调试模式：

```bash
# 启用调试
DEBUG=robuild:* npx robuild ./src/index.ts
```

### `NODE_ENV`

设置环境：

```bash
# 设置环境
NODE_ENV=production npx robuild ./src/index.ts
NODE_ENV=development npx robuild ./src/index.ts
```

## 参数组合示例

### 1. 开发模式

```bash
# 开发模式配置
npx robuild \
  --stub \
  --watch \
  --sourcemap \
  --no-cache \
  ./src/index.ts
```

### 2. 生产构建

```bash
# 生产构建配置
npx robuild \
  --minify \
  --dts \
  --platform neutral \
  --target ES2020 \
  --external lodash \
  --external chalk \
  --format esm,cjs \
  ./src/index.ts
```

### 3. 库构建

```bash
# 库构建配置
npx robuild \
  --out-dir ./lib \
  --platform neutral \
  --external "node:*" \
  --external /^@types\// \
  --format esm,cjs,iife \
  --name MyLibrary \
  ./src/index.ts
```

### 4. CLI 工具构建

```bash
# CLI 工具构建
npx robuild \
  --platform node \
  --target node18 \
  --external "node:*" \
  --format cjs \
  ./src/cli.ts
```

### 5. 多入口构建

```bash
# 多入口构建
npx robuild \
  --out-dir ./dist \
  --minify \
  --dts \
  ./src/index.ts \
  ./src/cli.ts \
  ./src/runtime/:./dist/runtime
```

## 配置文件与 CLI 参数

### 优先级

CLI 参数的优先级高于配置文件：

```typescript
// build.config.ts
export default defineConfig({
  entries: ['./src/index.ts'],
  minify: false,
  sourcemap: false
})
```

```bash
# CLI 参数会覆盖配置文件
npx robuild --minify --sourcemap ./src/index.ts
```

### 混合使用

```bash
# 使用配置文件，但覆盖某些选项
npx robuild \
  --config build.config.ts \
  --minify \
  --out-dir ./custom-dist
```

## 错误处理

### 1. 参数验证

```bash
# 无效参数会显示错误
npx robuild --invalid-option ./src/index.ts
# 错误: 未知选项 --invalid-option
```

### 2. 文件检查

```bash
# 文件不存在会显示错误
npx robuild ./nonexistent.ts
# 错误: 文件不存在 ./nonexistent.ts
```

### 3. 配置验证

```bash
# 配置文件错误会显示错误
npx robuild --config invalid.config.ts
# 错误: 配置文件格式错误
```

## 性能优化

### 1. 并行构建

```bash
# 多个入口会并行构建
npx robuild ./src/index.ts ./src/cli.ts ./src/utils.ts
```

### 2. 缓存使用

```bash
# 默认启用缓存
npx robuild ./src/index.ts

# 禁用缓存（首次构建或调试）
npx robuild --no-cache ./src/index.ts
```

### 3. 增量构建

```bash
# 只有变化的文件会被重新构建
npx robuild ./src/index.ts
# 修改文件后再次运行
npx robuild ./src/index.ts  # 只构建变化的文件
```

## 集成示例

### 1. package.json 脚本

```json
{
  "scripts": {
    "build": "robuild ./src/index.ts",
    "build:dev": "robuild --stub --watch ./src/index.ts",
    "build:prod": "robuild --minify --dts --platform neutral ./src/index.ts",
    "build:lib": "robuild --out-dir ./lib --format esm,cjs ./src/index.ts",
    "build:cli": "robuild --platform node --format cjs ./src/cli.ts"
  }
}
```

### 2. CI/CD 集成

```yaml
# GitHub Actions
- name: Build
  run: |
    npm run build:prod
    npm run build:lib
    npm run build:cli
```

### 3. 开发工具集成

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build",
      "type": "shell",
      "command": "npx",
      "args": ["robuild", "./src/index.ts"],
      "group": "build"
    },
    {
      "label": "Build (Watch)",
      "type": "shell",
      "command": "npx",
      "args": ["robuild", "--watch", "./src/index.ts"],
      "group": "build",
      "isBackground": true
    }
  ]
}
```

## 故障排除

### 1. 参数冲突

```bash
# 避免参数冲突
npx robuild --stub --minify ./src/index.ts
# 警告: --stub 和 --minify 不能同时使用
```

### 2. 内存不足

```bash
# 增加内存限制
NODE_OPTIONS="--max-old-space-size=4096" npx robuild ./src/index.ts
```

### 3. 权限问题

```bash
# 修复权限问题
chmod +x ./dist/cli.js
```

## 下一步

- [配置选项](./config.md) - 详细配置选项
- [类型定义](./types.md) - 完整的类型定义
- [API 文档](./) - 程序化 API 使用
- [CLI 使用指南](../guide/cli.md) - CLI 使用详解
