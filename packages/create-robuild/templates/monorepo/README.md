# my-monorepo

A monorepo workspace built with [robuild](https://github.com/Sunny-117/robuild).

## Structure

```
my-monorepo/
├── packages/
│   ├── core/      # Core library
│   └── utils/     # Utility functions
├── package.json
└── pnpm-workspace.yaml
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Watch mode for all packages
pnpm dev
```

## Packages

- `@my-monorepo/core` - Core library
- `@my-monorepo/utils` - Utility functions

## License

MIT
