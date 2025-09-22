# 企业级功能

robuild 提供了一系列企业级功能，专为大型项目和 monorepo 环境设计，帮助团队提高开发效率和代码质量。

## 🏢 工作区支持 (Workspace)

### 概述

工作区支持允许你在 monorepo 环境中构建多个包，支持依赖顺序构建和包过滤。

### 基本用法

```bash
# 启用工作区模式
npx robuild --workspace

# 构建特定包
npx robuild --workspace --filter "@mycompany/core"

# 构建多个包
npx robuild --workspace --filter "@mycompany/*" --filter "packages/utils"
```

### 配置文件

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  workspace: {
    packages: ['packages/*', 'apps/*'],
    filter: '@mycompany/*',
    dependencyOrder: true,
    parallel: true
  },
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs']
    }
  ]
})
```

### 工作区配置选项

| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `packages` | `string[]` | 包路径模式 | `['packages/*']` |
| `filter` | `string \| string[]` | 包过滤器 | - |
| `dependencyOrder` | `boolean` | 依赖顺序构建 | `true` |
| `parallel` | `boolean` | 并行构建独立包 | `true` |

### 包发现

robuild 自动发现工作区包，支持以下配置文件：

- `package.json` (npm workspaces)
- `pnpm-workspace.yaml` (pnpm)
- `lerna.json` (lerna)

### 依赖顺序构建

当启用 `dependencyOrder` 时，robuild 会分析包之间的依赖关系，确保依赖包先于被依赖包构建。

```typescript
// packages/utils/package.json
{
  "name": "@mycompany/utils",
  "dependencies": {}
}

// packages/core/package.json  
{
  "name": "@mycompany/core",
  "dependencies": {
    "@mycompany/utils": "workspace:*"
  }
}
```

构建顺序：`@mycompany/utils` → `@mycompany/core`

## 📦 包过滤 (Package Filtering)

### 过滤模式

支持多种过滤模式：

```bash
# 按包名过滤
npx robuild --workspace --filter "@mycompany/core"

# 使用 glob 模式
npx robuild --workspace --filter "@mycompany/*"

# 按路径过滤
npx robuild --workspace --filter "packages/core"

# 多个过滤器
npx robuild --workspace --filter "@mycompany/*" --filter "apps/web"

# 排除模式
npx robuild --workspace --filter "!@mycompany/test-*"
```

### 配置文件过滤

```typescript
export default defineConfig({
  workspace: {
    packages: ['packages/*', 'apps/*'],
    filter: [
      '@mycompany/*',        // 包含所有 @mycompany 包
      '!@mycompany/test-*',  // 排除测试包
      'apps/web'             // 包含特定应用
    ]
  }
})
```

## 📤 包导出生成 (Exports Generation)

### 概述

自动生成 `package.json` 的 `exports` 字段，支持多种输出格式和类型定义。

### 基本用法

```bash
# 生成 exports 字段
npx robuild ./src/index.ts --generate-exports
```

### 配置选项

```typescript
export default defineConfig({
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
    customMappings: {
      './utils': './dist/utils/index.js'
    }
  },
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      generateExports: true
    }
  ]
})
```

### 生成的 exports 示例

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.mjs",
      "require": "./dist/utils/index.cjs"
    }
  }
}
```

### 导出配置选项

| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `enabled` | `boolean` | 启用导出生成 | `false` |
| `includeTypes` | `boolean` | 包含类型定义 | `true` |
| `autoUpdate` | `boolean` | 自动更新 package.json | `true` |
| `customMappings` | `Record<string, string>` | 自定义导出映射 | `{}` |

## 🔄 迁移工具 (Migration Tools)

### 概述

提供从其他构建工具迁移到 robuild 的命令行工具，支持配置转换和迁移建议。

### 支持的工具

- **tsup** - 从 tsup 配置迁移
- **unbuild** - 从 unbuild 配置迁移  
- **vite** - 从 vite 配置迁移
- **webpack** - 从 webpack 配置迁移

### 基本用法

```bash
# 从 tsup 迁移
npx robuild migrate from tsup tsup.config.ts

# 从 unbuild 迁移
npx robuild migrate from unbuild build.config.ts

# 从 vite 迁移
npx robuild migrate from vite vite.config.js

# 自动检测迁移源
npx robuild migrate auto
```

### 迁移示例

#### 从 tsup 迁移

```typescript
// tsup.config.ts (原配置)
export default {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true
}

// build.config.ts (迁移后)
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['cjs', 'esm'],
      dts: true,
      clean: true
    }
  ]
})
```

#### 从 unbuild 迁移

```typescript
// build.config.ts (原配置)
export default {
  entries: ['./src/index'],
  declaration: true,
  rollup: {
    emitCJS: true
  }
}

// build.config.ts (迁移后)
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true
    }
  ]
})
```

### 迁移警告和建议

迁移工具会提供详细的警告和建议：

```bash
✅ 成功迁移配置文件
⚠️  警告: 以下功能需要手动调整:
   - 自定义插件配置
   - 复杂的 rollup 选项
   
💡 建议:
   - 考虑使用 robuild 的新功能
   - 查看文档了解最佳实践
```

## 🔧 最佳实践

### 1. Monorepo 项目结构

```
my-monorepo/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   ├── package.json
│   │   └── build.config.ts
│   ├── utils/
│   │   ├── src/
│   │   ├── package.json
│   │   └── build.config.ts
│   └── types/
│       ├── src/
│       ├── package.json
│       └── build.config.ts
├── apps/
│   └── web/
│       ├── src/
│       └── package.json
├── package.json
├── pnpm-workspace.yaml
└── build.config.ts (根配置)
```

### 2. 根配置文件

```typescript
// build.config.ts (根目录)
import { defineConfig } from 'robuild'

export default defineConfig({
  workspace: {
    packages: ['packages/*'],
    dependencyOrder: true,
    parallel: true
  },
  
  // 全局配置
  logLevel: 'info',
  failOnWarn: false,
  
  // 导出生成
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true
  }
})
```

### 3. 包级配置

```typescript
// packages/core/build.config.ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      external: ['@mycompany/utils']
    }
  ]
})
```

### 4. CI/CD 集成

```yaml
# .github/workflows/build.yml
name: Build
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm robuild --workspace
      - run: pnpm test
```

## 📚 相关文档

- [插件系统](./plugins.md) - 了解插件开发和使用
- [高级构建选项](./advanced-build.md) - 深入了解高级功能
- [配置文件](./configuration.md) - 完整配置参考
- [API 文档](../api/) - 程序化 API 使用
