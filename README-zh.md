<div align="center">
  <img src="./docs/public/logo.png" alt="robuild" width="30%" />
</div>

# 📦 robuild 😯 [![npm](https://img.shields.io/npm/v/robuild.svg)](https://npmjs.com/package/robuild)

简体中文 | <a href="./README-zh.md">English</a>

⚡️ 零配置的 ESM/TS 包构建工具。基于 [**oxc**](https://oxc.rs/)、[**rolldown**](https://rolldown.rs/) 和 [**rolldown-plugin-dts**](https://github.com/sxzz/rolldown-plugin-dts) 驱动。

- 👌 专注于 ESM 兼容性。
- 🌱 全新重构，清理代码并移除遗留功能。
- 🚀 使用 [**oxc**](https://oxc.rs/)（转换）和 [**rolldown**](https://rolldown.rs/)（打包），构建速度大幅提升！

## 功能特性

### 🚀 核心功能
- **快速**: 基于 [rolldown](https://rolldown.rs/) 和 [oxc](https://oxc.rs/) 构建
- **打包**: 将库与依赖项一起打包
- **转换**: 将源代码转换为不同格式
- **TypeScript**: 一流的 TypeScript 支持，自动生成 `.d.ts` 文件
- **多入口**: 支持多个入口点
- **零配置**: 开箱即用，需要时可配置

### 🎨 输出格式
- **多格式**: 支持 ESM、CJS、IIFE、UMD 输出格式
- **平台目标**: 浏览器、Node.js 和中性平台目标
- **文件加载器**: 内置支持 JSON、CSS、文本和资源文件
- **高级加载器**: 可配置的自定义文件类型处理

### 🔧 开发体验
- **监听模式**: 实时文件监听和自动重建
- **Stub 模式**: 文件链接的闪电般快速开发
- **调试模式**: 全面的调试和日志记录
- **成功回调**: 构建成功后执行命令或函数
- **Vite 配置**: 重用现有的 Vite 配置

### 🏢 企业级功能
- **工作区支持**: 具有依赖排序的 Monorepo 多包构建
- **包过滤**: 工作区包的高级过滤
- **导出生成**: 自动生成 package.json exports 字段
- **迁移工具**: 从 tsup、unbuild、vite 和 webpack 迁移

### 🔌 插件系统
- **Rollup 插件**: 与 Rollup 插件生态系统完全兼容
- **Vite 插件**: 部分支持 Vite 插件
- **Unplugin**: 跨打包器的通用插件支持
- **自定义钩子**: 丰富的构建生命周期钩子
- **Glob 导入**: 支持 `import.meta.glob` 的 eager/lazy 加载

### 📦 高级构建选项
- **CJS/ESM 互操作**: 智能的 CommonJS 到 ESM 转换
- **垫片**: Node.js 全局变量和浏览器环境的兼容性垫片
- **跳过 Node Modules**: 可选的外部依赖处理
- **Unbundle 模式**: 保持文件结构而不打包
- **环境变量**: 编译时变量注入和替换
- 📦 **外部依赖**: 增强的外部依赖配置

## 安装

```sh
npm install robuild
# 或
pnpm add robuild
# 或
yarn add robuild
```

## 快速开始

```sh
# 打包你的库
npx robuild ./src/index.ts

# 转换源文件
npx robuild ./src/runtime/:./dist/runtime

# 开发时的监听模式
npx robuild ./src/index.ts --watch
```

## CLI 使用

### 基本命令

```sh
# 打包你的库
npx robuild ./src/index.ts

# 转换源文件（路径以 / 结尾时）
npx robuild ./src/runtime/:./dist/runtime

# 开发时的监听模式
npx robuild ./src/index.ts --watch
```

### 多格式输出

```sh
# 构建多种格式
npx robuild ./src/index.ts --format esm --format cjs --format iife

# 浏览器构建，带全局名称
npx robuild ./src/index.ts --format iife --platform browser --global-name MyLib
```

### 高级选项

```sh
# 外部依赖
npx robuild ./src/index.ts --external lodash --external /^@types\//

# 禁用清理
npx robuild ./src/index.ts --no-clean

# 自定义工作目录
npx robuild ./src/index.ts --dir ./my-project
```

可通过 `--dir` 指定工作目录，`--watch` 启用监听模式。

若路径以 `/` 结尾，robuild 将使用 [oxc-transform](https://www.npmjs.com/package/oxc-transform) 进行代码转换（而非 [rolldown](https://rolldown.rs/) 打包）。

### API 调用

```js
import { build } from 'robuild'

await build({
  cwd: '.',
  entries: ['./src/index.ts'],
})
```

## 配置

可在 `build.config.mjs`（或 `.ts`）中定义配置，或直接传入 `build()` 函数。

```js
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/cli.ts'],
      // outDir: "./dist",
      // minify: false,
      // stub: false,
      // rolldown: {}, // 参见 https://rolldown.rs/reference/config-options
      // dts: {}, // 参见 https://github.com/sxzz/rolldown-plugin-dts#options
    },
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
      // minify: false,
      // stub: false,
      // oxc: {},
      // resolve: {}
    },
  ],
  hooks: {
    // start: (ctx) => {},
    // end: (ctx) => {},
    // entries: (entries, ctx) => {},
    // rolldownConfig: (config, ctx) => {},
    // rolldownOutput: (output, res, ctx) => {},
  },
})
```

## 监听模式

在开发过程中，robuild 提供了监听模式，可在文件变化时自动重新构建项目。

### CLI 使用

```sh
# 为任何构建启用监听模式
npx robuild ./src/index.ts --watch

# 转换模式的监听
npx robuild ./src/runtime/:./dist/runtime --watch

# 指定工作目录的监听模式
npx robuild ./src/index.ts --watch --dir ./my-project
```

### 配置

可在 `build.config.ts` 中配置监听行为：

```js
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true, // 默认启用监听模式
    include: ['src/**/*'], // 要监听的文件
    exclude: ['**/*.test.ts'], // 要忽略的文件
    delay: 100, // 重建延迟（毫秒）
    ignoreInitial: false, // 跳过初始构建
    watchNewFiles: true, // 监听新文件
  },
})
```

### 特性

- **实时重建**：源文件变化时自动重新构建
- **智能文件检测**：根据构建条目自动确定要监听的文件
- **防抖重建**：可配置延迟以防止过度重建
- **错误恢复**：即使构建出错也会继续监听
- **清晰反馈**：显示文件变化和重建状态
- **优雅退出**：使用 Ctrl+C 清理退出

## Stub Mode

在本地开发时，反复执行构建或监听命令可能较为繁琐。

可通过 `stub: true`（条目配置）或 `--stub` CLI 参数启用存根模式。此模式下，robuild 会跳过实际构建，改为将预期输出路径链接至源文件。

- **打包条目**：生成 `.mjs` 和 `.d.mts` 文件直接重新导出源文件。
- **转换条目**：将 src 目录符号链接至 dist 目录。

**注意事项：**

1. 需运行时原生支持 TypeScript（如 Deno、Bun、Vite 或 Node.js¹）
2. **转换模式**：需配置打包工具解析 `.ts` 或 `.mjs` 扩展名。
3. **打包模式**：若新增条目或修改 `default` 导出，需重新执行存根构建。

(1) 对于 Node.js 的解决方案：

- 使用 `node --experimental-strip-types`（需 Node.js [22.6](https://nodejs.org/en/blog/release/v22.6.0) 及以上）
- 使用 [jiti](https://github.com/unjs/jiti)（`node --import jiti/register`）
- 使用 [oxc-node](https://github.com/oxc-project/oxc-node)（`node --import @oxc-node/core/register`）
- 使用 [unloader](https://github.com/sxzz/unloader)（`node --import unloader/register`）

## 相关项目

- [unbuild](https://github.com/unjs/unbuild)：基于 rollup 和 [mkdist](https://github.com/unjs/mkdist) 的稳定方案。
- [tsdown](https://tsdown.dev/)：基于 rolldown 的替代打包工具。

## 许可

💛 基于 [MIT](./LICENSE) 协议。
