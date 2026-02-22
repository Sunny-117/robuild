# 性能优化

robuild 基于高性能 Rust 工具链，提供极速构建体验。

## 性能优势

robuild 基于以下技术：

- **Rolldown**: Rust 编写的打包器
- **Oxc**: Rust 编写的 JavaScript/TypeScript 工具链
- **并行处理**: 充分利用多核 CPU

## 开发性能优化

### Stub 模式

跳过构建过程，直接链接源码：

```bash
robuild ./src/index.ts --stub
```

优势：
- 极快启动时间
- 无需等待构建
- 适合开发调试

### 监听模式

文件变化时自动重建：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  watch: {
    enabled: true,
    delay: 100,            // 防抖延迟
    include: ['src/**/*'],
    exclude: ['**/*.test.ts'],
  },
})
```

优化建议：
- 合理设置 `delay`
- 精确配置 `include`
- 排除测试和临时文件

## 构建性能优化

### 外部依赖

正确配置外部依赖避免不必要的打包：

```typescript
{
  type: 'bundle',
  input: './src/index.ts',
  external: [
    'lodash',
    'react',
    /^@types\//,
  ],
}
```

### 代码分割

使用动态导入实现代码分割：

```typescript
// 源码中使用动态导入
export async function loadFeature(name: string) {
  const module = await import(`./features/${name}.js`)
  return module.default
}
```

配置启用 splitting：

```typescript
{
  type: 'bundle',
  input: './src/index.ts',
  splitting: true,
}
```

### 条件压缩

仅在生产环境压缩：

```typescript
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: !isDev,
      sourcemap: isDev,
    },
  ],
})
```

## 构建时间监控

使用 hooks 监控构建时间：

```typescript
export default defineConfig({
  entries: ['./src/index.ts'],
  hooks: {
    start: () => console.time('Build'),
    end: () => console.timeEnd('Build'),
  },
})
```

## 内存优化

对于大型项目，增加 Node.js 内存限制：

```bash
NODE_OPTIONS="--max-old-space-size=4096" robuild ./src/index.ts
```

## 最佳实践

### 开发环境

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      stub: true,      // 快速开发
      dts: false,      // 跳过类型生成
    },
  ],
})
```

### 生产环境

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      minify: true,
      dts: true,
      treeshake: true,
    },
  ],
})
```

## 下一步

- [Stub 模式](./stub-mode.md) - 开发模式详解
- [监听模式](./watch-mode.md) - 文件监听配置
- [配置](./configuration.md) - 完整配置选项
