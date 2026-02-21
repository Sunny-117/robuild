# Output Format

## Available Formats

| Format | Extension (Node) | Extension (Browser) | Use Case |
|--------|------------------|---------------------|----------|
| `esm` | `.mjs` | `.js` | Modern ES modules |
| `cjs` | `.cjs` | `.js` | CommonJS (Node.js) |
| `iife` | `.js` | `.js` | Browser script tag |

## Single Format

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  format: 'esm',
}
```

## Multiple Formats

Build both ESM and CJS:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  format: ['esm', 'cjs'],
}
```

Output:
```
dist/
├── index.mjs    # ESM
└── index.cjs    # CJS
```

## Multi-Format Extensions

When building multiple formats, robuild uses distinct extensions to avoid conflicts:

| Format | Single | Multi-Format |
|--------|--------|--------------|
| esm | `.mjs` | `.mjs` |
| cjs | `.cjs` | `.cjs` |
| iife | `.js` | `.js` |

## IIFE Format

For browser script tags:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  format: 'iife',
  globalName: 'MyLibrary',  // Required for IIFE
  platform: 'browser',
}
```

Usage in browser:
```html
<script src="dist/index.js"></script>
<script>
  MyLibrary.doSomething()
</script>
```

## Fixed Extensions

Force specific extensions regardless of platform:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  format: 'esm',
  fixedExtension: true,  // Always use .mjs
}
```

## Examples

### Dual-Format Library

```ts
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

### Browser Bundle

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      globalName: 'MyLib',
      platform: 'browser',
      minify: true,
    },
  ],
})
```

### All Formats

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],  // Library formats
    },
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      globalName: 'MyLib',
      outDir: 'dist/browser',
      minify: true,
    },
  ],
})
```
