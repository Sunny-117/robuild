# Platform

Target platform for the build output.

## Options

| Platform | Description | Default Extensions |
|----------|-------------|-------------------|
| `node` | Node.js runtime | `.mjs`, `.cjs` |
| `browser` | Browser environment | `.js` |

## Node Platform (Default)

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  platform: 'node',
}
```

Features:
- Externalizes Node.js built-in modules
- Uses `.mjs`/`.cjs` extensions
- Supports `node:` protocol imports

## Browser Platform

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  platform: 'browser',
}
```

Features:
- Does not externalize node built-ins
- Uses `.js` extension
- Suitable for IIFE/UMD formats

## Examples

### Node.js Library

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      platform: 'node',
    },
  ],
})
```

### Browser Library

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      platform: 'browser',
      globalName: 'MyLib',
      minify: true,
    },
  ],
})
```

### Universal Library

Build for both Node.js and browser:

```ts
export default defineConfig({
  entries: [
    // Node.js version
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      platform: 'node',
      outDir: 'dist',
    },
    // Browser version
    {
      type: 'bundle',
      input: './src/index.ts',
      format: 'iife',
      platform: 'browser',
      globalName: 'MyLib',
      outDir: 'dist/browser',
      minify: true,
    },
  ],
})
```
