# Basic Bundle Example

This example demonstrates the most basic robuild configuration for bundling TypeScript code into ESM and CJS formats.

## Features

- ✅ TypeScript compilation
- ✅ ESM and CJS output formats
- ✅ Type declaration generation
- ✅ Tree shaking
- ✅ Minification

## Configuration

```typescript
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

## Build

```bash
npm run build
```

## Output

- `dist/index.mjs` - ESM bundle
- `dist/index.cjs` - CJS bundle  
- `dist/index.d.ts` - Type declarations
