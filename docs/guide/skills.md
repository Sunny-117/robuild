# 与 AI 协作 {#ai-collaboration}

robuild 为 AI 编程助手提供了官方 [skills](https://agentskills.io/)，帮助 AI 理解 robuild 的配置、功能和最佳实践，从而更好地协助你构建库。

## 安装 {#installation}

将 robuild skill 安装到你的 AI 编程助手中：

```bash
npx skills add Sunny-117/robuild
```

skill 的源码在[这里](https://github.com/Sunny-117/robuild/tree/main/skills/robuild)。

## 示例提示词 {#example-prompts}

安装后，你可以让 AI 帮助完成各种 robuild 相关的任务：

```
用 robuild 构建 TypeScript 库，输出 ESM 和 CJS 格式
```

```
配置 robuild 生成类型声明文件并打包为浏览器格式
```

```
使用 robuild 的 Transform 模式，保留源码目录结构
```

```
为 robuild 配置自动生成 package.json exports 字段
```

```
从 tsup 迁移到 robuild
```

## 包含的内容 {#whats-included}

robuild skill 涵盖以下知识：

- 配置文件格式和双配置风格（unbuild 和 tsup 风格）
- 入口文件、输出格式和类型声明生成
- Bundle 和 Transform 两种构建模式
- 依赖处理和自动外部化
- package.json exports 字段自动生成
- 插件、钩子和编程 API
- CLI 命令和使用方式
- Stub 模式和 Watch 模式开发体验
