---
title: 当 rolldown 移除 CSS 支持后，我是如何修复构建工具的
description: 记录一次依赖升级引发的连锁反应：vitest 4.x、rolldown rc.9 破坏性变更的完整适配过程
author: Sunny-117
date: 2026-03-16
tags:
  - robuild
  - rolldown
  - vitest
  - breaking-changes
  - css
outline: deep
---

# 当 rolldown 移除 CSS 支持后，我是如何修复构建工具的

> 本文记录了一次依赖升级引发的连锁反应，以及逐步排查、修复的完整过程。涉及 vitest 4.x peer dependency 错误、rolldown rc.9 CSS bundling 移除、以及自制 CSS plugin 填补空缺的工程实践。

## 引言：一次 `pnpm up --latest` 引发的噩梦

每隔一段时间，我都会对 robuild 的依赖做一次整体升级。通常这是个无聊的例行操作：运行 `pnpm up --latest`，等几分钟，跑一遍测试，提交。

但这一次不一样。

```bash
pnpm up --latest
```

命令跑完后，终端出现了几行警告：

```
WARN  Issues with peer dependencies found

.
└─┬ vitest 4.1.0
  ├── ✕ unmet peer vite@"^6.0.0 || ^7.0.0 || ^8.0.0-0": found 5.4.21
  └─┬ @vitest/mocker 4.1.0
    └── ✕ unmet peer vite@"^6.0.0 || ^7.0.0 || ^8.0.0-0": found 5.4.21
```

好，peer dependency 冲突，常见问题。`package.json` 里的 `vite` 已经是 `^6.0.0`，锁文件里也解析到了 `6.4.1`，理论上没问题。忽略警告，跑测试：

```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './module-runner' is not
defined by "exports" in /path/to/node_modules/vite/package.json imported from
/path/to/node_modules/vitest/dist/chunks/cli-api.DuT9iuvY.js
```

测试直接挂掉，连启动都做不到。

这就是我今天要讲的故事。

---

## 第一章：vitest 4.x 与 vite 版本地狱

### 1.1 问题本质

错误信息很清晰：`vite/module-runner` 这个子路径不存在于当前安装的 vite 中。`vite@5` 没有这个导出，`vite@6` 才有。

但奇怪的是，锁文件里明明解析到了 `vite@6.4.1`：

```yaml
# pnpm-lock.yaml
vite:
  specifier: ^6.0.0
  version: 6.4.1(@types/node@25.5.0)(jiti@2.6.1)...

vitest:
  specifier: ^4.1.0
  version: 4.1.0(@types/node@25.5.0)(vite@6.4.1...)
```

那 `vite@5.4.21` 从哪来的？

```bash
ls node_modules/.pnpm/ | grep "vitest@4"
```

输出震惊了我：

```
vitest@4.1.0_@types+node@25.5.0_vite@5.4.21_...
vitest@4.1.0_@types+node@25.5.0_vite@6.4.1_...
```

pnpm 中同一个包可以有多个实例，对应不同的 peer dependency 组合。`node_modules/vitest` 的符号链接指向哪一个，才是运行时实际使用的版本。

用 `readlink` 验证：

```bash
readlink node_modules/vitest
# .pnpm/vitest@4.1.0_..._vite@6.4.1_.../node_modules/vitest
```

好，符号链接是对的。那为什么运行时找到的是 `vite@5`？

原因是：**`node_modules` 是旧的**。

`pnpm up --latest` 的工作方式是先更新锁文件，再更新 `node_modules`。但这次升级输出了一个警告：

```
WARN  `node_modules` is present. Lockfile only installation will make it out-of-date
```

pnpm 检测到 `node_modules` 已存在，采用了"只更新锁文件"的策略，没有重建 `node_modules` 中的符号链接。所以即使锁文件更新了，运行时还是走的旧链接。

### 1.2 修复方式

解法很简单：

```bash
pnpm install --frozen-lockfile
```

这会强制按照当前锁文件重建 `node_modules`，所有符号链接都会指向正确的版本。

