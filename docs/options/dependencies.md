# 依赖处理

`robuild` 提供灵活的依赖处理选项，控制哪些依赖应该被打包，哪些应该保持外部引用。

## 外部依赖 (external)

将依赖标记为外部，不打包到输出文件中：

### CLI

```bash
robuild --external lodash --external react ./src/index.ts
```

### 配置文件

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
  external: ['lodash', 'react'],
}
```

### 正则表达式

支持使用正则表达式匹配多个依赖：

```ts [build.config.ts]
{
  external: [
    'lodash',
    /^@types\//,      // 所有 @types/* 包
    /^node:/,         // 所有 node: 协议
  ],
}
```

## 强制打包 (noExternal)

强制将某些依赖打包到输出中：

### CLI

```bash
robuild --no-external some-pkg ./src/index.ts
```

### 配置文件

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
  noExternal: ['some-internal-pkg'],
}
```

## 跳过 node_modules

跳过打包所有 `node_modules` 中的依赖：

```bash
robuild --skip-node-modules ./src/index.ts
```

```ts [build.config.ts]
{
  type: 'bundle',
  input: './src/index.ts',
  skipNodeModules: true,
}
```

## 默认行为

`robuild` 默认会：

1. 将 `package.json` 中的 `dependencies` 和 `peerDependencies` 标记为外部
2. 将 `devDependencies` 打包到输出中（如果被引用）
3. 将 Node.js 内置模块标记为外部（当 `platform: 'node'` 时）

> [!TIP]
> 对于库项目，通常应该将运行时依赖（dependencies）保持外部，让最终用户自行安装。这样可以避免重复打包和版本冲突。
