# External Dependencies

Control which dependencies are bundled vs externalized.

## Auto-External

By default, robuild externalizes:
- Dependencies from package.json `dependencies`
- Dependencies from package.json `peerDependencies`
- Node.js built-in modules

## Explicit External

Force specific packages to be external:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  external: ['react', 'react-dom'],
}
```

## Regex Patterns

Use regex for matching multiple packages:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  external: [
    'react',
    /^@myorg\//,  // All @myorg/* packages
    /^lodash/,   // lodash and lodash-es
  ],
}
```

## NoExternal (Force Bundle)

Force bundling of specific dependencies:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  noExternal: ['lodash-es'],  // Bundle even if in dependencies
}
```

## Combined Usage

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  external: ['react', 'react-dom'],
  noExternal: ['my-internal-dep'],
}
```

## Skip Node Modules

Skip bundling all node_modules:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  skipNodeModules: true,
}
```

## Examples

### React Library

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.tsx',
      format: ['esm', 'cjs'],
      external: ['react', 'react-dom'],
    },
  ],
})
```

### CLI Tool (Bundle Everything)

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/cli.ts',
      format: 'esm',
      platform: 'node',
      noExternal: [/.*/],  // Bundle all dependencies
    },
  ],
})
```

### Selective Bundling

```ts
export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      // External: react ecosystem
      external: [/^react/, /^@emotion/],
      // Bundle: specific utilities
      noExternal: ['lodash-es', 'date-fns'],
    },
  ],
})
```

## Resolution Priority

1. `noExternal` - Force bundle (highest priority)
2. `external` - Force external
3. Auto-external from package.json
4. Bundle by default
