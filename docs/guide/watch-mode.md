# 监听模式

监听模式允许在开发时自动监听文件变化并重新构建。

## 启用监听模式

### CLI 方式

```bash
robuild --watch ./src/index.ts
# 或简写
robuild -w ./src/index.ts
```

### 配置文件方式

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,
  },
})
```

## 配置选项

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,        // 启用监听
    delay: 100,           // 重建延迟（毫秒）
    ignoreInitial: false, // 是否跳过初始构建
    watchNewFiles: true,  // 是否监听新文件
    include: [            // 要监听的文件
      'src/**/*.ts',
    ],
    exclude: [            // 要排除的文件
      '**/*.test.ts',
      'node_modules/**',
    ],
  },
})
```

## 工作原理

```
文件变化 → 防抖延迟 → 重新构建 → 继续监听
```

监听模式使用 rolldown 内置的 watch 功能，自动：
- 检测文件变化
- 防抖避免频繁重建
- 错误恢复后继续监听

## package.json 脚本

```json
{
  "scripts": {
    "dev": "robuild --watch ./src/index.ts",
    "build": "robuild ./src/index.ts"
  }
}
```

## 下一步

- [构建模式](./build-modes.md) - Bundle 与 Transform 模式
- [Stub 模式](./stub-mode.md) - 极速开发模式
