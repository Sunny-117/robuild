# 日志级别

`robuild` 提供多种日志级别，控制构建过程中的输出信息。

## CLI 用法

```bash
robuild --log-level info ./src/index.ts

# 简写形式
robuild -l silent ./src/index.ts
```

## 配置文件用法

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

## 可用级别

| 级别 | 说明 |
|-----|------|
| `silent` | 不输出任何信息 |
| `error` | 只输出错误信息 |
| `warn` | 输出警告和错误 |
| `info` | 输出常规信息（默认） |
| `verbose` | 输出详细信息，用于调试 |

## 警告失败

使用 `--fail-on-warn` 在遇到警告时使构建失败：

```bash
robuild --fail-on-warn ./src/index.ts
```

```ts [build.config.ts]
{
  failOnWarn: true,
}
```

这在 CI/CD 环境中很有用，确保不忽略任何警告。

## 使用建议

| 场景 | 推荐级别 |
|-----|---------|
| 开发 | `info` |
| CI/CD | `warn` 或 `error` |
| 调试问题 | `verbose` |
| 脚本集成 | `silent` |

> [!TIP]
> 在调试构建问题时，使用 `verbose` 级别可以看到更详细的构建信息。