但这个问题给了我一个重要提示：**`pnpm up --latest` 之后，一定要跑 `pnpm install` 确保 `node_modules` 与锁文件同步。**

修复之后，测试可以启动了。但随即暴露出了更深层的问题。

---

## 第二章：Snapshot 不匹配——rolldown 输出格式变化

vitest 启动后，跑了一遍测试，109 个失败。

其中大多数是这样的：

```
× esm compatibility > native ESM output > should generate ESM format by default
  → Snapshot `...` mismatched

- Expected
+ Received

@@ -4,10 +4,9 @@
  //#region index.ts
  function add(a, b) {
        return a + b;
  }
  const version = "1.0.0";
-
  //#endregion
  export { add, version };
```

期望的输出多了一个空行，而实际输出没有。这是 rolldown 在版本升级过程中修改了代码生成策略，区域注释（`//#region`）之间的空行被去掉了。

这类变化不是 bug，而是 rolldown 的内部实现改动。对于这类快照差异，最正确的处理方式是**更新快照**而不是修改逻辑：

```bash
pnpm vitest run -u
```

运行后，104 个快照被更新，还剩 10 个测试失败——全部来自 `test/css.test.ts`。

---

## 第三章：CSS Bundling 被移除——最大的破坏性变更

### 3.1 错误信息

CSS 测试的错误完全不同，是运行时崩溃：

```
[UNHANDLEABLE_ERROR] Error: Something went wrong inside rolldown,
please report this problem at https://github.com/rolldown/rolldown/issues.
Bundling CSS is no longer supported (experimental support has been removed).
See https://github.com/rolldown/rolldown/issues/4271 for details.
```

rolldown 在 `1.0.0-rc.9` 版本移除了对 CSS 的原生打包支持。

