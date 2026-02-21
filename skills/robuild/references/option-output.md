# Output Directory

Configure where build output is written.

## Basic Usage

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  outDir: 'dist',  // Default
}
```

## Custom Output Directory

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  outDir: 'lib',
}
```

## Per-Entry Output

Different entries can have different output directories:

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: 'dist',
    },
    {
      type: 'bundle',
      input: './src/cli.ts',
      outDir: 'dist/cli',
    },
  ],
})
```

## Clean Output

Clean directory before build:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  outDir: 'dist',
  clean: true,  // Remove dist/ before build
}
```

**Note:** Use `clean: false` for subsequent entries to preserve previous output.

## Output Structure

Default output structure:

```
dist/
├── index.mjs       # ESM format
├── index.cjs       # CJS format (if multi-format)
└── index.d.mts     # Types (if dts: true)
```

With multiple entries:

```
dist/
├── index.mjs
├── index.cjs
├── index.d.mts
├── utils.mjs
├── utils.cjs
└── utils.d.mts
```

## Global vs Entry-Level

Global `outDir` applies to all entries:

```ts
export default defineConfig({
  outDir: 'lib',  // Default for all entries
  entries: [
    { type: 'bundle', input: './src/index.ts' },  // -> lib/
    { type: 'bundle', input: './src/cli.ts', outDir: 'bin' },  // -> bin/
  ],
})
```

## Preserving Structure

For transform mode, directory structure is preserved:

```ts
{
  type: 'transform',
  input: './src',
  outDir: 'dist',
}
```

```
src/           ->  dist/
├── index.ts       ├── index.mjs
├── utils/         ├── utils/
│   └── foo.ts     │   └── foo.mjs
└── lib/           └── lib/
    └── bar.ts         └── bar.mjs
```
