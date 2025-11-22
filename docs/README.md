# robuild 官网

这是 robuild 项目的官方文档网站，基于 [VitePress](https://vitepress.dev/) 构建。

## 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm docs:dev
```

访问 http://localhost:5173 查看网站。

### 构建生产版本

```bash
pnpm docs:build
```

构建产物位于 `docs/.vitepress/dist` 目录。

### 预览生产版本

```bash
pnpm docs:preview
```

## 部署

### GitHub Pages

网站已配置自动部署到 GitHub Pages。当推送到 `main` 分支时，GitHub Actions 会自动构建并部署网站。

部署地址：https://sunny-117.github.io/robuild/

### 手动部署

如果需要手动部署到其他平台：

1. 构建网站：
   ```bash
   pnpm docs:build
   ```

2. 将 `docs/.vitepress/dist` 目录的内容上传到你的 Web 服务器。

## 文档结构

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress 配置
│   └── theme/             # 主题配置
├── public/                # 静态资源
│   ├── logo.png
│   └── favicon.ico
├── guide/                 # 用户指南
│   ├── index.md           # 介绍
│   ├── getting-started.md # 快速开始
│   ├── cli.md             # CLI 使用（包含高级功能）
│   ├── configuration.md   # 配置文件
│   ├── build-modes.md     # 构建模式
│   ├── watch-mode.md      # 监听模式
│   ├── stub-mode.md       # Stub 模式
│   ├── typescript.md      # TypeScript 支持
│   ├── esm.md             # ESM 兼容性
│   ├── build-enhancements.md    # 构建功能增强
│   ├── dev-experience.md        # 开发体验功能
│   ├── exports-generation.md    # 包导出生成
│   ├── plugins.md               # 插件系统
│   ├── advanced-build.md        # 高级构建选项
│   ├── hooks.md                 # Hooks 钩子
│   └── performance.md           # 性能优化
├── api/                   # API 文档
│   ├── index.md           # API 概述
│   ├── config.md          # 配置选项
│   ├── cli.md             # CLI 参数
│   └── types.md           # 类型定义
├── architecture/          # 架构文档
│   ├── index.md           # 架构概述
│   ├── core.md            # 核心架构
│   ├── builders.md        # 构建器
│   ├── plugins.md         # 插件架构
│   └── performance.md     # 性能分析
├── api-examples.md        # API 示例
└── index.md              # 首页
```

## 内容贡献

### 添加新页面

1. 在相应目录下创建 `.md` 文件
2. 在 `docs/.vitepress/config.ts` 中添加导航和侧边栏配置
3. 确保文件有适当的 frontmatter

### 编辑现有页面

直接编辑对应的 `.md` 文件即可。VitePress 支持：

- Markdown 语法
- Vue 组件
- 代码高亮
- 数学公式
- Mermaid 图表

### 样式定制

在 `docs/.vitepress/theme/` 目录下添加自定义样式和组件。

## 技术栈

- **VitePress**: 静态站点生成器
- **Vue**: 前端框架
- **TypeScript**: 类型安全
- **Markdown**: 内容编写

## 相关链接

- [robuild GitHub 仓库](https://github.com/Sunny-117/robuild)
- [VitePress 文档](https://vitepress.dev/)
- [Vue 文档](https://vuejs.org/)
