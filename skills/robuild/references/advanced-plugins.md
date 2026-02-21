# Plugins

robuild supports Rolldown plugins for extending build functionality.

## Adding Plugins

### Entry-Level Plugins

```ts
import somePlugin from 'some-rolldown-plugin'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [somePlugin()],
    },
  ],
})
```

### Rolldown Passthrough

Use `rolldown` option for raw Rolldown configuration:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  rolldown: {
    plugins: [somePlugin()],
    output: {
      // Rolldown output options
    },
  },
}
```

## Built-in Plugins

robuild includes several built-in plugins:

### Shebang Plugin

Preserves shebang (`#!/usr/bin/env node`) in CLI tools:

```ts
// Automatic - no config needed
// Just include shebang in source file
```

### Node Protocol Plugin

Handles `node:` protocol imports:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  nodeProtocol: true,  // Add node: prefix
}
```

### Shims Plugin

Add ESM/CJS compatibility shims:

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  shims: true,  // Add __dirname, __filename, require
}
```

## Creating Custom Plugins

robuild plugins follow Rolldown's plugin interface:

```ts
function myPlugin(): RolldownPlugin {
  return {
    name: 'my-plugin',

    // Transform source code
    transform(code, id) {
      return { code, map: null }
    },

    // Resolve module IDs
    resolveId(source, importer) {
      return null
    },

    // Load module content
    load(id) {
      return null
    },
  }
}
```

## RobuildPlugin Extensions

robuild adds lifecycle hooks:

```ts
import type { RobuildPlugin } from 'robuild'

function myRobuildPlugin(): RobuildPlugin {
  return {
    name: 'my-robuild-plugin',

    // Called when plugin manager initializes
    robuildSetup(ctx) {
      console.log('Setup:', ctx.pkgDir)
    },

    // Called before build starts
    robuildBuildStart(ctx) {
      console.log('Build starting')
    },

    // Called after build completes
    robuildBuildEnd({ allOutputEntries }) {
      console.log('Build done:', allOutputEntries)
    },

    // Standard Rolldown hooks
    transform(code, id) {
      return null
    },
  }
}
```

## Examples

### Replace Plugin

```ts
import replace from '@rolldown/plugin-replace'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
        }),
      ],
    },
  ],
})
```

### Alias Plugin

```ts
{
  type: 'bundle',
  input: './src/index.ts',
  alias: {
    '@': './src',
    '~': './src',
  },
}
```

### Virtual Plugin

```ts
import { virtualPlugin } from 'robuild'

export default defineConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      plugins: [
        virtualPlugin({
          'virtual:config': 'export default { version: "1.0.0" }',
        }),
      ],
    },
  ],
})
```

## Plugin Order

Plugins are applied in this order:
1. Built-in plugins (shebang, nodeProtocol, shims)
2. User plugins (from `plugins` array)
3. Rolldown passthrough plugins (from `rolldown.plugins`)
