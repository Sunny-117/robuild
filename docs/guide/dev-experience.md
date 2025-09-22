# 开发体验功能

robuild 提供了丰富的开发体验功能，包括成功回调、监听模式优化、Vite 配置复用、调试模式、日志控制等，让开发过程更加高效和愉快。

## 🎉 成功回调功能

### 基本用法

#### CLI 使用

```bash
# 执行命令
npx robuild ./src/index.ts --on-success "echo 'Build completed!'"

# 复杂命令
npx robuild ./src/index.ts --on-success "npm run test && npm run deploy"

# 多个命令
npx robuild ./src/index.ts --on-success "echo 'Done' && open dist/"
```

#### 配置文件

```typescript
import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  // 字符串命令
  onSuccess: 'echo "Build completed successfully!"',
  
  // 或者函数回调
  onSuccess: (result) => {
    console.log(`✅ Built ${result.entries.length} entries in ${result.duration}ms`)
    console.log('📦 Output files:', result.entries.map(e => e.name))
  }
})
```

### 高级回调功能

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  onSuccess: async (result) => {
    // 分析构建结果
    const totalSize = result.entries.reduce((sum, entry) => sum + entry.size, 0)
    console.log(`📊 Total bundle size: ${totalSize} bytes`)
    
    // 执行后续任务
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Deploying to production...')
      // 部署逻辑
    }
    
    // 发送通知
    if (totalSize > 1024 * 1024) {
      console.warn('⚠️  Bundle size is larger than 1MB')
    }
  }
})
```

### 错误处理

```typescript
export default defineConfig({
  onSuccess: async (result) => {
    try {
      // 可能失败的操作
      await deployToServer(result)
      console.log('✅ Deployment successful')
    } catch (error) {
      console.error('❌ Deployment failed:', error)
      // 不会中断构建流程
    }
  }
})
```

## 👁️ 忽略监听路径

### 默认忽略模式

robuild 默认忽略以下路径：

```
**/node_modules/**
**/dist/**
**/build/**
**/.git/**
**/.DS_Store
**/Thumbs.db
**/*.log
**/coverage/**
**/.nyc_output/**
**/.cache/**
**/tmp/**
**/temp/**
```

### CLI 使用

```bash
# 忽略特定文件
npx robuild ./src/index.ts --watch --ignore-watch "**/*.test.ts"

# 多个忽略模式
npx robuild ./src/index.ts --watch \
  --ignore-watch "**/*.test.ts" \
  --ignore-watch "**/*.spec.ts" \
  --ignore-watch "src/temp/**"
```

### 配置文件

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  // 全局忽略模式
  ignoreWatch: [
    '**/*.test.ts',
    '**/*.spec.ts',
    'src/temp/**',
    'docs/**'
  ],
  
  // 或者在 watch 配置中
  watch: {
    enabled: true,
    exclude: [
      '**/*.test.ts',
      'src/experimental/**'
    ]
  }
})
```

### 高级忽略配置

```typescript
export default defineConfig({
  ignoreWatch: [
    // 测试文件
    '**/*.{test,spec}.{ts,js}',
    
    // 临时文件
    '**/temp/**',
    '**/tmp/**',
    
    // 文档文件
    '**/*.md',
    'docs/**',
    
    // 配置文件
    '*.config.{js,ts}',
    
    // 环境特定忽略
    ...(process.env.NODE_ENV === 'development' ? ['src/prod-only/**'] : [])
  ]
})
```

### 监听性能优化

```typescript
export default defineConfig({
  watch: {
    enabled: true,
    
    // 精确监听范围
    include: ['src/**/*'],
    
    // 排除大目录
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**'
    ],
    
    // 防抖延迟
    delay: 100,
    
    // 不监听新文件（性能优化）
    watchNewFiles: false
  }
})
```

## ⚡ Vite 配置复用

### 自动检测

robuild 会自动检测以下 Vite 配置文件：

- `vite.config.ts`
- `vite.config.js`
- `vite.config.mts`
- `vite.config.mjs`
- `vitest.config.ts`
- `vitest.config.js`

### CLI 使用

```bash
# 启用 Vite 配置复用
npx robuild --from-vite

# 结合其他选项
npx robuild --from-vite --format cjs
```

### 配置转换示例

#### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'iife']
    },
    rollupOptions: {
      external: ['lodash']
    }
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
})
```

#### 转换后的 robuild 配置

```typescript
// 自动转换为
{
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs', 'iife'],
      globalName: 'MyLib',
      external: ['lodash'],
      alias: {
        '@': './src'
      }
    }
  ]
}
```

### 手动配置复用

```typescript
import { defineConfig } from 'robuild'
import { loadViteConfig } from 'robuild/vite'

