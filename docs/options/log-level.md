# 日志级别 {#log-level}

`robuild` 提供多种日志级别，控制构建过程中的输出信息。

## CLI 用法 {#cli-usage}

```sh
robuild --log-level info ./src/index.ts

# 简写形式
robuild -l silent ./src/index.ts
```

## 配置文件用法 {#config-usage}

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  logLevel: 'info',
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
})
```

## 可用级别 {#available-levels}

| 级别 | 说明 |
|-----|------|
| `silent` | 不输出任何信息 |
| `error` | 只输出错误信息 |
| `warn` | 输出警告和错误 |
| `info` | 输出常规信息（默认） |
| `verbose` | 输出详细信息，用于调试 |

## 警告失败 {#fail-on-warn}

使用 `--fail-on-warn` 在遇到警告时使构建失败：

```sh
robuild --fail-on-warn ./src/index.ts
```

```ts [build.config.ts]
import { defineConfig } from 'robuild'

export default defineConfig({
  failOnWarn: true,
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    },
  ],
})
```

这在 CI/CD 环境中很有用，确保不忽略任何警告。

## 使用建议 {#recommendations}

| 场景 | 推荐级别 |
|-----|---------|
| 开发 | `info` |
| CI/CD | `warn` 或 `error` |
| 调试问题 | `verbose` |
| 脚本集成 | `silent` |

:::tip
在调试构建问题时，使用 `verbose` 级别可以看到更详细的构建信息。
:::

## 下一步 {#next-steps}

- [监听模式](./watch-mode.md) - 监听模式配置
- [源码映射](./sourcemap.md) - 源码映射配置
