# Type Declarations (DTS)

Generate TypeScript declaration files (.d.ts) alongside your bundle.

## Enable DTS

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  dts: true,
}
```

## Output Files

With `dts: true`:

```
dist/
├── index.mjs       # ESM bundle
├── index.cjs       # CJS bundle
└── index.d.mts     # Type declarations
```

## DTS-Only Build

Generate only type declarations without JavaScript output:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  dtsOnly: true,
}
```

## DTS Options

Pass options to rolldown-plugin-dts:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  dts: {
    // DTS plugin options
    compilerOptions: {
      paths: {},
    },
  },
}
```

## Multi-Format DTS

For multi-format builds, DTS is generated from ESM build:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
}
```

Output:
```
dist/
├── index.mjs       # ESM
├── index.cjs       # CJS
└── index.d.mts     # Shared types
```

## Best Practices

1. **Enable for libraries** - Always use `dts: true` for npm packages
2. **Use with exports** - Enable `generateExports` for proper package.json
3. **Check tsconfig** - Ensure `declaration` and `declarationMap` settings

## Example: Complete Library Setup

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
      generateExports: true,
    },
  ],
  exports: {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
  },
})
```

Generated package.json exports:
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
