# TypeScript 支持

robuild 提供完整的 TypeScript 支持，包括类型检查、声明文件生成和类型安全。

## 内置支持

robuild 原生支持 TypeScript，无需额外配置：

```bash
# 直接构建 TypeScript 文件
robuild ./src/index.ts
```

## 类型声明生成

### 自动生成

robuild 会自动生成 TypeScript 声明文件：

```typescript
// 源码: src/index.ts
export function greet(name: string): string {
  return `Hello, ${name}!`
}

export interface User {
  id: number
  name: string
}
```

```typescript
// 生成的声明文件: dist/index.d.mts
export declare function greet(name: string): string;
export interface User {
  id: number;
  name: string;
}
```

### 配置选项

```typescript
import { defineConfig } from 'robuild/config'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      dts: {
        compilerOptions: {
          declaration: true,
          emitDeclarationOnly: false,
          stripInternal: true,
        },
        include: ['src/**/*'],
        exclude: ['src/**/*.test.ts'],
      },
    },
  ],
})
```

## TypeScript 配置

### tsconfig.json 集成

robuild 会自动读取 `tsconfig.json` 配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 编译器选项

```typescript
{
  type: 'bundle',
  input: './src/index.ts',
  dts: {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      declaration: true,
      stripInternal: true,
      removeComments: false,
    },
  },
}
```

## 类型安全

### 完整的类型定义

robuild 提供完整的 TypeScript 类型定义：

```typescript
import type {
  BuildConfig,
  BuildEntry,
  BundleEntry,
  TransformEntry,
  BuildContext,
  BuildHooks,
} from 'robuild'

// 类型安全的配置
const config: BuildConfig = {
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
    } as BundleEntry,
  ],
}
```

### 智能提示

IDE 会提供完整的智能提示：

```typescript
import { defineConfig } from 'robuild/config'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      // IDE 会提示所有可用选项
      minify: true,
      dts: true,
      rolldown: {
        // rolldown 配置提示
      },
    },
  ],
})
```

## 高级特性

### 类型推断

robuild 会根据源码自动推断类型：

```typescript
// 源码: src/utils.ts
export const VERSION = '1.0.0'
export const DEFAULT_CONFIG = {
  timeout: 5000,
  retries: 3,
} as const

export function createConfig(options: Partial<typeof DEFAULT_CONFIG>) {
  return { ...DEFAULT_CONFIG, ...options }
}
```

```typescript
// 生成的声明文件
export declare const VERSION: "1.0.0";
export declare const DEFAULT_CONFIG: {
  readonly timeout: 5000;
  readonly retries: 3;
};
export declare function createConfig(options: Partial<typeof DEFAULT_CONFIG>): typeof DEFAULT_CONFIG;
```

### 泛型支持

完全支持 TypeScript 泛型：

```typescript
// 源码: src/generics.ts
export interface Result<T> {
  data: T
  success: boolean
  message?: string
}

export function createResult<T>(data: T, success: boolean, message?: string): Result<T> {
  return { data, success, message }
}

export class ApiClient<T> {
  constructor(private baseUrl: string) {}

  async get(id: string): Promise<Result<T>> {
    // 实现
  }
}
```

### 条件类型

支持复杂的条件类型：

```typescript
// 源码: src/conditional.ts
export type NonNullable<T> = T extends null | undefined ? never : T

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type EventMap = {
  click: MouseEvent
  keydown: KeyboardEvent
  submit: SubmitEvent
}

export type EventHandler<T extends keyof EventMap> = (event: EventMap[T]) => void
```

## 最佳实践

### 1. 类型导出

```typescript
// src/index.ts
export type { User, Config } from './types'
export { createUser, validateConfig } from './utils'

// 确保类型和实现一起导出
export interface ApiResponse<T> {
  data: T
  status: number
}
```

### 2. 类型声明文件

```typescript
// src/types.d.ts
declare module '*.json' {
  const value: any
  export default value
}

declare module '*.svg' {
  const content: string
  export default content
}
```

### 3. 类型守卫

```typescript
// src/guards.ts
export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string'
}

export function isConfig(obj: any): obj is Config {
  return obj && typeof obj.timeout === 'number'
}
```

### 4. 类型工具

```typescript
// src/utils.ts
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}
```

## 故障排除

### 1. 类型错误

如果遇到类型错误：

```bash
# 检查 TypeScript 配置
npx tsc --noEmit

# 使用 robuild 的类型检查
pnpm test:types
```

### 2. 声明文件问题

如果声明文件生成有问题：

```typescript
// 确保配置正确
{
  type: 'bundle',
  input: './src/index.ts',
  dts: {
    compilerOptions: {
      declaration: true,
      emitDeclarationOnly: false,
    },
  },
}
```

### 3. 类型导入问题

如果类型导入有问题：

```typescript
// 使用 type 导入
import type { User } from './types'

// 或者使用 import type
import { type User } from './types'
```

## 下一步

- [ESM 兼容性](./esm.md) - ESM 模块支持
- [配置](./configuration.md) - 详细配置选项
- [性能优化](./performance.md) - 性能优化技巧
- [API 文档](../api/) - 完整的 API 参考
