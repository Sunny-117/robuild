---
title: 构建工具的第三次革命
description: 从 Rollup 到 Rust Bundler，我是如何设计 robuild 的
author: Sunny-117
date: 2025-02-22
tags:
  - robuild
  - bundler
  - rolldown
  - oxc
  - rust
outline: deep
---

# 构建工具的第三次革命：从 Rollup 到 Rust Bundler，我是如何设计 robuild 的

> 本文将从第一人称实战视角，深入探讨前端构建工具的技术演进，以及我在设计 robuild 过程中的架构思考与工程实践。

## 引言：为什么我们需要又一个构建工具？

在开始正文之前，我想先回答一个无法回避的问题：在 Webpack、Rollup、esbuild、Vite 已经如此成熟的今天，为什么还要设计一个新的构建工具？

答案很简单：**库构建与应用构建是两个本质不同的问题域**。

Webpack 为复杂应用而生，Vite 为开发体验而生，esbuild 为速度而生。但当我们需要构建一个 npm 库时，我们需要的是：

1. **零配置**：库作者不应该花时间在配置上
2. **多格式输出**：ESM、CJS、甚至 UMD 一键生成
3. **类型声明**：TypeScript 项目的 `.d.ts` 自动生成
4. **Tree-shaking 友好**：输出代码必须对消费者友好
5. **极致性能**：构建速度不应该成为开发瓶颈

robuild 就是为解决这些问题而设计的。它基于 Rolldown（Rust 实现的 Rollup 替代品）和 Oxc（Rust 实现的 JavaScript 工具链），专注于库构建场景。

接下来，让我从构建工具的历史演进说起。

---

## 第一章：构建工具的三次演进

### 1.1 第一次革命：Webpack 时代（2012-2017）

2012 年，Webpack 横空出世，彻底改变了前端工程化的格局。

在 Webpack 之前，前端工程师面对的是一个碎片化的世界：RequireJS 处理模块加载，Grunt/Gulp 处理任务流程，各种工具各司其职却又互不兼容。Webpack 的革命性在于它提出了一个统一的心智模型：**一切皆模块**。

```javascript
// Webpack 的核心思想：统一的依赖图
// JS、CSS、图片、字体，都是图中的节点
module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.png$/, use: ['file-loader'] }
    ]
  }
}
```

Webpack 的架构基于以下核心概念：

1. **依赖图（Dependency Graph）**：从入口点出发，递归解析所有依赖
2. **Loader 机制**：将非 JS 资源转换为模块
3. **Plugin 系统**：基于 Tapable 的事件驱动架构
4. **Chunk 分割**：智能的代码分割策略

但 Webpack 也有其历史局限性：

- **配置复杂**：动辄数百行的配置文件
- **构建速度**：随着项目规模增长，构建时间呈指数级增长
- **输出冗余**：运行时代码占比较高，不利于库构建

### 1.2 第二次革命：Rollup 时代（2017-2022）

2017 年左右，Rollup 开始崛起，它代表了一种完全不同的设计哲学：**面向 ES Module 的静态分析**。

Rollup 的核心创新是 **Tree Shaking**——通过静态分析 ES Module 的 import/export 语句，只打包实际使用的代码。这在库构建场景下意义重大：

```javascript
// input.js
import { add, multiply } from './math.js'
console.log(add(2, 3))
// multiply 未使用

// math.js
export function add(a, b) { return a + b }
export function multiply(a, b) { return a * b }

// output.js (Rollup 输出，multiply 被移除)
function add(a, b) { return a + b }
console.log(add(2, 3))
```

Rollup 能做到这一点，是因为 ES Module 具有以下静态特性：

1. **静态导入**：`import` 语句必须在模块顶层，不能动态
2. **静态导出**：`export` 的绑定在编译时就能确定
3. **只读绑定**：导入的值不能被重新赋值

这使得编译器可以在构建时进行精确的依赖分析，而不需要运行代码。

**作用域提升（Scope Hoisting）** 是 Rollup 的另一个重要特性。与 Webpack 将每个模块包裹在函数中不同，Rollup 会将所有模块"展平"到同一个作用域：

```javascript
// Webpack 风格的输出
var __webpack_modules__ = {
  "./src/a.js": (module) => { module.exports = 1 },
  "./src/b.js": (module, exports, require) => {
    const a = require("./src/a.js")
    module.exports = a + 1
  }
}

// Rollup 风格的输出
const a = 1
const b = a + 1
```

这种输出更紧凑、运行时开销更低，非常适合库构建。

### 1.3 第三次革命：Rust Bundler 时代（2022-今）

2022 年开始，我们迎来了构建工具的第三次革命：**Rust 重写一切**。

这场革命的先驱是 esbuild（Go 语言）和 SWC（Rust）。它们用系统级语言重写了 JavaScript 的解析、转换、打包流程，获得了 10-100 倍的性能提升。

为什么 Rust 成为了这场革命的主角？

1. **零成本抽象**：高级语言特性不带来运行时开销
2. **内存安全**：编译器保证没有数据竞争和悬空指针
3. **真正的并行**：无 GC 停顿，能充分利用多核
4. **可编译到 WASM**：可以在浏览器和 Node.js 中运行

Rolldown 和 Oxc 是这场革命的最新成果：

**Rolldown**：Rollup 的 Rust 实现，由 Vue.js 团队主导，目标是成为 Vite 的默认打包器。它保持了 Rollup 的 API 兼容性，同时获得了 Rust 带来的性能优势。

**Oxc**：一个完整的 JavaScript 工具链，包括解析器、转换器、代码检查器、格式化器、压缩器。它的设计目标是成为 Babel、ESLint、Prettier、Terser 的统一替代品。

```
传统工具链                    Oxc 工具链
Babel (转换)                 oxc-transform
ESLint (检查)        →       oxc-linter
Prettier (格式化)            oxc-formatter
Terser (压缩)                oxc-minify
```

robuild 选择基于 Rolldown + Oxc 构建，正是看中了这两个项目的技术潜力和生态定位。

---

## 第二章：理解 Bundler 核心原理

在深入 robuild 的设计之前，我想先从原理层面解释 Bundler 是如何工作的。我会实现一个 Mini Bundler，让你真正理解打包器的核心逻辑。

### 2.1 从零实现 Mini Bundler

一个最简的 Bundler 需要完成以下步骤：

1. **解析**：将源代码转换为 AST
2. **依赖收集**：从 AST 中提取 import 语句
3. **依赖图构建**：递归处理所有依赖，构建完整的模块图
4. **打包**：将所有模块合并为单个文件

下面是完整的实现代码：

