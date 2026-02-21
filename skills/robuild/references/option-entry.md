# Entry Points

## Basic Entry

Single file entry:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
}
```

## Multiple Entries

### Array Format

Multiple files output as separate bundles:

```ts
{
  type: 'bundle',
  input: ['./src/index.ts', './src/cli.ts'],
}
```

Output:
```
dist/
├── index.mjs
└── cli.mjs
```

### Object Format (Named)

Control output names:

```ts
{
  type: 'bundle',
  input: {
    main: './src/index.ts',
    utils: './src/utils/index.ts',
    cli: './src/cli.ts',
  },
}
```

Output:
```
dist/
├── main.mjs
├── utils.mjs
└── cli.mjs
```

## tsup-Style Entry

Using flat config `entry` field:

```ts
// Single entry
{
  entry: './src/index.ts',
}

// Multiple entries (array)
{
  entry: ['./src/index.ts', './src/cli.ts'],
}

// Named entries (object)
{
  entry: {
    index: './src/index.ts',
    cli: './src/cli.ts',
  },
}
```

## Entry Resolution

Entries are resolved relative to:
1. Config file directory
2. `cwd` option if specified
3. Current working directory

## Examples

### Library with CLI

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: {
        index: './src/index.ts',
        cli: './src/cli.ts',
      },
      format: ['esm', 'cjs'],
      dts: true,
    },
  ],
})
```

### Multiple Independent Entries

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      format: ['esm', 'cjs'],
    },
    {
      type: 'bundle',
      input: './src/cli.ts',
      format: 'esm',
      platform: 'node',
      clean: false,  // Don't clean to preserve previous output
    },
  ],
})
```
