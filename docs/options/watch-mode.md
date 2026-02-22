# 监听模式

监听模式允许在文件变化时自动重新构建，提升开发效率。

## 启用监听模式

### CLI

```bash
robuild --watch ./src/index.ts

# 简写形式
robuild -w ./src/index.ts
```

### 配置文件

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
  watch: {
    enabled: true,
  },
})
```

## 配置选项

```ts [build.config.ts]
{
  watch: {
    enabled: true,
    include: ['src/**/*'],        // 监听的文件
    exclude: ['**/*.test.ts'],    // 排除的文件
    delay: 100,                   // 防抖延迟（毫秒）
    ignoreInitial: false,         // 跳过初始构建
    watchNewFiles: true,          // 监听新文件
  },
}
```

## 忽略文件

通过 CLI 忽略特定文件：

```bash
robuild -w --ignore-watch "**/*.test.ts" ./src/index.ts
```

或在配置中设置：

```ts [build.config.ts]
{
  ignoreWatch: ['**/*.test.ts', '**/*.spec.ts'],
}
```

## 构建成功回调

在每次构建成功后执行命令：

```bash
robuild -w --on-success "node dist/index.mjs" ./src/index.ts
```

```ts [build.config.ts]
{
  onSuccess: 'node dist/index.mjs',
  // 或使用函数
  onSuccess: () => {
    console.log('构建完成!')
  },
}
```

## 监听模式特性

- 自动检测文件变化并重新构建
- 智能防抖，避免频繁重建
- 构建错误后继续监听
- 清晰的构建日志
- 使用 `Ctrl+C` 优雅退出

> [!TIP]
> 监听模式结合 Stub 模式（`--stub`）可以获得极致的开发体验，文件变化后几乎零延迟即可看到效果。