我去看了 GitHub issue [#4271](https://github.com/rolldown/rolldown/issues/4271)，官方说明如下：

> Previous experimental support has been removed because it does not achieve the goal we want. We're collecting users feedback on css bundling to figure what should be the right behaviors. We recommend you to use vite@8 (using rolldown underlying) for CSS related demands.

意思是：CSS 支持原来是实验性的，现在已移除，正在重新设计。短期内推荐用 Vite 处理 CSS。

对于 robuild 这样专注于**库构建**的工具来说，这是一个需要主动填补的空缺。

### 3.2 CSS 在库构建中的地位

先思考一下：一个 npm 库为什么需要 CSS？

- **UI 组件库**：`Button`、`Modal` 等组件需要默认样式
- **工具库带样式**：如 `highlight.js`，代码高亮需要主题 CSS
- **CSS-in-JS 的替代方案**：预编译 CSS 避免运行时计算

典型的使用方式：

```typescript
// src/index.ts
import './styles/base.css'
import './styles/components.css'

export { Button, Card, Modal }
```

消费者：

```typescript
// 用户代码
import { Button } from 'my-library'
import 'my-library/dist/index.css'  // 手动引入样式
```

所以，库构建中的 CSS 处理需求是真实存在的。rolldown 移除原生支持后，我们需要自己实现这部分逻辑。

---

## 第四章：设计并实现内置 CSS Plugin

### 4.1 第一版：简单版本

最直观的思路：用 rolldown 的 plugin 钩子拦截 CSS 文件，读取内容，emit 为资产文件。

```typescript
export function createBuiltinCssPlugin(): Plugin {
  const cssMap = new Map<string, string>()

  return {
    name: 'robuild:css',

    async load(id) {
      if (!id.endsWith('.css')) return null

      const content = await readFile(id, 'utf-8')
      cssMap.set(id, content)

      // 返回空 JS，阻止 rolldown 原生处理 CSS
      return { code: '', moduleType: 'js' }
    },

    generateBundle(_outputOptions, bundle) {
      if (cssMap.size === 0) return

      // 把所有 CSS 合并成一个文件
      const allCss = [...cssMap.values()].join('\n')
      this.emitFile({ type: 'asset', fileName: 'style.css', source: allCss })
    }
  }
}
```

逻辑很清晰：
1. `load` 钩子截获 CSS 文件，存到 `cssMap`，返回空 JS 模块
2. `generateBundle` 钩子把所有 CSS emit 出去

运行测试，通过了。

但我随即意识到：这个版本有问题。

### 4.2 发现 Bug：CSS 文件没有出现在 dist 里

我用 playground 验证实际效果：

```bash
cd playground/css-processing
node ../../dist/cli.mjs
ls dist/
```

输出：

```
_chunks/  index.cjs  index.d.cts  index.d.mts  index.mjs
```

**没有任何 CSS 文件。**

这是和 `test` 不同的维度。测试验证的是"运行不报错 + 输出符合快照"，但快照是我用第一版代码新生成的，所以当时通过了。实际的功能——生成 CSS 文件——却是坏的。

加了调试日志后找到原因：

```
[css-debug] cssMap.size = 1 ['/path/to/src/styles.css']
[css-debug] chunks: [
  {
    "fn": "index.mjs",
    "mids": ["/path/to/src/index.ts"]
  }
]
```

`cssMap.size = 1`，CSS 被成功加载了。但 `chunk.moduleIds` 里只有 `index.ts`，没有 `styles.css`。

### 4.3 根因分析：rolldown 的 Tree-shaking

问题的根源是：我让 CSS 模块返回了空 JS：

```typescript
return { code: '', moduleType: 'js' }
```

这个模块没有任何导出，也没有副作用标记。从 rolldown 的角度看，这是一个空的、无用的模块——**直接被 tree-shake 掉了**。tree-shake 后，这个模块不会出现在任何 chunk 的 `moduleIds` 里。

第一版代码在 `generateBundle` 里依赖 `chunk.moduleIds` 来判断哪些 CSS 属于哪个 chunk，这个前提已经不成立了。

### 4.4 第二版：用 resolveId 追踪 importer 关系

既然 tree-shaking 之后无法从 `moduleIds` 反推，我就在 tree-shaking **之前**记录下 CSS 的归属关系。

`resolveId` 钩子比 tree-shaking 早得多，它在模块图构建阶段就会被调用，此时 `importer` 参数就是调用 `import './styles.css'` 的那个文件。

```typescript
export function createBuiltinCssPlugin(options = {}): Plugin {
  const cssMap = new Map<string, string>()
  // CSS 绝对路径 -> 导入它的 JS 文件集合
  const cssImporters = new Map<string, Set<string>>()

  return {
    name: 'robuild:css',

    resolveId(id, importer) {
      // 在模块图构建时记录 CSS 的 importer
      if (importer && id.endsWith('.css')) {
        const resolved = resolve(dirname(importer), id)
        if (!cssImporters.has(resolved)) {
          cssImporters.set(resolved, new Set())
        }
        cssImporters.get(resolved)!.add(importer)
      }
      return null  // 返回 null 让 rolldown 继续正常解析路径
    },

    async load(id) {
      if (!id.endsWith('.css')) return null
      const content = await readFile(id, 'utf-8')
      cssMap.set(id, content)
      return { code: '', moduleType: 'js' as const }
    },

    generateBundle(_outputOptions, bundle) {
      if (cssMap.size === 0) return

      // 构建每个 chunk 的 moduleId 集合
      const chunks = Object.values(bundle).filter(c => c.type === 'chunk')
      const chunkModuleIds = new Map(
        chunks.map(c => [c.fileName, new Set(c.moduleIds)])
      )

      // 查找某个 CSS 文件应该归属哪些 chunk
      function findOwnerChunks(cssId: string): string[] {
        const importers = cssImporters.get(cssId)
        if (!importers || importers.size === 0) {
          // 没有追踪到 importer，分配给所有 entry chunk
          return chunks.filter(c => c.isEntry).map(c => c.fileName)
        }

        const owners = new Set<string>()
        for (const [chunkFileName, moduleIds] of chunkModuleIds) {
          for (const importerId of importers) {
            if (moduleIds.has(importerId)) {
              owners.add(chunkFileName)
            }
          }
        }

        return owners.size > 0
          ? [...owners]
          : chunks.filter(c => c.isEntry).map(c => c.fileName)
      }

      // 按 chunk 分组，emit CSS 文件
      const chunkCssMap = new Map<string, string[]>()
      for (const [cssId, cssContent] of cssMap) {
        for (const chunkFileName of findOwnerChunks(cssId)) {
          if (!chunkCssMap.has(chunkFileName)) {
            chunkCssMap.set(chunkFileName, [])
          }
          chunkCssMap.get(chunkFileName)!.push(cssContent)
        }
      }

      for (const [chunkFileName, cssList] of chunkCssMap) {
        const cssContent = cssList.join('\n')
        if (!cssContent.trim()) continue
        const cssFileName = chunkFileName.replace(/\.(m?js|cjs)$/, '.css')
        this.emitFile({ type: 'asset', fileName: cssFileName, source: cssContent })
      }
    }
  }
}
```

关键思路：

```
resolveId 阶段（tree-shaking 之前）:
  import './styles.css' 被 src/index.ts 调用
  → cssImporters.set('/path/styles.css', Set{'/path/index.ts'})

generateBundle 阶段（输出生成时）:
  chunk "index.mjs" 的 moduleIds 包含 '/path/index.ts'
  → '/path/styles.css' 的 importer 在 "index.mjs" 中
  → emit "index.css"
```

这次验证通过了：

```bash
ls dist/
# _chunks/  index.css  index.cjs  index.d.cts  index.d.mts  index.mjs

ls dist/_chunks/
# Chart-D_jobv-n.cjs  Chart-D_jobv-n.css  Chart-DgXWcufo.css  Chart-DgXWcufo.mjs
```

不仅主入口有了 `index.css`，动态 import 的 `Chart` 组件也有了对应的 `Chart-xxx.css`。CSS code splitting 也工作了。

---

## 第五章：处理用户自定义 CSS Loader 的冲突

修复完成后跑测试，还有 2 个失败：

```
× advanced build features > file loaders > should handle different file types with loaders
  → Build failed: "default" is not exported by "styles.css"
```

这个测试的代码是：

```typescript
import styles from './styles.css'  // default import

// 配置
loaders: {
  '.css': { loader: 'text' }  // 用户明确指定 CSS 作为文本导入
}
```

用户希望把 CSS 作为文本字符串导入到 JS 里，通过 `moduleTypes: { '.css': 'text' }` 实现。但我的 CSS plugin 的 `load` 钩子比 `moduleTypes` 优先级更高，把 CSS 文件返回成了空 JS，导致 `import styles from './styles.css'` 找不到 default export。

解决方式：当用户已经配置了 CSS loader 时，跳过内置 CSS plugin。

```typescript
// src/builders/bundle.ts

// 检查用户是否配置了自定义 CSS loader
const hasCssLoader = entry.loaders?.['.css'] !== undefined

if (cssOptions.lightningcss) {
  // 使用 LightningCSS 处理
} else if (!hasCssLoader) {
  // 只在没有自定义 CSS loader 时才使用内置 CSS plugin
  rolldownPlugins.push(
    createBuiltinCssPlugin({
      fileName: cssOptions.fileName,
      splitting: cssOptions.splitting,
    }),
  )
}
```

这样，三种 CSS 处理模式互不干扰：

| 情况 | 处理方式 |
|------|---------|
| 用户配置了 `loaders['.css']` | 走 rolldown 原生 `moduleTypes`（如 `text`、`base64`） |
| 用户启用了 `css.lightningcss` | 走 LightningCSS plugin |
| 默认情况 | 走内置 CSS plugin，输出为 `.css` 文件 |

---

## 第六章：更新快照，收尾

最后，对 CSS 测试的快照做一次更新。之前旧快照是空实现生成的（没有 CSS 文件），新快照应该包含真实的 CSS 输出：

```bash
pnpm vitest run -u
```

```
Snapshots  8 updated
Test Files  27 passed (27)
Tests  508 passed (508)
```

全部通过。

---

## 深度复盘：三个层面的经验

### 6.1 依赖管理：`pnpm up` 后必须 `pnpm install`

这次踩坑让我意识到 pnpm 的一个细节：

```bash
# 有风险的做法
pnpm up --latest
pnpm test  # 可能 node_modules 未同步

# 安全的做法
pnpm up --latest
pnpm install --frozen-lockfile  # 强制重建 node_modules
pnpm test
```

`pnpm up --latest` 只保证锁文件是最新的，不保证 `node_modules` 与锁文件一致。特别是当 peer dependency 的解析结果发生变化时（从 `vite@5` 切换到 `vite@6`），符号链接需要重建。

### 6.2 快照测试：要区分"功能正确"和"输出一致"

快照测试有一个微妙的陷阱：**快照测试只验证输出和历史是否一致，不验证功能是否正确**。

这次修复 CSS 问题时，第一版（空实现）也通过了快照测试，因为我用第一版生成了快照，当然和第一版一致。但实际上 dist 目录里没有任何 CSS 文件，功能是坏的。

正确的做法是在快照测试基础上，**补充功能性断言**：

```typescript
it('should bundle CSS imports', async (context) => {
  const result = await testBuild({ ... })

  // 快照测试：验证输出格式符合预期
  // (由 testBuild 内部调用 expectSnapshot 完成)

  // 功能测试：验证 CSS 文件确实存在
  const cssFiles = result.files.filter(f => f.endsWith('.css'))
  expect(cssFiles.length).toBeGreaterThan(0)
})
```

### 6.3 构建工具适配：破坏性变更的处理策略

rolldown 移除 CSS 支持是一个典型的"上游破坏性变更"。作为依赖方，有几种处理策略：

**策略一：锁定版本，等待上游修复**

```json
{
  "dependencies": {
    "rolldown": "1.0.0-rc.8"  // 锁定到有 CSS 支持的版本
  }
}
```

缺点：会错过其他新特性和 bug 修复，且无法永远等待。

**策略二：在上层封装，用自己的实现填补**

这就是我采用的方案。核心思路是：

```
上游移除了 X 功能
→ 识别 X 功能的边界
→ 在 plugin 层面重新实现 X
→ 向用户透明（配置 API 不变）
```

这种策略的好处是用户无感知，配置 API 保持稳定。代价是维护成本——我们需要维护一段替代实现，直到上游重新提供更好的官方方案。

**策略三：改变定位，不再支持该功能**

直接在文档中说明：

> 由于 rolldown rc.9 移除了 CSS bundling 支持，robuild 当前版本不支持 CSS 文件的打包输出。如需处理 CSS，请使用 Vite 或 LightningCSS。

这种策略最省力，但对用户有损。

---

## 结语：工具开发者的视角

做构建工具有一种独特的压力：**你的底层依赖越高层，你的用户对你的稳定性期待就越高，但你实际能控制的范围就越小。**

rolldown 在快速迭代，API 会变，行为会变，功能会增减。作为上层工具，robuild 需要：

1. **快速感知变化**：持续跑测试，第一时间发现上游变更
2. **弹性适配**：不直接暴露上游 API，在中间加一层适配层
3. **向用户透明**：API 稳定，内部实现可以变

这次修复从发现问题到全部测试通过，核心代码改动集中在两个地方：
- `src/builders/bundle.ts`：选择合适的 CSS 处理策略
- `src/plugins/builtin/css.ts`：新增内置 CSS plugin

整个过程大约两小时，其中最耗时的是排查"CSS 文件没有出现在 dist"这个隐蔽的功能 bug——表面上测试通过了，实际上功能是坏的。

这让我重新审视了 robuild 测试策略的一个盲点：对于"产物文件存在性"的验证不够充分。快照能验证内容格式，但不能替代"文件应该存在"这类基本断言。

所以，最后的收获不只是修了几行代码，更是重新认识了**测试要测什么**这个更根本的问题。

---

**参考资料**：

- [rolldown CSS support issue #4271](https://github.com/rolldown/rolldown/issues/4271)
- [rolldown 1.0.0-rc.9 release notes](https://github.com/rolldown/rolldown/releases)
- [pnpm peer dependencies 文档](https://pnpm.io/how-peers-are-resolved)
- [robuild 源码](https://github.com/Sunny-117/robuild)
