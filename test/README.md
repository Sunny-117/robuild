# Robuild Test Architecture

## Overview

The test suite uses a snapshot-based approach to verify build outputs. All tests generate build artifacts and compare them against stored snapshots to ensure consistency.

## Architecture

### Directory Structure

```
test/
├── helpers/              # Test utilities
│   ├── build.ts         # Build test helper
│   ├── fixtures.ts      # Fixture management
│   ├── snapshot.ts      # Snapshot utilities
│   └── index.ts         # Public API
├── shared-fixtures/     # Shared test fixtures (optional)
├── temp/                # Temporary build outputs (gitignored)
├── __snapshots__/       # Snapshot files
├── bundle.test.ts       # Bundle mode tests
├── transform.test.ts    # Transform mode tests
└── cli.test.ts          # CLI tests
```

### Core Concepts

#### 1. Snapshot Testing

All tests use snapshots to verify build outputs:

```typescript
import { testBuild } from './helpers'

it('should bundle TypeScript', async (context) => {
  await testBuild({
    context,
    files: {
      'index.ts': `export const hello = "world"`,
    },
    config: {
      entries: [{ type: 'bundle', input: 'index.ts' }],
    },
  })
})
```

#### 2. Test Helpers

The `testBuild` helper:
- Creates a temporary test directory
- Writes fixture files
- Runs the build
- Captures output as snapshot
- Cleans up automatically

#### 3. Fixtures

Two ways to provide test input:

**Inline files:**
```typescript
await testBuild({
  context,
  files: {
    'index.ts': `export const value = 42`,
    'utils.ts': `export function helper() {}`,
  },
  config: { /* ... */ },
})
```

**Fixture directory:**
```typescript
await testBuild({
  context,
  fixture: 'my-fixture', // Uses test/fixtures/my-fixture/
  config: { /* ... */ },
})
```

## Writing Tests

### Basic Test

```typescript
import { describe, it } from 'vitest'
import { testBuild } from './helpers'

describe('my feature', () => {
  it('should work', async (context) => {
    await testBuild({
      context,
      files: {
        'index.ts': `export const test = true`,
      },
      config: {
        entries: [
          {
            type: 'bundle',
            input: 'index.ts',
            format: 'esm',
          },
        ],
      },
    })
  })
})
```

### Advanced Options

```typescript
await testBuild({
  context,
  files: { /* ... */ },
  config: { /* ... */ },
  
  // Custom output directory
  outDir: 'dist/custom',
  
  // Filter snapshot files
  snapshotPattern: /\.mjs$/,
  snapshotExclude: [/\.map$/],
  
  // Hooks
  beforeBuild: async (testDir) => {
    // Setup before build
  },
  afterBuild: async (outputDir) => {
    // Verify after build
  },
  
  // Working directory
  cwd: 'packages/core',
})
```

### Dynamic Configuration

Use a function for dynamic config:

```typescript
await testBuild({
  context,
  files: { /* ... */ },
  config: (cwd) => ({
    entries: [
      {
        type: 'transform',
        input: 'src',
        alias: {
          '@': `${cwd}/src`,
        },
      },
    ],
  }),
})
```

## Coverage

Run tests with coverage:

```bash
# Run all tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test test/snapshot.test.ts

# Update snapshots
pnpm test -u
```

### Coverage Thresholds

Configured in `vitest.config.ts`:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Snapshot Management

### Updating Snapshots

When build output changes intentionally:

```bash
pnpm test -u
```

### Reviewing Snapshots

Snapshots are stored in `test/__snapshots__/` as markdown files:

```markdown
## index.mjs

\`\`\`js
export const hello = "world";
\`\`\`
```

### Best Practices

1. **Keep snapshots small** - Test focused features
2. **Review snapshot changes** - Verify changes are intentional
3. **Use descriptive test names** - Snapshot files use test names
4. **Filter unnecessary files** - Use `snapshotPattern` and `snapshotExclude`

## Test Organization

### Current Structure

```
test/
├── bundle.test.ts       # Bundle mode tests (formats, optimization, externals)
├── transform.test.ts    # Transform mode tests (TSX/JSX, path resolution)
└── cli.test.ts          # CLI tests (commands, options, config files)
```

All tests use snapshot-based assertions for consistent verification.

## Debugging Tests

### View Test Output

Test outputs are in `test/temp/`:

```bash
ls test/temp/my-feature/should-work/dist/
```

### Run Single Test

```bash
pnpm test -t "should work"
```

### Verbose Output

```bash
pnpm test --reporter=verbose
```

## Migration Guide

### From Old Tests

**Before:**
```typescript
import { testBuild } from './utils'

it('test', async (context) => {
  await testBuild({
    context,
    files: { /* ... */ },
    options: { /* ... */ },  // ❌ old
    expectDir: 'dist',       // ❌ old
  })
})
```

**After:**
```typescript
import { testBuild } from './helpers'

it('test', async (context) => {
  await testBuild({
    context,
    files: { /* ... */ },
    config: { /* ... */ },   // ✅ new
    outDir: 'dist',          // ✅ new
  })
})
```

## Contributing

When adding new tests:

1. Use `testBuild` helper
2. Write descriptive test names
3. Keep fixtures minimal
4. Review snapshots before committing
5. Ensure tests pass with coverage

## Examples

See `test/snapshot.test.ts` for comprehensive examples of the new architecture.