```javascript
// mini-bundler.js
// 一个完整的 Mini Bundler 实现，约 300 行代码
// 支持 ES Module 解析、依赖图构建、打包输出

import * as fs from 'node:fs'
import * as path from 'node:path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { transformFromAstSync } from '@babel/core'

// ============================================
// 第一部分：模块解析器
// ============================================

let moduleId = 0  // 模块计数器，用于生成唯一 ID

/**
 * 解析单个模块
 * @param {string} filePath - 模块文件的绝对路径
 * @returns {Object} 模块信息对象
 */
function parseModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // 1. 使用 Babel 解析为 AST
  // 这里我们支持 TypeScript 和 JSX
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  })

  // 2. 收集依赖信息
  const dependencies = []
  const imports = []  // 详细的导入信息
  const exports = []  // 详细的导出信息

  traverse.default(ast, {
    // 处理 import 声明
    // import { foo, bar } from './module'
    // import defaultExport from './module'
    // import * as namespace from './module'
    ImportDeclaration({ node }) {
      const specifier = node.source.value
      dependencies.push(specifier)

      // 提取导入的具体内容
      const importedNames = node.specifiers.map(spec => {
        if (spec.type === 'ImportDefaultSpecifier') {
          return { type: 'default', local: spec.local.name }
        }
        if (spec.type === 'ImportNamespaceSpecifier') {
          return { type: 'namespace', local: spec.local.name }
        }
        // ImportSpecifier
        return {
          type: 'named',
          imported: spec.imported.name,
          local: spec.local.name
        }
      })

      imports.push({
        specifier,
        importedNames,
        start: node.start,
        end: node.end
      })
    },

    // 处理动态 import()
    // const mod = await import('./module')
    CallExpression({ node }) {
      if (node.callee.type === 'Import' &&
          node.arguments[0]?.type === 'StringLiteral') {
        dependencies.push(node.arguments[0].value)
        imports.push({
          specifier: node.arguments[0].value,
          isDynamic: true,
          start: node.start,
          end: node.end
        })
      }
    },

    // 处理 export 声明
    // export { foo, bar }
    // export const x = 1
    // export default function() {}
    ExportNamedDeclaration({ node }) {
      if (node.declaration) {
        // export const x = 1
        if (node.declaration.declarations) {
          for (const decl of node.declaration.declarations) {
            exports.push({
              type: 'named',
              name: decl.id.name,
              local: decl.id.name
            })
          }
        }
        // export function foo() {}
        else if (node.declaration.id) {
          exports.push({
            type: 'named',
            name: node.declaration.id.name,
            local: node.declaration.id.name
          })
        }
      }
      // export { foo, bar }
      for (const spec of node.specifiers || []) {
        exports.push({
          type: 'named',
          name: spec.exported.name,
          local: spec.local.name
        })
      }
      // export { foo } from './module'
      if (node.source) {
        dependencies.push(node.source.value)
      }
    },

    ExportDefaultDeclaration({ node }) {
      exports.push({ type: 'default', name: 'default' })
    },

    // export * from './module'
    ExportAllDeclaration({ node }) {
      dependencies.push(node.source.value)
      exports.push({
        type: 'star',
        from: node.source.value,
        as: node.exported?.name  // export * as name
      })
    }
  })

  // 3. 转换代码：移除类型注解，转换为 CommonJS
  // 这样我们可以在运行时执行
  const { code } = transformFromAstSync(ast, content, {
    presets: ['@babel/preset-typescript'],
    plugins: [
      ['@babel/plugin-transform-modules-commonjs', {
        strict: true,
        noInterop: false
      }]
    ]
  })

  return {
    id: moduleId++,
    filePath,
    dependencies,
    imports,
    exports,
    code,
    ast
  }
}

// ============================================
// 第二部分：模块路径解析
// ============================================

/**
 * 解析模块路径
 * 将 import 语句中的相对路径转换为绝对路径
 */
function resolveModule(specifier, fromDir) {
  // 相对路径
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    let resolved = path.resolve(fromDir, specifier)

    // 尝试添加扩展名
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']

    // 直接匹配文件
    for (const ext of extensions) {
      const withExt = resolved + ext
      if (fs.existsSync(withExt)) {
        return withExt
      }
    }

    // 尝试 index 文件
    for (const ext of extensions) {
      const indexPath = path.join(resolved, `index${ext}`)
      if (fs.existsSync(indexPath)) {
        return indexPath
      }
    }

    // 如果原路径存在（有扩展名的情况）
    if (fs.existsSync(resolved)) {
      return resolved
    }

    throw new Error(`Cannot resolve module: ${specifier} from ${fromDir}`)
  }

  // 外部模块（node_modules）
  // 简化处理，返回原始标识符
  return specifier
}

/**
 * 判断是否为外部模块
 */
function isExternalModule(specifier) {
  return !specifier.startsWith('.') && !specifier.startsWith('/')
}

// ============================================
// 第三部分：依赖图构建
// ============================================

/**
 * 构建依赖图
 * 从入口开始，递归解析所有模块
 * @param {string} entryPath - 入口文件路径
 * @returns {Array} 模块数组（拓扑排序）
 */
function buildDependencyGraph(entryPath) {
  const absoluteEntry = path.resolve(entryPath)
  const entryModule = parseModule(absoluteEntry)

  // 广度优先遍历
  const moduleQueue = [entryModule]
  const moduleMap = new Map()  // filePath -> module
  moduleMap.set(absoluteEntry, entryModule)

  for (const module of moduleQueue) {
    const dirname = path.dirname(module.filePath)

    // 存储依赖映射：相对路径 -> 模块 ID
    module.mapping = {}

    for (const dep of module.dependencies) {
      // 跳过外部模块
      if (isExternalModule(dep)) {
        module.mapping[dep] = null  // null 表示外部依赖
        continue
      }

      // 解析依赖的绝对路径
      const depPath = resolveModule(dep, dirname)

      // 避免重复解析
      if (moduleMap.has(depPath)) {
        module.mapping[dep] = moduleMap.get(depPath).id
        continue
      }

      // 解析新的依赖模块
      const depModule = parseModule(depPath)
      moduleMap.set(depPath, depModule)
      moduleQueue.push(depModule)
      module.mapping[dep] = depModule.id
    }
  }

  // 返回模块数组
  return Array.from(moduleMap.values())
}

// ============================================
// 第四部分：代码生成
// ============================================

/**
 * 生成打包后的代码
 * @param {Array} modules - 模块数组
 * @returns {string} 打包后的代码
 */
function generateBundle(modules) {
  // 生成模块定义
  let modulesCode = ''

  for (const mod of modules) {
    // 每个模块包装为 [factory, mapping] 格式
    // factory 是模块工厂函数
    // mapping 是依赖映射表
    modulesCode += `
    // ${mod.filePath}
    ${mod.id}: [
      function(module, exports, require) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)}
    ],`
  }

  // 生成运行时代码
  const runtime = `
// Mini Bundler 输出
// 生成时间: ${new Date().toISOString()}

