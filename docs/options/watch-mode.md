# 监听模式 {#watch-mode}

监听模式允许在文件变化时自动重新构建，提升开发效率。

## 启用监听模式 {#enable-watch}

### CLI {#cli}

```sh
robuild --watch ./src/index.ts

# 简写形式
robuild -w ./src/index.ts
```

### 配置文件 {#config-file}

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

## 配置选项 {#options}

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
    include: ['src/**/*'],        // 监听的文件
    exclude: ['**/*.test.ts'],    // 排除的文件
    delay: 100,                   // 防抖延迟（毫秒）
    ignoreInitial: false,         // 跳过初始构建
    watchNewFiles: true,          // 监听新文件
  },
})
```

## 忽略文件 {#ignore-files}

通过 CLI 忽略特定文件：

```sh
robuild -w --ignore-watch "**/*.test.ts" ./src/index.ts
```

或在配置中设置：

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  ignoreWatch: ['**/*.test.ts', '**/*.spec.ts'],
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
})
```

## 构建成功回调 {#on-success}

在每次构建成功后执行命令：

```sh
robuild -w --on-success "node dist/index.mjs" ./src/index.ts
```

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  onSuccess: 'node dist/index.mjs',
  // 或使用函数
  onSuccess: () => {
    console.log('构建完成!')
  },
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
})
```

## 监听模式特性 {#features}

- 自动检测文件变化并重新构建
- 智能防抖，避免频繁重建
- 构建错误后继续监听
- 清晰的构建日志
- 使用 `Ctrl+C` 优雅退出

:::tip
监听模式结合 Stub 模式（`--stub`）可以获得极致的开发体验，文件变化后几乎零延迟即可看到效果。
:::

## 下一步 {#next-steps}

- [Stub 模式](../advanced/stub-mode.md) - 极速开发模式
- [日志级别](./log-level.md) - 日志配置