const viteConfig = await loadViteConfig(process.cwd())

export default defineConfig({
  // 合并 Vite 配置
  ...viteConfig,
  
  // 覆盖特定选项
  entries: [
    {
      ...viteConfig.entries?.[0],
      format: ['esm', 'cjs'] // 覆盖格式
    }
  ]
})
```

## 🐛 调试模式

### 启用调试

```bash
# 环境变量方式
DEBUG=robuild:* npx robuild ./src/index.ts

# 特定模块调试
DEBUG=robuild:build npx robuild ./src/index.ts

# 日志级别方式
npx robuild ./src/index.ts --log-level verbose
```

### 配置文件

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  // 启用详细日志
  logLevel: 'verbose'
})
```

### 调试信息示例

```
🔍 [robuild:config] Loading configuration...
🔍 [robuild:build] Starting build process
🔍 [robuild:bundle] Processing entry: ./src/index.ts
🔍 [robuild:plugins] Loading plugins...
🔍 [robuild:rolldown] Configuring rolldown options
🔍 [robuild:output] Writing output files
✅ [robuild:build] Build completed in 1.2s
```

### 自定义调试

```typescript
import { logger } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  hooks: {
    start: (ctx) => {
      logger.verbose('🚀 Starting custom build process')
      logger.verbose(`📁 Working directory: ${ctx.cwd}`)
    },
    
    end: (ctx) => {
      logger.verbose('🎉 Custom build process completed')
    }
  }
})
```

## 📊 日志级别控制

### 支持的日志级别

| 级别 | 描述 | 输出内容 |
|------|------|----------|
| `silent` | 静默模式 | 无输出 |
| `error` | 仅错误 | 错误信息 |
| `warn` | 警告及以上 | 错误 + 警告 |
| `info` | 信息及以上 | 错误 + 警告 + 信息（默认） |
| `verbose` | 详细模式 | 所有日志 + 调试信息 |

### CLI 使用

```bash
# 静默模式
npx robuild ./src/index.ts --log-level silent

# 仅显示错误
npx robuild ./src/index.ts --log-level error

# 详细模式
npx robuild ./src/index.ts --log-level verbose
```

### 配置文件

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  // 设置日志级别
  logLevel: 'info'
})
```

### 环境特定日志

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  // 根据环境设置日志级别
  logLevel: process.env.NODE_ENV === 'development' ? 'verbose' : 'info'
})
```

## ⚠️ 构建失败处理

### 警告时失败

```bash
# 警告时构建失败
npx robuild ./src/index.ts --fail-on-warn
```

### 配置文件

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  // 警告时失败
  failOnWarn: true
})
```

### 条件性失败

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  // 生产环境警告时失败
  failOnWarn: process.env.NODE_ENV === 'production'
})
```

### 自定义错误处理

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts'
    }
  ],
  
  hooks: {
    end: (ctx) => {
      const { warnings, errors } = getLogCounts()
      
      if (errors > 0) {
        console.error(`❌ Build failed with ${errors} errors`)
        process.exit(1)
      }
      
      if (warnings > 0) {
        console.warn(`⚠️  Build completed with ${warnings} warnings`)
        
        if (process.env.CI === 'true') {
          console.error('❌ Warnings not allowed in CI')
          process.exit(1)
        }
      }
    }
  }
})
```

## 🔄 完整开发工作流

### 开发环境配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'esm'
    }
  ],
  
  // 开发体验配置
  logLevel: 'verbose',
  failOnWarn: false,
  
  // 监听配置
  watch: {
    enabled: true,
    include: ['src/**/*'],
    exclude: ['**/*.test.ts'],
    delay: 100
  },
  
  // 忽略文件
  ignoreWatch: [
    '**/*.test.ts',
    '**/*.spec.ts',
    'docs/**'
  ],
  
  // 成功回调
  onSuccess: (result) => {
    console.log(`✅ Development build completed in ${result.duration}ms`)
  }
})
```

### 生产环境配置

```typescript
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs']
    }
  ],
  
  // 生产环境配置
  logLevel: 'info',
  failOnWarn: true,
  
  // 成功回调
  onSuccess: async (result) => {
    console.log('🚀 Production build completed')
    
    // 部署到 CDN
    await deployToCDN(result)
    
    // 发送通知
    await sendSlackNotification('Build deployed successfully!')
  }
})
```

## 📚 相关文档

- [CLI 和配置增强](./cli-config-enhancements.md) - 多格式输出、平台目标等
- [构建功能增强](./build-enhancements.md) - 文件复制、哈希、Banner 等
- [监听模式](./watch-mode.md) - 详细的监听模式配置
- [配置文件](./configuration.md) - 完整配置参考
