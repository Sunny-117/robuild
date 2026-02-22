# 静态资源处理

Robuild 通过 Rolldown 的 `moduleTypes` 提供了强大的静态资源处理能力。

## 基本用法

在配置文件中使用 `loaders` 选项来指定如何处理不同类型的文件：

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: './src/index.ts',
  loaders: {
    '.png': { loader: 'asset' },
    '.jpg': { loader: 'asset' },
    '.svg': { loader: 'text' },
  }
})
```

然后在代码中直接导入：

```typescript
import logo from './logo.png'
import icon from './icon.svg'

console.log(logo)  // 文件路径或 base64 URL
console.log(icon)  // SVG 内容字符串
```

## Loader 类型

Robuild 支持以下 loader 类型（基于 Rolldown 的 moduleTypes）：

### `asset` (推荐)

自动根据文件大小选择最佳策略：
- 小文件（< 8KB）：内联为 base64 data URL
- 大文件（≥ 8KB）：输出为单独文件并返回文件路径

```typescript
loaders: {
  '.png': { loader: 'asset' },
  '.jpg': { loader: 'asset' },
  '.woff2': { loader: 'asset' },
}
```

**适用场景**：图片、字体等资源文件

### `file`

始终将文件输出为单独的文件，返回文件路径。

```typescript
loaders: {
  '.png': { loader: 'file' },
  '.pdf': { loader: 'file' },
}
```

**适用场景**：大型文件、需要独立缓存的资源

### `base64`

始终将文件内联为 base64 data URL。

```typescript
loaders: {
  '.svg': { loader: 'base64' },
  '.woff': { loader: 'base64' },
}
```

**适用场景**：小图标、内联字体

### `text`

将文件内容作为字符串导入。

```typescript
loaders: {
  '.svg': { loader: 'text' },
  '.txt': { loader: 'text' },
  '.md': { loader: 'text' },
}
```

**适用场景**：SVG、文本文件、模板

### `json`

将 JSON 文件解析为 JavaScript 对象。

```typescript
loaders: {
  '.json': { loader: 'json' },
}
```

### `css`

处理 CSS 文件。

```typescript
loaders: {
  '.css': { loader: 'css' },
}
```

### `empty`

导入为空模块。

```typescript
loaders: {
  '.ignore': { loader: 'empty' },
}
```

## 默认配置

Robuild 提供了合理的默认配置，无需手动配置即可处理常见资源：

```typescript
// 默认配置
{
  // 图片 - 自动优化
  '.png': 'asset',
  '.jpg': 'asset',
  '.jpeg': 'asset',
  '.gif': 'asset',
  '.webp': 'asset',
  '.svg': 'text',
  
  // 字体 - 自动优化
  '.woff': 'asset',
  '.woff2': 'asset',
  '.ttf': 'asset',
  
  // 媒体文件 - 始终输出文件
  '.mp4': 'file',
  '.mp3': 'file',
  
  // 文本文件
  '.txt': 'text',
  '.md': 'text',
}
```

## 完整示例

### 配置文件

```typescript
// build.config.ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: './src/index.ts',
  format: ['es', 'cjs'],
  outDir: './dist',
  
  loaders: {
    // 图片 - 自动优化
    '.png': { loader: 'asset' },
    '.jpg': { loader: 'asset' },
    
    // SVG - 作为文本导入（可以内联到 HTML）
    '.svg': { loader: 'text' },
    
    // 字体 - 自动优化
    '.woff2': { loader: 'asset' },
    
    // 大文件 - 始终输出为文件
    '.pdf': { loader: 'file' },
    
    // 小图标 - 始终内联
    '.ico': { loader: 'base64' },
  }
})
```

### 源代码

```typescript
// src/index.ts
import logo from './assets/logo.png'
import icon from './assets/icon.svg'
import font from './assets/font.woff2'

// logo 可能是文件路径或 base64 URL（取决于文件大小）
console.log('Logo:', logo)

// icon 是 SVG 内容字符串
console.log('Icon SVG:', icon)

// font 可能是文件路径或 base64 URL
console.log('Font:', font)

// 在 HTML 中使用
document.body.innerHTML = `
  <img src="${logo}" alt="Logo" />
  <div>${icon}</div>
`
```

### TypeScript 类型支持

为了获得更好的 TypeScript 支持，创建类型声明文件：

```typescript
// src/types/assets.d.ts
declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.woff2' {
  const content: string
  export default content
}
```

## 与其他工具对比

### Vite

```typescript
// Vite
import logo from './logo.png'  // 返回文件路径
import logo from './logo.png?url'  // 显式文件路径
import logo from './logo.png?raw'  // 原始内容
import logo from './logo.png?inline'  // base64

// Robuild
import logo from './logo.png'  // 自动优化（asset）
```

### Webpack

```typescript
// Webpack
{
  test: /\.(png|jpg)$/,
  type: 'asset',  // 自动选择
}

// Robuild
loaders: {
  '.png': { loader: 'asset' },
  '.jpg': { loader: 'asset' },
}
```

## 最佳实践

### 1. 使用 `asset` 作为默认选择

对于大多数图片和字体，使用 `asset` loader 让 Rolldown 自动优化：

```typescript
loaders: {
  '.png': { loader: 'asset' },
  '.jpg': { loader: 'asset' },
  '.woff2': { loader: 'asset' },
}
```

### 2. SVG 根据用途选择

- 需要内联到 HTML：使用 `text`
- 作为图片使用：使用 `asset` 或 `file`

```typescript
loaders: {
  '.svg': { loader: 'text' },  // 内联 SVG
  // 或
  '.svg': { loader: 'asset' },  // 作为图片
}
```

### 3. 大文件使用 `file`

对于大型媒体文件，始终使用 `file` 以避免打包体积过大：

```typescript
loaders: {
  '.mp4': { loader: 'file' },
  '.pdf': { loader: 'file' },
}
```

### 4. 小图标使用 `base64`

对于小图标（< 1KB），可以使用 `base64` 减少 HTTP 请求：

```typescript
loaders: {
  '.ico': { loader: 'base64' },
}
```

## 输出结构

使用 `asset` 或 `file` loader 时，文件会被输出到 dist 目录：

```
dist/
├── index.mjs
├── index.cjs
├── assets/
│   ├── logo-a1b2c3d4.png
│   ├── icon-e5f6g7h8.svg
│   └── font-i9j0k1l2.woff2
```

文件名会自动添加内容哈希以支持长期缓存。

## 注意事项

1. **文件路径**：导入的资源路径是相对于输出目录的
2. **内容哈希**：输出的文件名包含内容哈希，确保缓存更新
3. **TypeScript**：需要添加类型声明以获得类型支持
4. **平台差异**：在 Node.js 环境中，文件路径可能需要特殊处理

## 相关链接

- [CSS 处理](../options/css.md) - 了解 CSS 打包和 LightningCSS 集成
- [Rolldown moduleTypes 文档](https://rolldown.rs/guide/module-types)
- [配置参考](../api/config.md#loaders)
