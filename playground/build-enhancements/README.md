# Build Enhancements Demo

This demo showcases robuild's build enhancement features.

## Features Demonstrated

- **Banner/Footer**: Add custom headers and footers to output files
- **Hash**: Add content hash to filenames for cache busting
- **Fixed Extension**: Use `.mjs`/`.cjs` extensions
- **Node Protocol**: Add `node:` prefix to Node.js built-in imports
- **Copy**: Copy static files to output directory

## Usage

```bash
# Development build (no hash)
pnpm build:dev

# Production build (with hash)
pnpm build:prod
```
