# 监听模式

监听模式是 robuild 的一个强大功能，它允许你在开发时自动监听文件变化并重新构建，从而显著提升开发体验。

## 什么是监听模式？

监听模式是一种开发模式，它会持续监听源文件的变化，当检测到文件修改时自动触发重新构建。这样可以：

- **提升开发效率**: 无需手动重新构建
- **实时反馈**: 立即看到代码变化的效果
- **智能监听**: 自动确定需要监听的文件
- **错误恢复**: 构建失败后继续监听
- **性能优化**: 防抖机制避免频繁重建

## 启用监听模式

### CLI 方式

```bash
# 基本用法
robuild --watch ./src/index.ts

# 简写形式
robuild -w ./src/index.ts

# 监听转换模式
robuild --watch ./src/runtime/:./dist/runtime

# 结合其他选项
robuild --watch --dir ./my-project ./src/index.ts
```

### 配置文件方式

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,           // 启用监听模式
    delay: 100,              // 重建延迟
  },
})
```

## 监听配置选项

### 基本配置

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,           // 是否启用监听
    delay: 100,              // 重建延迟（毫秒）
    ignoreInitial: false,    // 是否跳过初始构建
    watchNewFiles: true,     // 是否监听新文件
  },
})
```

### 自定义文件模式

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,
    include: [               // 要监听的文件
      'src/**/*.ts',
      'src/**/*.js',
      'config/**/*',
    ],
    exclude: [               // 要排除的文件
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/temp/**/*',
    ],
  },
})
```

## 工作原理

### 文件检测

监听模式使用 [chokidar](https://github.com/paulmillr/chokidar) 进行高效的文件系统监听：

1. **自动模式检测**: 根据构建条目自动确定监听模式
2. **智能过滤**: 自动排除 `node_modules`、`dist` 等目录
3. **跨平台支持**: 在 Windows、macOS、Linux 上都能正常工作

### 重建流程

```
文件变化 → 防抖延迟 → 触发重建 → 显示结果 → 继续监听
```

1. 检测到文件变化
2. 等待配置的延迟时间（防抖）
3. 执行重新构建
4. 显示构建结果
5. 继续监听后续变化

## 使用场景

### 1. 库开发

```bash
# 开发 TypeScript 库
robuild --watch ./src/index.ts

# 同时生成类型定义
robuild --watch ./src/index.ts --dts
```

### 2. CLI 工具开发

```bash
# 开发命令行工具
robuild --watch ./src/cli.ts

# 测试构建结果
node ./dist/cli.mjs --help
```

### 3. 运行时文件开发

```bash
# 开发运行时文件
robuild --watch ./src/runtime/:./dist/runtime

# 在应用中引用
import { runtime } from './dist/runtime/index.mjs'
```

### 4. 多入口项目

```typescript
// build.config.ts
export default defineConfig({
  entries: [
    './src/index.ts',
    './src/cli.ts',
    './src/utils.ts',
  ],
  watch: {
    enabled: true,
    delay: 100,
  },
})
```

## 最佳实践

### 1. 合理设置延迟时间

```typescript
export default defineConfig({
  watch: {
    delay: 100,              // 一般项目
    // delay: 50,            // 小项目，快速响应
    // delay: 300,           // 大项目，减少频繁重建
  },
})
```

### 2. 排除不必要的文件

```typescript
export default defineConfig({
  watch: {
    exclude: [
      '**/*.test.ts',        // 测试文件
      '**/*.spec.ts',        // 规范文件
      '**/temp/**/*',        // 临时文件
      '**/*.log',            // 日志文件
    ],
  },
})
```

### 3. 环境特定配置

```typescript
// build.config.dev.ts - 开发环境
export default defineConfig({
  watch: {
    enabled: true,
    delay: 50,               // 快速响应
    watchNewFiles: true,
  },
})

// build.config.prod.ts - 生产环境
export default defineConfig({
  watch: {
    enabled: false,          // 生产环境不启用监听
  },
})
```

## 故障排除

### 监听不工作

1. **检查文件路径**: 确保监听的文件路径正确
2. **检查权限**: 确保有读取文件的权限
3. **检查排除模式**: 确认文件没有被排除规则过滤

### 频繁重建

1. **增加延迟时间**: 设置更大的 `delay` 值
2. **优化排除规则**: 排除不必要的文件和目录
3. **检查编辑器**: 某些编辑器可能产生临时文件

### 内存占用过高

1. **限制监听范围**: 使用 `include` 精确指定监听文件
2. **排除大目录**: 排除 `node_modules`、`dist` 等大目录
3. **定期重启**: 长时间运行后可以重启监听进程

## 与其他工具集成

### VS Code 任务

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Watch Build",
      "type": "shell",
      "command": "robuild",
      "args": ["--watch", "./src/index.ts"],
      "group": "build",
      "isBackground": true,
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

### package.json 脚本

```json
{
  "scripts": {
    "dev": "robuild --watch ./src/index.ts",
    "dev:cli": "robuild --watch ./src/cli.ts",
    "dev:runtime": "robuild --watch ./src/runtime/:./dist/runtime"
  }
}
```

### Docker 开发环境

```dockerfile
# 开发环境 Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

监听模式让 robuild 成为一个强大的开发工具，显著提升了开发体验和效率。