(function(modules) {
  // 模块缓存
  const cache = {}

  // 自定义 require 函数
  function require(id) {
    // 如果是外部模块（id 为 null），使用原生 require
    if (id === null) {
      throw new Error('External module should be loaded via native require')
    }

    // 检查缓存
    if (cache[id]) {
      return cache[id].exports
    }

    // 获取模块定义
    const [factory, mapping] = modules[id]

    // 创建模块对象
    const module = {
      exports: {}
    }

    // 缓存模块（处理循环依赖）
    cache[id] = module

    // 创建本地 require 函数
    // 将相对路径映射为模块 ID
    function localRequire(name) {
      const mappedId = mapping[name]

      // 外部模块
      if (mappedId === null) {
        // 在实际环境中，这里应该使用 native require
        // 为了演示，我们抛出错误
        if (typeof window === 'undefined') {
          return require(name)  // Node.js 环境
        }
        throw new Error(\`External module not available: \${name}\`)
      }

      return require(mappedId)
    }

    // 执行模块工厂函数
    factory(module, module.exports, localRequire)

    return module.exports
  }

  // 执行入口模块（ID 为 0）
  require(0)

})({${modulesCode}
})
`

  return runtime
}

// ============================================
// 第五部分：主入口
// ============================================

/**
 * 打包入口
 * @param {string} entryPath - 入口文件路径
 * @param {string} outputPath - 输出文件路径
 */
function bundle(entryPath, outputPath) {
  console.log(`\n📦 Mini Bundler`)
  console.log(`   Entry: ${entryPath}`)
  console.log(`   Output: ${outputPath}\n`)

  // 1. 构建依赖图
  console.log('1. Building dependency graph...')
  const modules = buildDependencyGraph(entryPath)
  console.log(`   Found ${modules.length} modules:`)
  for (const mod of modules) {
    console.log(`   - [${mod.id}] ${path.relative(process.cwd(), mod.filePath)}`)
    console.log(`         Deps: ${mod.dependencies.join(', ') || '(none)'}`)
  }

  // 2. 生成打包代码
  console.log('\n2. Generating bundle...')
  const bundledCode = generateBundle(modules)

  // 3. 写入文件
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  fs.writeFileSync(outputPath, bundledCode, 'utf-8')

  // 4. 输出统计
  const stats = fs.statSync(outputPath)
  console.log(`\n3. Bundle stats:`)
  console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`)
  console.log(`   Modules: ${modules.length}`)

  console.log(`\n✅ Bundle created successfully!`)
  console.log(`   ${outputPath}\n`)

  return { modules, code: bundledCode }
}

// 导出 API
export {
  bundle,
  parseModule,
  buildDependencyGraph,
  generateBundle,
  resolveModule
}

// CLI 支持
if (process.argv[2]) {
  const entry = process.argv[2]
  const output = process.argv[3] || './dist/bundle.js'
  bundle(entry, output)
}
```

让我们用一个例子测试这个 Mini Bundler：

```javascript
// src/index.js - 入口文件
import { add, multiply } from './math.js'
import { formatResult } from './utils/format.js'

const result = add(2, 3)
console.log(formatResult('2 + 3', result))
console.log(formatResult('2 * 3', multiply(2, 3)))
```

```javascript
// src/math.js - 数学工具
export function add(a, b) {
  return a + b
}

export function multiply(a, b) {
  return a * b
}

export function subtract(a, b) {
  return a - b
}
```

```javascript
// src/utils/format.js - 格式化工具
export function formatResult(expression, result) {
  return `${expression} = ${result}`
}
```

运行打包：

```bash
node mini-bundler.js src/index.js dist/bundle.js
```

输出：

```
📦 Mini Bundler
   Entry: src/index.js
   Output: dist/bundle.js

1. Building dependency graph...
   Found 3 modules:
   - [0] src/index.js
         Deps: ./math.js, ./utils/format.js
   - [1] src/math.js
         Deps: (none)
   - [2] src/utils/format.js
         Deps: (none)

2. Generating bundle...

3. Bundle stats:
   Size: 1.84 KB
   Modules: 3

✅ Bundle created successfully!
   dist/bundle.js
```

### 2.2 AST 依赖分析深入

上面的代码使用 Babel 进行解析。让我们更深入地看看 AST 依赖分析的细节。

ES Module 的依赖信息主要来自以下 AST 节点类型：

```javascript
// 1. ImportDeclaration - 静态导入
import defaultExport from './module.js'
import { named } from './module.js'
import * as namespace from './module.js'

// 2. ExportNamedDeclaration - 具名导出（可能包含 re-export）
export { foo } from './module.js'
export { default as foo } from './module.js'

// 3. ExportAllDeclaration - 星号导出
export * from './module.js'
export * as name from './module.js'

// 4. ImportExpression - 动态导入
const mod = await import('./module.js')
```

下面是一个更完整的依赖提取实现：

```javascript
/**
 * 从 AST 中提取所有依赖信息
 * 返回结构化的依赖对象
 */
function extractDependencies(ast, filePath) {
  const result = {
    // 静态导入
    staticImports: [],
    // 动态导入
    dynamicImports: [],
    // Re-export
    reExports: [],
    // CommonJS require（用于分析混合代码）
    requires: [],
    // 导出信息
    exports: {
      named: [],      // export { foo }
      default: false, // export default
      star: []        // export * from
    }
  }

  traverse.default(ast, {
    // ===== 导入 =====

    ImportDeclaration({ node }) {
      const specifier = node.source.value

      // 提取导入的具体绑定
      const bindings = node.specifiers.map(spec => {
        switch (spec.type) {
          case 'ImportDefaultSpecifier':
            return {
              type: 'default',
              local: spec.local.name,
              imported: 'default'
            }
          case 'ImportNamespaceSpecifier':
            return {
              type: 'namespace',
              local: spec.local.name,
              imported: '*'
            }
          case 'ImportSpecifier':
            return {
              type: 'named',
              local: spec.local.name,
              imported: spec.imported.name
            }
        }
      })

      result.staticImports.push({
        specifier,
        bindings,
        // 位置信息用于 source map 和错误报告
        loc: {
          start: node.loc.start,
          end: node.loc.end
        }
      })
    },

    // 动态 import()
    ImportExpression({ node }) {
      const source = node.source

      if (source.type === 'StringLiteral') {
        // 静态字符串
        result.dynamicImports.push({
          specifier: source.value,
          isDynamic: false,
          loc: node.loc
        })
      } else {
        // 动态表达式，无法静态分析
        result.dynamicImports.push({
          specifier: null,
          isDynamic: true,
          expression: source,
          loc: node.loc
        })
      }
    },

    // ===== 导出 =====

    ExportNamedDeclaration({ node }) {
      // export { foo, bar as baz }
      for (const spec of node.specifiers || []) {
        result.exports.named.push({
          exported: spec.exported.name,
          local: spec.local.name
        })
      }

      // export const x = 1 / export function foo() {}
      if (node.declaration) {
        const decl = node.declaration
        if (decl.declarations) {
          // VariableDeclaration
          for (const d of decl.declarations) {
            result.exports.named.push({
              exported: d.id.name,
              local: d.id.name
            })
          }
        } else if (decl.id) {
          // FunctionDeclaration / ClassDeclaration
          result.exports.named.push({
            exported: decl.id.name,
            local: decl.id.name
          })
        }
      }

      // export { foo } from './module'
      if (node.source) {
        result.reExports.push({
          specifier: node.source.value,
          bindings: node.specifiers.map(spec => ({
            exported: spec.exported.name,
            imported: spec.local.name
          })),
          loc: node.loc
        })
      }
    },

    ExportDefaultDeclaration({ node }) {
      result.exports.default = true
    },

    ExportAllDeclaration({ node }) {
      result.exports.star.push({
        specifier: node.source.value,
        as: node.exported?.name || null
      })

      result.reExports.push({
        specifier: node.source.value,
        bindings: '*',
        as: node.exported?.name,
        loc: node.loc
      })
    },

    // ===== CommonJS =====

    CallExpression({ node }) {
      // require('module')
      if (node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments[0]?.type === 'StringLiteral') {
        result.requires.push({
          specifier: node.arguments[0].value,
          loc: node.loc
        })
      }
    }
  })

  return result
}
```

### 2.3 Tree Shaking 简化实现

Tree Shaking 的核心是**标记-清除算法**：

1. **标记阶段**：从入口点开始，标记所有"活"的导出
2. **清除阶段**：移除所有未标记的代码

下面是一个简化的 Tree Shaking 实现：

```javascript
/**
 * 简化的 Tree Shaking 实现
 * 核心思想：追踪哪些导出被使用了
 */
class TreeShaker {
  constructor() {
    this.modules = new Map()       // moduleId -> ModuleInfo
    this.usedExports = new Map()   // moduleId -> Set<exportName>
    this.sideEffectModules = new Set()
  }

  /**
   * 添加模块到分析器
   */
  addModule(moduleInfo) {
    this.modules.set(moduleInfo.id, moduleInfo)

    // 分析模块导出
    moduleInfo.exportMap = new Map()

    for (const exp of moduleInfo.exports) {
      if (exp.type === 'named' || exp.type === 'default') {
        moduleInfo.exportMap.set(exp.name, {
          type: exp.type,
          local: exp.local,
          // 追踪导出来源（本地声明 or re-export）
          source: exp.from || null
        })
      }
    }

    // 检测副作用
    moduleInfo.hasSideEffects = this.detectSideEffects(moduleInfo)
  }

  /**
   * 检测模块是否有副作用
   * 副作用包括：顶层函数调用、全局变量修改等
   */
  detectSideEffects(moduleInfo) {
    const { ast } = moduleInfo

    let hasSideEffects = false

    traverse.default(ast, {
      // 顶层表达式语句可能有副作用
      ExpressionStatement(path) {
        // 只检查顶层
        if (path.parent.type === 'Program') {
          const expr = path.node.expression

          // 函数调用
          if (expr.type === 'CallExpression') {
            hasSideEffects = true
          }

          // 赋值表达式
          if (expr.type === 'AssignmentExpression') {
            // 检查是否是全局变量赋值
            const left = expr.left
            if (left.type === 'Identifier') {
              // 简化判断：非 const/let/var 声明的赋值
              hasSideEffects = true
            }
            if (left.type === 'MemberExpression') {
              // window.foo = ... / global.bar = ...
              hasSideEffects = true
            }
          }
        }
      }
    })

    return hasSideEffects
  }

  /**
   * 从入口开始标记使用的导出
   */
  markFromEntry(entryId) {
    const entryModule = this.modules.get(entryId)

    // 入口模块的所有导出都被认为"使用"
    const allExports = Array.from(entryModule.exportMap.keys())
    this.markUsed(entryId, allExports)
  }

  /**
   * 标记模块的导出为已使用
   */
  markUsed(moduleId, exportNames) {
    // 初始化集合
    if (!this.usedExports.has(moduleId)) {
      this.usedExports.set(moduleId, new Set())
    }

    const used = this.usedExports.get(moduleId)
    const module = this.modules.get(moduleId)

    for (const name of exportNames) {
      if (used.has(name)) continue  // 已处理
      used.add(name)

      // 查找导出定义
      const exportInfo = module.exportMap.get(name)
      if (!exportInfo) continue

      // 如果是 re-export，递归标记源模块
      if (exportInfo.source) {
        const sourceModule = this.findModuleBySpecifier(module, exportInfo.source)
        if (sourceModule) {
          this.markUsed(sourceModule.id, [exportInfo.local])
        }
      }

      // 追踪本地导出引用的导入
      this.traceImports(module, exportInfo.local)
    }

    // 如果模块有副作用，标记为必须包含
    if (module.hasSideEffects) {
      this.sideEffectModules.add(moduleId)
    }
  }

  /**
   * 追踪导出绑定使用的导入
   */
  traceImports(module, localName) {
    // 简化实现：标记该模块所有导入的模块
    // 完整实现需要进行作用域分析

    for (const imp of module.imports || []) {
      // 检查导入的绑定是否被使用
      for (const binding of imp.bindings || []) {
        if (binding.local === localName) {
          const sourceModule = this.findModuleBySpecifier(module, imp.specifier)
          if (sourceModule) {
            // 标记使用的具体导出
            const usedExport = binding.imported === 'default'
              ? 'default'
              : binding.imported
            this.markUsed(sourceModule.id, [usedExport])
          }
        }
      }
    }
  }

  /**
   * 根据模块说明符查找模块
   */
  findModuleBySpecifier(fromModule, specifier) {
    const targetId = fromModule.mapping?.[specifier]
    if (targetId !== undefined && targetId !== null) {
      return this.modules.get(targetId)
    }
    return null
  }

  /**
   * 获取 Shake 后的结果
   */
  getShakeResult() {
    const includedModules = []
    const excludedExports = new Map()

    for (const [moduleId, module] of this.modules) {
      const used = this.usedExports.get(moduleId) || new Set()
      const hasSideEffects = this.sideEffectModules.has(moduleId)

      // 包含条件：有使用的导出 OR 有副作用
      if (used.size > 0 || hasSideEffects) {
        includedModules.push({
          id: moduleId,
          path: module.filePath,
          usedExports: Array.from(used),
          hasSideEffects
        })

        // 记录未使用的导出
        const allExports = Array.from(module.exportMap.keys())
        const unused = allExports.filter(e => !used.has(e))
        if (unused.length > 0) {
          excludedExports.set(moduleId, unused)
        }
      }
    }

    return {
      includedModules,
      excludedExports,
      stats: {
        totalModules: this.modules.size,
        includedModules: includedModules.length,
        removedModules: this.modules.size - includedModules.length
      }
    }
  }
}

// 使用示例
function performTreeShaking(modules, entryId) {
  const shaker = new TreeShaker()

  // 添加所有模块
  for (const mod of modules) {
    shaker.addModule(mod)
  }

  // 从入口开始标记
  shaker.markFromEntry(entryId)

  // 获取结果
  return shaker.getShakeResult()
}
```

### 2.4 作用域分析核心思路

作用域分析是 Tree Shaking 和变量重命名的基础。核心挑战是正确处理 JavaScript 的作用域规则：

```javascript
/**
 * 作用域分析器
 * 构建作用域树，追踪变量的声明和引用
 */
class ScopeAnalyzer {
  constructor() {
    this.scopes = []
    this.currentScope = null
  }

  /**
   * 分析 AST，构建作用域树
   */
  analyze(ast) {
    // 创建全局/模块作用域
    this.currentScope = this.createScope('module', null)

    traverse.default(ast, {
      // ===== 作用域边界 =====

      // 函数创建新作用域
      FunctionDeclaration: (path) => {
        this.enterFunctionScope(path)
      },
      'FunctionDeclaration:exit': () => {
        this.exitScope()
      },

      FunctionExpression: (path) => {
        this.enterFunctionScope(path)
      },
      'FunctionExpression:exit': () => {
        this.exitScope()
      },

      ArrowFunctionExpression: (path) => {
        this.enterFunctionScope(path)
      },
      'ArrowFunctionExpression:exit': () => {
        this.exitScope()
      },

      // 块级作用域（if、for、while 等）
      BlockStatement: (path) => {
        // 只有包含 let/const 声明时才创建块级作用域
        if (this.hasBlockScopedDeclarations(path.node)) {
          this.enterBlockScope(path)
        }
      },
      'BlockStatement:exit': (path) => {
        if (this.hasBlockScopedDeclarations(path.node)) {
          this.exitScope()
        }
      },

      // ===== 声明 =====

      VariableDeclaration: (path) => {
        const kind = path.node.kind  // var, let, const

        for (const decl of path.node.declarations) {
          this.declareBinding(decl.id, kind, path)
        }
      },

      FunctionDeclaration: (path) => {
        if (path.node.id) {
          // 函数声明提升到外层作用域
          this.declareBinding(path.node.id, 'function', path)
        }
      },

      ClassDeclaration: (path) => {
        if (path.node.id) {
          this.declareBinding(path.node.id, 'class', path)
        }
      },

      ImportDeclaration: (path) => {
        for (const spec of path.node.specifiers) {
          this.declareBinding(spec.local, 'import', path)
        }
      },

      // ===== 引用 =====

      Identifier: (path) => {
        if (this.isReference(path)) {
          this.recordReference(path.node.name, path)
        }
      }
    })

    return this.scopes
  }

  /**
   * 创建新作用域
   */
  createScope(type, parent) {
    const scope = {
      id: this.scopes.length,
      type,           // 'module', 'function', 'block'
      parent,
      children: [],
      bindings: new Map(),    // name -> BindingInfo
      references: [],         // 引用列表
      // 统计信息
      stats: {
        declarations: 0,
        references: 0
      }
    }

    if (parent) {
      parent.children.push(scope)
    }

    this.scopes.push(scope)
    return scope
  }

  /**
   * 进入函数作用域
   */
  enterFunctionScope(path) {
    const scope = this.createScope('function', this.currentScope)
    this.currentScope = scope

    // 函数参数作为绑定
    for (const param of path.node.params || []) {
      this.declarePattern(param, 'param')
    }
  }

  /**
   * 进入块级作用域
   */
  enterBlockScope(path) {
    const scope = this.createScope('block', this.currentScope)
    this.currentScope = scope
  }

  /**
   * 退出当前作用域
   */
  exitScope() {
    this.currentScope = this.currentScope.parent
  }

  /**
   * 声明绑定
   */
  declareBinding(id, kind, path) {
    const name = id.name

    // var 声明提升到函数作用域
    const targetScope = kind === 'var'
      ? this.findFunctionScope()
      : this.currentScope

    // 创建绑定信息
    const binding = {
      name,
      kind,           // 'var', 'let', 'const', 'function', 'class', 'param', 'import'
      node: id,
      path,
      scope: targetScope,
      references: [],
      isExported: false,
      isUsed: false
    }

    targetScope.bindings.set(name, binding)
    targetScope.stats.declarations++

    return binding
  }

  /**
   * 处理解构模式
   */
  declarePattern(pattern, kind) {
    switch (pattern.type) {
      case 'Identifier':
        this.declareBinding(pattern, kind, null)
        break

      case 'ObjectPattern':
        for (const prop of pattern.properties) {
          if (prop.type === 'RestElement') {
            this.declarePattern(prop.argument, kind)
          } else {
            this.declarePattern(prop.value, kind)
          }
        }
        break

      case 'ArrayPattern':
        for (const element of pattern.elements) {
          if (element) {
            if (element.type === 'RestElement') {
              this.declarePattern(element.argument, kind)
            } else {
              this.declarePattern(element, kind)
            }
          }
        }
        break

      case 'AssignmentPattern':
        this.declarePattern(pattern.left, kind)
        break

      case 'RestElement':
        this.declarePattern(pattern.argument, kind)
        break
    }
  }

  /**
   * 记录变量引用
   */
  recordReference(name, path) {
    // 从当前作用域向上查找绑定
    let scope = this.currentScope

    while (scope) {
      const binding = scope.bindings.get(name)
      if (binding) {
        binding.references.push(path)
        binding.isUsed = true
        scope.stats.references++
        return
      }
      scope = scope.parent
    }

    // 未找到绑定，是全局变量引用
    this.currentScope.references.push({
      name,
      path,
      isGlobal: true
    })
  }

  /**
   * 判断 Identifier 是否为引用（而非声明）
   */
  isReference(path) {
    const parent = path.parent
    const node = path.node

    // 声明的左侧
    if (parent.type === 'VariableDeclarator' && parent.id === node) {
      return false
    }

    // 函数声明名称
    if (parent.type === 'FunctionDeclaration' && parent.id === node) {
      return false
    }

    // 类声明名称
    if (parent.type === 'ClassDeclaration' && parent.id === node) {
      return false
    }

    // 对象属性键（非计算属性）
    if (parent.type === 'Property' && parent.key === node && !parent.computed) {
      return false
    }

    // 对象方法名
    if (parent.type === 'MethodDefinition' && parent.key === node && !parent.computed) {
      return false
    }

    // 成员访问的属性（非计算）
    if (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) {
      return false
    }

    // import 语句中的导入名
    if (parent.type === 'ImportSpecifier' && parent.imported === node) {
      return false
    }

    // export 语句中的导出名
    if (parent.type === 'ExportSpecifier' && parent.exported === node) {
      return false
    }

    return true
  }

  /**
   * 查找最近的函数作用域
   */
  findFunctionScope() {
    let scope = this.currentScope
    while (scope && scope.type === 'block') {
      scope = scope.parent
    }
    return scope || this.currentScope
  }

  /**
   * 检查块是否包含块级作用域声明
   */
  hasBlockScopedDeclarations(block) {
    for (const stmt of block.body) {
      if (stmt.type === 'VariableDeclaration' &&
          (stmt.kind === 'let' || stmt.kind === 'const')) {
        return true
      }
    }
    return false
  }

  /**
   * 获取未使用的绑定
   */
  getUnusedBindings() {
    const unused = []

    for (const scope of this.scopes) {
      for (const [name, binding] of scope.bindings) {
        if (!binding.isUsed && !binding.isExported) {
          unused.push({
            name,
            kind: binding.kind,
            scope: scope.type,
            loc: binding.node?.loc
          })
        }
      }
    }

    return unused
  }
}
```

---

## 第三章：robuild 完整架构设计

了解了 Bundler 的基本原理后，让我们深入 robuild 的架构设计。

### 3.1 核心设计原则

robuild 的设计遵循以下原则：

1. **零配置优先**：默认配置应该覆盖 90% 的使用场景
2. **渐进式复杂度**：简单任务简单做，复杂任务可配置
3. **兼容性**：支持 tsup 和 unbuild 的配置风格
4. **性能**：利用 Rust 工具链的性能优势
5. **可扩展**：插件系统支持自定义逻辑

### 3.2 架构总览

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLI Layer                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  cac（命令行解析）→ c12（配置加载）→ build()              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                        Config Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ normalizeTsup   │  │ inheritConfig   │  │ resolveExternal │  │
│  │ Config()       │→│      ()          │→│    Config()     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                        Build Layer                                │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐   │
│  │     rolldownBuild()         │  │    transformDir()       │   │
│  │  ┌─────────────────────┐    │  │  ┌─────────────────┐    │   │
│  │  │ Rolldown + DTS Plugin│   │  │  │ Oxc Transform   │    │   │
│  │  └─────────────────────┘    │  │  └─────────────────┘    │   │
│  └─────────────────────────────┘  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                       Plugin Layer                                │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  Shims    │  │  Shebang  │  │  Node     │  │  Glob     │    │
│  │  Plugin   │  │  Plugin   │  │  Protocol │  │  Import   │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                      Transform Layer                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  Banner   │  │  Clean    │  │  Copy     │  │  Exports  │    │
│  │  Footer   │  │  Output   │  │  Files    │  │  Generate │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 构建流程详解

robuild 的构建流程分为以下阶段：

```
                    build() 入口
                         │
          ┌──────────────┴──────────────┐
          ↓                             ↓
   normalizeTsupConfig()         performWatchBuild()
   (标准化配置格式)                  (Watch 模式)
          │
          ↓
   inheritConfig()
   (配置继承)
          │
          ↓
   ┌──────┴──────┐
   │   entries   │
   │   遍历      │
   └──────┬──────┘
          │
   ┌──────┴──────┬──────────────┐
   ↓             ↓              ↓
 Bundle       Transform      其他类型
 Entry        Entry          ...
   │             │
   ↓             ↓
rolldownBuild  transformDir
   │             │
   └──────┬──────┘
          ↓
   generateExports()
   (生成 package.json exports)
          │
          ↓
   executeOnSuccess()
   (执行回调)
```

让我们深入关键环节：

#### 3.3.1 配置标准化

robuild 支持两种配置风格：

```typescript
// tsup 风格（flat config）
export default {
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true
}

// unbuild 风格（entries-based）
export default {
  entries: [
    { type: 'bundle', input: './src/index.ts', format: ['esm', 'cjs'] },
    { type: 'transform', input: './src/' }
  ]
}
```

配置标准化的核心代码：

```typescript
// src/build.ts
function normalizeTsupConfig(config: BuildConfig): BuildConfig {
  // 如果已经有 entries，直接返回
  if (config.entries && config.entries.length > 0) {
    return config
  }

  // 将 tsup 风格的 entry 转换为 entries
  if (config.entry) {
    const entry: BundleEntry = inheritConfig(
      {
        type: 'bundle' as const,
        entry: config.entry,
      },
      config,
      { name: 'globalName' } // 字段映射
    )
    return { ...config, entries: [entry] }
  }

  return config
}
```

#### 3.3.2 配置继承

顶层配置需要向下传递给每个 entry：

```typescript
const SHARED_CONFIG_FIELDS = [
  'format', 'outDir', 'platform', 'target', 'minify',
  'dts', 'splitting', 'treeshake', 'sourcemap',
  'external', 'noExternal', 'env', 'alias', 'banner',
  'footer', 'shims', 'rolldown', 'loaders', 'clean'
] as const

function inheritConfig<T extends Partial<BuildEntry>>(
  entry: T,
  config: BuildConfig,
  additionalMappings?: Record<string, string>
): T {
  const result: any = { ...entry }

  // 只继承未定义的字段
  for (const field of SHARED_CONFIG_FIELDS) {
    if (result[field] === undefined && config[field] !== undefined) {
      result[field] = config[field]
    }
  }

  // 处理字段映射（如 name -> globalName）
  if (additionalMappings) {
    for (const [configKey, entryKey] of Object.entries(additionalMappings)) {
      if (result[entryKey] === undefined) {
        result[entryKey] = (config as any)[configKey]
      }
    }
  }

  return result
}
```

#### 3.3.3 并行构建

所有 entries 并行构建，提升性能：

```typescript
await Promise.all(
  entries.map(entry =>
    entry.type === 'bundle'
      ? rolldownBuild(ctx, entry, hooks, config)
      : transformDir(ctx, entry)
  )
)
```

### 3.4 Bundle Builder 实现

Bundle Builder 是 robuild 的核心，它封装了 Rolldown 的调用：

```typescript
// src/builders/bundle.ts
export async function rolldownBuild(
  ctx: BuildContext,
  entry: BundleEntry,
  hooks: BuildHooks,
  config?: BuildConfig
): Promise<void> {
  // 1. 初始化插件管理器
  const pluginManager = new RobuildPluginManager(config || {}, entry, ctx.pkgDir)
  await pluginManager.initializeRobuildHooks()

  // 2. 解析配置
  const formats = Array.isArray(entry.format) ? entry.format : [entry.format || 'es']
  const platform = entry.platform || 'node'
  const target = entry.target || 'es2022'

  // 3. 清理输出目录
  await cleanOutputDir(ctx.pkgDir, fullOutDir, entry.clean ?? true)

  // 4. 处理外部依赖
  const externalConfig = resolveExternalConfig(ctx, {
    external: entry.external,
    noExternal: entry.noExternal
  })

  // 5. 构建插件列表
  const rolldownPlugins: Plugin[] = [
    shebangPlugin(),
    nodeProtocolPlugin(entry.nodeProtocol || false),
    // ... 其他插件
  ]

  // 6. 构建 Rolldown 配置
  const baseRolldownConfig: InputOptions = {
    cwd: ctx.pkgDir,
    input: inputs,
    plugins: rolldownPlugins,
    platform: platform === 'node' ? 'node' : 'neutral',
    external: externalConfig,
    resolve: { alias: entry.alias || {} },
    transform: { target, define: defineOptions }
  }

  // 7. 所有格式并行构建
  const formatResults = await Promise.all(formats.map(buildFormat))

  // 8. 执行构建结束钩子
  await pluginManager.executeRobuildBuildEnd({ allOutputEntries })
}
```

关键设计点：

**多格式构建**：ESM、CJS、IIFE 等格式同时构建，通过不同的文件扩展名避免冲突：

```typescript
const buildFormat = async (format: ModuleFormat) => {
  let entryFileName = `[name]${extension}`

  if (isMultiFormat) {
    // 多格式构建时使用明确的扩展名
    if (format === 'cjs') entryFileName = `[name].cjs`
    else if (format === 'esm') entryFileName = `[name].mjs`
    else if (format === 'iife') entryFileName = `[name].js`
  }

  const res = await rolldown(formatConfig)
  await res.write(outConfig)
  await res.close()
}
```

**DTS 生成策略**：只在 ESM 格式下生成类型声明，避免冲突：

```typescript
if (entry.dts !== false && format === 'esm') {
  formatConfig.plugins = [
    ...plugins,
    dts({ cwd: ctx.pkgDir, ...entry.dts })
  ]
}
```

### 3.5 Transform Builder 实现

Transform Builder 用于不打包的场景，保持目录结构：

```typescript
// src/builders/transform.ts
export async function transformDir(
  ctx: BuildContext,
  entry: TransformEntry
): Promise<void> {
  // 获取所有源文件
  const files = await glob('**/*.*', { cwd: inputDir })

  const promises = files.map(async (entryName) => {
    const ext = extname(entryPath)

    switch (ext) {
      case '.ts':
      case '.tsx':
      case '.jsx': {
        // 使用 Oxc 转换
        const transformed = await transformModule(entryPath, entry)
        await writeFile(entryDistPath, transformed.code, 'utf8')

        // 生成类型声明
        if (transformed.declaration) {
          await writeFile(dtsPath, transformed.declaration, 'utf8')
        }
        break
      }
      default:
        // 其他文件直接复制
        await copyFile(entryPath, entryDistPath)
    }
  })

  await Promise.all(promises)
}
```

单文件转换使用 Oxc：

```typescript
async function transformModule(entryPath: string, entry: TransformEntry) {
  const sourceText = await readFile(entryPath, 'utf8')

  // 1. 解析 AST
  const parsed = parseSync(entryPath, sourceText, {
    lang: ext === '.tsx' ? 'tsx' : 'ts',
    sourceType: 'module'
  })

  // 2. 重写相对导入（使用 MagicString 保持 sourcemap 兼容）
  const magicString = new MagicString(sourceText)
  for (const staticImport of parsed.module.staticImports) {
    // 将 .ts 导入重写为 .mjs
    rewriteSpecifier(staticImport.moduleRequest)
  }

  // 3. Oxc 转换
  const transformed = await transform(entryPath, magicString.toString(), {
    target: entry.target || 'es2022',
    sourcemap: !!entry.sourcemap,
    typescript: {
      declaration: { stripInternal: true }
    }
  })

  // 4. 可选压缩
  if (entry.minify) {
    const res = await minify(entryPath, transformed.code, entry.minify)
    transformed.code = res.code
  }

  return transformed
}
```

---

## 第四章：ESM/CJS 互操作处理

ESM 和 CJS 的互操作是库构建中最复杂的问题之一。让我详细解释 robuild 是如何处理的。

### 4.1 问题背景

ESM 和 CJS 有根本性的差异：

| 特性 | ESM | CJS |
|------|-----|-----|
| 加载时机 | 静态（编译时） | 动态（运行时） |
| 导出方式 | 具名绑定 | `module.exports` 对象 |
| this 值 | undefined | module |
| __dirname | 不可用 | 可用 |
| require | 不可用 | 可用 |
| 顶层 await | 支持 | 不支持 |

### 4.2 Shims 插件设计

robuild 通过 Shims 插件解决兼容问题：

```typescript
// ESM 中使用 CJS 特性时的 shim
const NODE_GLOBALS_SHIM = `
// Node.js globals shim for ESM
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createRequire } from 'node:module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
`

// 浏览器环境的 process.env shim
const PROCESS_ENV_SHIM = `
if (typeof process === 'undefined') {
  globalThis.process = {
    env: {},
    platform: 'browser',
    version: '0.0.0'
  }
}
`

// module.exports shim
const MODULE_EXPORTS_SHIM = `
if (typeof module === 'undefined') {
  globalThis.module = { exports: {} }
}
if (typeof exports === 'undefined') {
  globalThis.exports = module.exports
}
`
```

关键是**检测需要哪些 shim**：

```typescript
function detectShimNeeds(code: string) {
  // 移除注释和字符串，避免误判
  const cleanCode = removeCommentsAndStrings(code)

  return {
    needsDirname: /\b__dirname\b/.test(cleanCode) ||
                  /\b__filename\b/.test(cleanCode),
    needsRequire: /\brequire\s*\(/.test(cleanCode),
    needsExports: /\bmodule\.exports\b/.test(cleanCode) ||
                  /\bexports\.\w+/.test(cleanCode),
    needsEnv: /\bprocess\.env\b/.test(cleanCode)
  }
}

function removeCommentsAndStrings(code: string): string {
  return code
    // 移除单行注释
    .replace(/\/\/.*$/gm, '')
    // 移除多行注释
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // 移除字符串字面量
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
}
```

### 4.3 平台特定配置

不同平台需要不同的 shim 策略：

```typescript
function getPlatformShimsConfig(platform: 'browser' | 'node' | 'neutral') {
  switch (platform) {
    case 'browser':
      return {
        dirname: false,  // 浏览器不支持
        require: false,  // 浏览器不支持
        exports: false,  // 浏览器不支持
        env: true        // 需要 polyfill
      }
    case 'node':
      return {
        dirname: true,   // 转换为 ESM 等价写法
        require: true,   // 使用 createRequire
        exports: true,   // 转换为 ESM export
        env: false       // 原生支持
      }
    case 'neutral':
      return {
        dirname: false,
        require: false,
        exports: false,
        env: false
      }
  }
}
```

### 4.4 Dual Package 支持

对于同时支持 ESM 和 CJS 的包，robuild 自动生成正确的 exports 字段：

```typescript
// 输入配置
{
  entries: [{
    type: 'bundle',
    input: './src/index.ts',
    format: ['esm', 'cjs'],
    generateExports: true
  }]
}

// 生成的 package.json exports
{
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",  // TypeScript 优先
      "import": "./dist/index.mjs",    // ESM
      "require": "./dist/index.cjs"    // CJS
    }
  }
}
```

顺序很重要：`types` 必须在最前面，这是 TypeScript 的要求。

---

## 第五章：插件系统设计哲学

### 5.1 设计目标

robuild 的插件系统需要满足：

1. **兼容性**：支持 Rolldown、Rollup、Vite、Unplugin 插件
2. **简洁性**：简单需求不需要复杂配置
3. **可组合**：多个插件可以组合成一个
4. **生命周期明确**：robuild 特有的钩子

### 5.2 插件类型检测

robuild 自动识别插件类型：

```typescript
class RobuildPluginManager {
  private normalizePlugin(pluginOption: RobuildPluginOption): RobuildPlugin {
    // 工厂函数
    if (typeof pluginOption === 'function') {
      return this.normalizePlugin(pluginOption())
    }

    // 类型检测优先级
    if (this.isRobuildPlugin(pluginOption)) return pluginOption
    if (this.isRolldownPlugin(pluginOption)) return this.adaptRolldownPlugin(pluginOption)
    if (this.isVitePlugin(pluginOption)) return this.adaptVitePlugin(pluginOption)
    if (this.isUnplugin(pluginOption)) return this.adaptUnplugin(pluginOption)

    // 兜底：当作 Rolldown 插件
    return this.adaptRolldownPlugin(pluginOption)
  }

  // Robuild 插件：有 robuild 特有钩子或标记
  private isRobuildPlugin(plugin: any): plugin is RobuildPlugin {
    return plugin.meta?.robuild === true
      || plugin.robuildSetup
      || plugin.robuildBuildStart
      || plugin.robuildBuildEnd
  }

  // Rolldown/Rollup 插件：有标准钩子
  private isRolldownPlugin(plugin: any): plugin is RolldownPlugin {
    return plugin.name && (
      plugin.buildStart || plugin.buildEnd ||
      plugin.resolveId || plugin.load || plugin.transform ||
      plugin.generateBundle || plugin.writeBundle
    )
  }

  // Vite 插件：有 Vite 特有钩子
  private isVitePlugin(plugin: any): boolean {
    return plugin.config || plugin.configResolved ||
           plugin.configureServer || plugin.meta?.vite === true
  }
}
```

### 5.3 Robuild 特有钩子

除了 Rolldown 标准钩子，robuild 添加了三个生命周期钩子：

```typescript
interface RobuildPlugin extends RolldownPlugin {
  // 插件初始化时调用
  robuildSetup?: (ctx: RobuildPluginContext) => void | Promise<void>

  // 构建开始时调用
  robuildBuildStart?: (ctx: RobuildPluginContext) => void | Promise<void>

  // 构建结束时调用，可以访问所有输出
  robuildBuildEnd?: (ctx: RobuildPluginContext, result?: any) => void | Promise<void>
}

interface RobuildPluginContext {
  config: BuildConfig
  entry: BuildEntry
  pkgDir: string
  outDir: string
  format: ModuleFormat | ModuleFormat[]
  platform: Platform
  target: Target
}
```

### 5.4 插件工厂模式

robuild 提供工厂函数简化插件创建：

```typescript
// 创建简单的 transform 插件
function createTransformPlugin(
  name: string,
  transform: (code: string, id: string) => string | null,
  filter?: (id: string) => boolean
): RobuildPlugin {
  return {
    name,
    meta: { robuild: true },
    transform: async (code, id) => {
      if (filter && !filter(id)) return null
      return transform(code, id)
    }
  }
}

// 使用示例
const myPlugin = createTransformPlugin(
  'add-banner',
  (code) => `/* My Library */\n${code}`,
  (id) => /\.js$/.test(id)
)
```

组合多个插件：

```typescript
function combinePlugins(name: string, plugins: RobuildPlugin[]): RobuildPlugin {
  const combined: RobuildPlugin = { name, meta: { robuild: true } }

  for (const plugin of plugins) {
    // 链式组合 transform 钩子
    if (plugin.transform) {
      const prevHook = combined.transform
      combined.transform = async (code, id) => {
        let currentCode = code
        if (prevHook) {
          const result = await prevHook(currentCode, id)
          if (result) {
            currentCode = typeof result === 'string' ? result : result.code
          }
        }
        return plugin.transform!(currentCode, id)
      }
    }

    // 其他钩子类似处理...
  }

  return combined
}
```

---

## 第六章：性能优化策略

### 6.1 为什么 Rust 更快？

robuild 使用的 Rolldown 和 Oxc 都是 Rust 实现的。Rust 带来的性能优势主要来自：

**1. 零成本抽象**

Rust 的泛型和 trait 在编译时单态化，没有运行时开销：

```rust
// Rust: 编译时展开，没有虚函数调用
fn process<T: Transform>(input: T) -> String {
    input.transform()
}

// 等价于为每个具体类型生成特化版本
fn process_for_type_a(input: TypeA) -> String { ... }
fn process_for_type_b(input: TypeB) -> String { ... }
```

**2. 无 GC 暂停**

JavaScript 的垃圾回收会导致不可预测的暂停。Rust 通过所有权系统在编译时确定内存释放时机：

```rust
// Rust: 编译器自动插入内存释放
{
    let ast = parse(source);  // 分配内存
    let result = transform(ast);
    // ast 在这里自动释放，无需 GC
}
```

**3. 数据局部性**

Rust 鼓励使用栈分配和连续内存，对 CPU 缓存更友好：

```rust
// 连续内存布局
struct Token {
    kind: TokenKind,
    start: u32,
    end: u32,
}
let tokens: Vec<Token> = tokenize(source);
// tokens 在连续内存中，缓存命中率高
```

**4. 真正的并行**

Rust 的类型系统保证线程安全，可以放心使用多核：

```rust
use rayon::prelude::*;

// 多个文件并行解析
let results: Vec<_> = files
    .par_iter()  // 并行迭代
    .map(|file| parse(file))
    .collect();
```

### 6.2 robuild 的并行策略

robuild 在多个层面实现并行：

**Entry 级并行**：所有 entry 同时构建

```typescript
await Promise.all(
  entries.map(entry =>
    entry.type === 'bundle'
      ? rolldownBuild(ctx, entry, hooks, config)
      : transformDir(ctx, entry)
  )
)
```

**Format 级并行**：ESM、CJS 等格式同时生成

```typescript
const formatResults = await Promise.all(formats.map(buildFormat))
```

**文件级并行**：Transform 模式下所有文件同时处理

```typescript
const writtenFiles = await Promise.all(promises)
```

### 6.3 缓存策略

robuild 在应用层做了一些优化：

**依赖缓存**：解析结果缓存

```typescript
// 依赖解析缓存
const depsCache = new Map<OutputChunk, Set<string>>()
const resolveDeps = (chunk: OutputChunk): string[] => {
  if (!depsCache.has(chunk)) {
    depsCache.set(chunk, new Set<string>())
  }
  const deps = depsCache.get(chunk)!
  // ... 递归解析
  return Array.from(deps).sort()
}
```

**外部模块判断缓存**：避免重复的包信息读取

```typescript
// 一次性构建外部依赖列表
const externalDeps = buildExternalDeps(ctx.pkg)
// 后续直接查表判断
```

---

## 第七章：为什么选择 Rust + JS 混合架构

### 7.1 架构选择的权衡

robuild 采用 Rust + JavaScript 混合架构。这个选择背后有深思熟虑的权衡：

**为什么不是纯 Rust？**

1. **生态兼容性**：npm 生态的插件都是 JavaScript，纯 Rust 无法复用
2. **配置灵活性**：JavaScript 配置文件可以动态计算、条件判断
3. **开发效率**：Rust 开发周期长，不利于快速迭代
4. **用户学习成本**：用户不需要学习 Rust 就能写插件

**为什么不是纯 JavaScript？**

1. **性能瓶颈**：AST 解析、转换、压缩都是 CPU 密集型任务
2. **内存效率**：大型项目的 AST 占用大量内存
3. **并行能力**：JavaScript 单线程无法利用多核

**最佳策略：计算密集型用 Rust，胶水层用 JavaScript**

```
┌─────────────────────────────────────────────────────────────┐
│                    JavaScript 层                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  配置加载、CLI、插件管理、构建编排、输出处理          │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                      NAPI 绑定                               │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Rust 层（计算密集型）                     │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │  │
│  │  │ Parser  │ │Transform│ │ Bundler │ │ Minifier│     │  │
│  │  │ (Oxc)   │ │ (Oxc)   │ │(Rolldown)│ │ (Oxc)  │     │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 NAPI 绑定的成本

Rust 和 JavaScript 之间通过 NAPI（Node-API）通信。这有一定开销：

1. **数据序列化**：JavaScript 对象转换为 Rust 结构
2. **跨边界调用**：每次调用有固定开销
3. **字符串复制**：UTF-8 字符串需要复制

因此，robuild 的设计原则是**减少跨边界调用次数**：

```typescript
// 好的做法：一次调用完成整个解析
const parsed = parseSync(filePath, sourceText, options)

// 不好的做法：多次调用
const ast = parse(source)
const imports = extractImports(ast)  // 又一次跨边界
const exports = extractExports(ast)  // 又一次跨边界
```

### 7.3 与 Vite 生态的协同

robuild 的架构设计与 Vite 生态高度契合：

1. **Rolldown 是 Vite 的未来打包器**：API 兼容 Rollup，便于迁移
2. **插件复用**：Vite 插件可以直接在 robuild 中使用
3. **配置兼容**：支持从 vite.config.ts 导入配置

```typescript
// robuild 可以加载 Vite 配置
export default {
  fromVite: true,  // 启用 Vite 配置加载
  // robuild 特有配置可以覆盖
  entries: [...]
}
```

---

## 第八章：实战案例与最佳实践

### 8.1 最简配置

对于标准的 TypeScript 库，零配置即可工作：

```typescript
// build.config.ts
export default {}

// 等价于
export default {
  entries: [{
    type: 'bundle',
    input: './src/index.ts',
    format: ['esm'],
    dts: true
  }]
}
```

### 8.2 多入口 + 多格式

```typescript
// build.config.ts
export default {
  entries: [
    {
      type: 'bundle',
      input: {
        index: './src/index.ts',
        cli: './src/cli.ts'
      },
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true
    }
  ],
  exports: {
    enabled: true,
    autoUpdate: true
  }
}
```

### 8.3 带 shims 的 Node.js 工具

```typescript
// build.config.ts
export default {
  entries: [{
    type: 'bundle',
    input: './src/index.ts',
    format: ['esm'],
    platform: 'node',
    shims: {
      dirname: true,   // __dirname, __filename
      require: true    // require()
    },
    banner: '#!/usr/bin/env node'
  }]
}
```

### 8.4 浏览器库 + UMD

```typescript
// build.config.ts
export default {
  entries: [{
    type: 'bundle',
    input: './src/index.ts',
    format: ['esm', 'umd'],
    platform: 'browser',
    globalName: 'MyLib',
    minify: true,
    shims: {
      env: true  // process.env polyfill
    }
  }]
}
```

### 8.5 Monorepo 内部包

```typescript
// build.config.ts
export default {
  entries: [{
    type: 'bundle',
    input: './src/index.ts',
    format: ['esm'],
    dts: true,
    noExternal: [
      '@myorg/utils',     // 打包内部依赖
      '@myorg/shared'
    ]
  }]
}
```

---

## 结语：构建工具的未来

回顾构建工具的三次革命：

1. **Webpack 时代**：解决了"如何打包复杂应用"
2. **Rollup 时代**：解决了"如何打包高质量的库"
3. **Rust Bundler 时代**：解决了"如何更快地完成这一切"

robuild 是这场革命的参与者。它基于 Rolldown + Oxc 的 Rust 基础设施，专注于库构建场景，追求零配置、高性能、与现有生态兼容。

但构建工具的演进远未结束。我们可以期待：

1. **更深的编译器集成**：bundler 与类型检查器、代码检查器的融合
2. **更智能的优化**：基于运行时 profile 的优化决策
3. **更好的开发体验**：更快的 HMR、更精准的错误提示
4. **WebAssembly 的普及**：让 Rust 工具链在浏览器中运行

构建工具的本质是将开发者的代码高效地转换为运行时需要的形态。技术在变，这个目标不变。作为工具开发者，我们的使命是让这个过程尽可能无感、高效、可靠。

感谢阅读。如果你对 robuild 感兴趣，欢迎查看 [项目仓库](https://github.com/Sunny-117/robuild)。

---

*本文约 10000 字，涵盖了构建工具演进、bundler 核心原理（含完整 mini bundler 代码）、robuild 架构设计、ESM/CJS 互操作、插件系统、性能优化等主题。如有技术问题，欢迎讨论交流。*

**参考资料**：

- [Rolldown 官方文档](https://rolldown.rs/)
- [Oxc 官方文档](https://oxc.rs/)
- [Rollup 插件开发指南](https://rollupjs.org/plugin-development/)
- [robuild 源码](https://github.com/Sunny-117/robuild)
