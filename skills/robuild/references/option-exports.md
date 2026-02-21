# Package Exports Generation

Generate the `exports` field in package.json automatically based on build output.

## Enable Generation

### Entry-Level

Enable for specific entries:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
  generateExports: true,
  exportPath: '.',  // Export as main entry
}
```

### Global Config

Enable exports generation globally:

```ts
export default defineConfig({
  entries: [...],
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
})
```

## Configuration Options

```ts
{
  exports: {
    // Enable exports generation
    enabled: true,

    // Include types field in exports
    includeTypes: true,

    // Auto-update package.json
    autoUpdate: true,

    // Custom exports (merged with generated)
    custom: {
      './package.json': './package.json',
    },
  },
}
```

## Generated Output

For a build with:
```ts
{
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
    },
  ],
  exports: { enabled: true, includeTypes: true },
}
```

Generated in package.json:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

## Multiple Entry Exports

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: '.',
    },
    {
      type: 'bundle',
      input: './src/utils/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
      exportPath: './utils',
      clean: false,
    },
  ],
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
})
```

Generated:
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils/index.d.mts",
      "import": "./dist/utils/index.mjs",
      "require": "./dist/utils/index.cjs"
    }
  }
}
```

## Custom Exports

Add custom entries:

```ts
{
  exports: {
    enabled: true,
    custom: {
      './package.json': './package.json',
      './styles': './dist/styles.css',
    },
  },
}
```

## CLI Flag

Generate exports via CLI:

```bash
robuild --generate-exports
```

## Best Practices

1. **Include types first** - Node.js resolves types condition first
2. **Use with DTS** - Enable `dts: true` for proper types export
3. **Set exportPath** - Explicitly set export paths for clarity
4. **Don't clean later entries** - Use `clean: false` for subsequent entries
