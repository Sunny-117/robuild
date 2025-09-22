# robuild TODO - 基于 tsdown 功能对比

## 🎯 核心功能差异分析

基于对 tsdown 项目的深入分析，以下是 tsdown 具备但 robuild 缺失的主要功能特性：

## 📋 待实现功能清单

### 🔧 CLI 和配置增强

- [x] **多格式输出支持** - 支持 `esm`, `cjs`, `iife`, `umd` 多种输出格式
- [x] **全局变量名配置** - 为 IIFE/UMD 格式指定全局变量名 (`globalName`)
- [x] **平台目标配置** - 支持 `browser`, `node`, `neutral` 平台目标
- [x] **目标环境配置** - 支持 ES 版本目标如 `es2015`, `esnext` 等
- [x] **外部依赖配置** - 更灵活的 `external` 和 `noExternal` 配置
- [x] **别名配置** - 模块路径别名支持 (`alias`)
- [x] **环境变量注入** - 编译时环境变量定义 (`env`, `define`)

### 🏗️ 构建功能增强

- [x] **清理功能** - 构建前自动清理输出目录 (`clean`)
- [ ] **文件复制** - 静态资源复制功能 (`copy`)
- [ ] **文件哈希** - 输出文件名哈希支持 (`hash`)
- [ ] **固定扩展名** - 强制使用 `.cjs`/`.mjs` 扩展名 (`fixedExtension`)
- [ ] **自定义扩展名** - 灵活的输出文件扩展名配置 (`outExtensions`)
- [ ] **Banner/Footer** - 文件头尾注释添加
- [ ] **Node.js 协议处理** - `node:` 前缀的添加/移除 (`nodeProtocol`)

### 🔍 代码质量和分析

- [ ] **Publint 集成** - 包发布质量检查
- [ ] **Are The Types Wrong 集成** - TypeScript 类型检查
- [ ] **未使用依赖检查** - 依赖使用情况分析 (`unused`)
- [ ] **构建报告** - 详细的构建大小和依赖报告 (`report`)
- [ ] **Tree-shaking 配置** - 可配置的 tree-shaking 选项

### 🔄 开发体验

- [ ] **成功回调** - 构建成功后执行命令 (`onSuccess`)
- [ ] **忽略监听路径** - 监听模式下忽略特定路径 (`ignoreWatch`)
- [ ] **Vite 配置复用** - 从 Vite/Vitest 复用配置 (`fromVite`)
- [ ] **调试模式** - 详细的调试日志输出
- [ ] **日志级别控制** - 可配置的日志级别 (`logLevel`)
- [ ] **构建失败处理** - 警告时失败选项 (`failOnWarn`)

### 🏢 企业级功能

- [ ] **工作区支持** - Monorepo 多包构建 (`workspace`)
- [ ] **包过滤** - 工作区包过滤功能 (`filter`)
- [ ] **包导出生成** - 自动生成 package.json exports (`exports`)
- [ ] **迁移工具** - 从其他工具迁移的命令行工具

### 🔌 插件和扩展

- [ ] **Rollup 插件兼容** - 完整的 Rollup 插件生态支持
- [ ] **Vite 插件兼容** - 部分 Vite 插件支持
- [ ] **Unplugin 支持** - Universal 插件支持
- [ ] **自定义 Hooks** - 更丰富的构建钩子系统
- [ ] **Glob Import** - `import.meta.glob` 支持

### 📦 高级构建选项

- [ ] **Loader 配置** - 文件类型处理器配置
- [ ] **CJS 默认导出** - CommonJS 默认导出处理 (`cjsDefault`)
- [ ] **Shims 支持** - CJS/ESM 兼容性垫片
- [ ] **跳过 node_modules** - 可选的 node_modules 打包跳过
- [ ] **Unbundle 模式** - 保持文件结构的非打包模式

## 🚀 实现优先级

### 高优先级 (P0) ✅ 已完成
1. ✅ 多格式输出支持 (esm, cjs, iife, umd) - 支持单个或多个格式输出，自动文件扩展名
2. ✅ 清理功能 - 构建前自动清理输出目录，支持自定义清理路径
3. ✅ 环境变量注入 - 支持 env 和 define 配置，编译时变量替换
4. ✅ 平台目标配置 - 支持 browser, node, neutral 平台目标
5. ✅ 外部依赖配置增强 - 增强 external 和 noExternal 配置，支持正则表达式和函数
6. ✅ 目标环境配置 - 支持 ES 版本目标 (es5, es2015-es2022, esnext)
7. ✅ 别名配置 - 模块路径别名支持，支持 bundle 和 transform 模式

#### 实现详情

**多格式输出支持**
- 支持 ESM (.mjs), CJS (.cjs), IIFE (.js), UMD (.js) 格式
- 可通过 CLI `--format` 参数或配置文件指定多个格式
- 自动为不同平台选择合适的文件扩展名
- DTS 文件仅在 ESM 格式时生成（避免 rolldown-plugin-dts 限制）

**清理功能**
- 默认启用，构建前自动清理输出目录
- 支持 `clean: false` 禁用清理
- 支持 `clean: string[]` 指定自定义清理路径
- CLI 支持 `--no-clean` 参数

**环境变量注入**
- `env` 配置：替换 `process.env.VAR_NAME` 为指定值
- `define` 配置：替换任意标识符为指定值
- 编译时替换，无运行时开销
- 支持字符串、数字、布尔值等类型

**平台目标配置**
- `browser`: 浏览器环境，使用 .js 扩展名
- `node`: Node.js 环境，使用 .mjs/.cjs 扩展名
- `neutral`: 平台无关，默认配置
- 影响外部依赖处理和输出格式选择

**外部依赖配置增强**
- `external`: 支持字符串、正则表达式、函数
- `noExternal`: 强制打包指定依赖
- CLI 支持 `--external` 和 `--no-external` 参数
- 支持正则表达式语法（如 `/^@types\//`）

### 中优先级 (P1)
1. 文件复制功能
2. 构建报告
3. 成功回调
4. 别名配置
5. Publint 集成

### 低优先级 (P2)
1. 工作区支持
2. 迁移工具
3. Vite 配置复用
4. 高级插件支持
5. Glob Import

## 📝 实现说明

### 架构考虑
- 保持 robuild 的简洁性和性能优势
- 渐进式添加功能，避免破坏性变更
- 优先实现对库开发最有价值的功能
- 考虑与现有 rolldown/oxc 生态的兼容性

### 兼容性策略
- 保持向后兼容的 API 设计
- 提供平滑的迁移路径
- 支持渐进式功能采用
- 文档和示例同步更新

## 🎯 里程碑规划

### v0.1.0 - 基础功能增强
- 多格式输出
- 清理功能
- 环境变量注入
- 基础构建报告

### v0.2.0 - 开发体验提升
- 文件复制
- 成功回调
- 别名配置
- 监听功能增强

### v0.3.0 - 企业级功能
- 工作区支持
- 质量检查集成
- 高级配置选项
- 迁移工具

---

*此 TODO 基于 tsdown v0.15.4 的功能分析，持续更新中...*
