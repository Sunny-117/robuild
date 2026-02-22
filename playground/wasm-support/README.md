# WASM Support Example

This example demonstrates how to use WebAssembly modules with `robuild`.

## Setup

```bash
pnpm install
```

## Build

```bash
pnpm build
```

## Features

- Import `.wasm` files directly in TypeScript/JavaScript
- Automatic WASM instantiation
- Support for both sync and async initialization
- Configurable inline threshold for small WASM files

## Usage

```ts
// Direct import (sync instantiation)
import { add } from './math.wasm'

const result = add(1, 2) // 3
```

### Async Initialization

```ts
import init from './math.wasm?init'

const instance = await init()
instance.exports.add(1, 2)
```

### Sync Initialization

```ts
import initSync from './math.wasm?init&sync'

const instance = initSync()
instance.exports.add(1, 2)
```

## Configuration

In `build.config.ts`:

```ts
import { defineConfig } from 'robuild'

export default defineConfig({
  entry: ['./src/index.ts'],
  wasm: {
    enabled: true,
    maxFileSize: 14 * 1024, // Files smaller than 14KB will be inlined
    targetEnv: 'auto',      // Auto-detect Node.js or browser
  },
})
```

## TypeScript Support

Add type declarations in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["rolldown-plugin-wasm/types"]
  }
}
```
