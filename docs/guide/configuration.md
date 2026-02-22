# 配置

## 配置文件

robuild 支持以下配置文件：

- `build.config.ts` (推荐)
- `build.config.mjs`
- `build.config.js`

## 基本配置

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
    },
  ],
})
```

## 全局配置

```typescript
export default defineConfig({
  // 工作目录
  cwd: '.',

  // 日志级别: 'silent' | 'error' | 'warn' | 'info' | 'verbose'
  logLevel: 'info',

  // 警告时失败
  failOnWarn: false,

  // 构建成功回调
  onSuccess: 'echo "Build completed!"',
  // 或函数
  onSuccess: (result) => {
    console.log('构建完成')
  },

  // 监听配置
  watch: {
    enabled: false,
    include: ['src/**/*'],
    exclude: ['**/*.test.ts'],
    delay: 100,
  },

  // 包导出生成
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },

  // 构建钩子
  hooks: {
    start: (ctx) => console.log('开始构建'),
    entries: (entries, ctx) => { /* 修改入口 */ },
    rolldownConfig: (config, ctx) => { /* 修改 rolldown 配置 */ },
    end: (ctx) => console.log('构建完成'),
  },
})
```

## Bundle 配置

```typescript
{
  type: 'bundle',
  input: './src/index.ts',        // 入口文件
  outDir: './dist',               // 输出目录

  // 输出格式
  format: ['esm', 'cjs'],         // esm, cjs, iife, umd
  platform: 'node',               // browser, node, neutral
  target: 'es2022',               // es2015, es2020, esnext
  globalName: 'MyLib',            // IIFE/UMD 全局变量名

  // 优化
  minify: false,                  // true | false | 'dce-only'
  sourcemap: false,               // true | 'inline' | 'hidden'
  splitting: false,               // 代码分割
  treeshake: true,                // Tree shaking

  // 类型声明
  dts: true,                      // 生成 .d.mts
  dtsOnly: false,                 // 仅生成类型声明

  // 依赖处理
  external: ['lodash'],           // 外部化依赖
  noExternal: ['some-pkg'],       // 强制打包
  skipNodeModules: false,         // 跳过 node_modules

  // 代码注入
  banner: '/* My Library */',
  footer: '/* End */',
  env: { NODE_ENV: 'production' },
  define: { __DEV__: 'false' },

  // 路径别名
  alias: {
    '@': './src',
  },

  // 其他
  clean: true,                    // 清理输出目录
  stub: false,                    // Stub 模式
  shims: false,                   // 兼容性垫片
  hash: false,                    // 文件名哈希

  // 文件复制
  copy: [
    { from: './README.md', to: './dist/' },
  ],

  // 插件
  plugins: [myPlugin()],

  // rolldown 原生配置
  rolldown: {
    // 任何 rolldown 选项
  },
}
```

## Transform 配置

```typescript
{
  type: 'transform',
  input: './src/runtime',         // 输入目录
  outDir: './dist/runtime',       // 输出目录

  // 优化
  minify: false,
  sourcemap: false,
  target: 'es2022',

  // 路径
  alias: { '@': './src' },
  nodeProtocol: false,            // 添加 node: 前缀

  // 其他
  clean: true,
  stub: false,
  banner: '',
  footer: '',
}
```

## 配置示例

### 简单库

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

### CLI 工具

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/cli.ts',
      platform: 'node',
      minify: true,
    },
  ],
})
```

### 混合模式

```typescript
export default defineConfig({
  entries: [
    // 主库
    {
      type: 'bundle',
      input: './src/index.ts',
      dts: true,
    },
    // 运行时
    {
      type: 'transform',
      input: './src/runtime',
      outDir: './dist/runtime',
    },
  ],
})
```

### 条件配置

```typescript
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: isDev,
      minify: !isDev,
      dts: !isDev,
    },
  ],
})
```

## 下一步

- [构建模式](./build-modes.md) - Bundle 与 Transform 模式
- [Hooks](./hooks.md) - 构建钩子
