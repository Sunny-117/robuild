# CLI 参数

## 基本用法

```bash
robuild [entries...] [options]
```

## 选项

### 基础选项

| 选项 | 简写 | 说明 |
|------|------|------|
| `--config <file>` | `-c` | 指定配置文件 |
| `--no-config` | | 禁用配置文件 |
| `--dir <dir>` | | 工作目录（默认: `.`） |
| `--out-dir <dir>` | `-d` | 输出目录（默认: `dist`） |
| `--watch` | `-w` | 监听模式 |
| `--stub` | | Stub 开发模式 |

### 输出选项

| 选项 | 说明 |
|------|------|
| `--format <format>` | `-f` | 输出格式: esm, cjs, iife, umd |
| `--platform <platform>` | 目标平台: browser, node, neutral |
| `--target <target>` | ES 版本: es2015, es2020, esnext |
| `--global-name <name>` | IIFE/UMD 全局变量名 |

### 优化选项

| 选项 | 说明 |
|------|------|
| `--minify` | 压缩代码 |
| `--sourcemap` | 生成 source map |
| `--splitting` | 代码分割 |
| `--treeshake` | Tree shaking（默认开启） |

### 类型声明

| 选项 | 说明 |
|------|------|
| `--dts` | 生成类型声明文件 |
| `--dts-only` | 仅生成类型声明 |

### 依赖处理

| 选项 | 说明 |
|------|------|
| `--external <module>` | 外部化依赖 |
| `--no-external <module>` | 强制打包依赖 |
| `--skip-node-modules` | 跳过 node_modules |

### 其他选项

| 选项 | 说明 |
|------|------|
| `--clean` | 清理输出目录 |
| `--no-clean` | 禁用清理 |
| `--shims` | 启用兼容性垫片 |
| `--unbundle` | 保留文件结构不打包 |
| `--generate-exports` | 生成 package.json exports |
| `--on-success <cmd>` | 构建成功后执行命令 |
| `--log-level <level>` | `-l` | 日志级别: silent, error, warn, info, verbose |
| `--fail-on-warn` | 警告时失败 |
| `--ignore-watch <pattern>` | 监听模式忽略文件 |
| `--from-vite` | 从 Vite 配置加载 |
| `--cjs-default <mode>` | CJS 默认导出处理: true, false, auto |

## 示例

### 基本构建

```bash
robuild ./src/index.ts
```

### 多格式输出

```bash
robuild ./src/index.ts --format esm --format cjs
```

### 浏览器库

```bash
robuild ./src/index.ts --format iife --global-name MyLib --platform browser
```

### CLI 工具

```bash
robuild ./src/cli.ts --platform node --minify
```

### Transform 模式

```bash
robuild ./src/runtime/:./dist/runtime
```

### 监听模式

```bash
robuild ./src/index.ts -w
```

### 开发模式

```bash
robuild ./src/index.ts --stub
```

### 使用配置文件

```bash
robuild                           # 使用 build.config.ts
robuild --config custom.config.ts # 指定配置文件
```

## package.json 脚本

```json
{
  "scripts": {
    "build": "robuild ./src/index.ts",
    "dev": "robuild ./src/index.ts --stub",
    "watch": "robuild ./src/index.ts -w"
  }
}
```

## 下一步

- [配置选项](./config.md) - 配置文件选项
- [类型定义](./types.md) - 完整类型

