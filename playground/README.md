# Robuild Playground

This directory contains various examples demonstrating different features and use cases of robuild.

## Examples

### 📦 Basic Examples
- **[basic-bundle](./basic-bundle/)** - Simple ESM/CJS bundle example
- **[multi-format](./multi-format/)** - Multiple output formats (ESM, CJS, IIFE)
- **[transform-mode](./transform-mode/)** - File-by-file transformation

### ⚛️ Framework Support
- **[react-app](./react-app/)** - React/JSX support
- **[vue-app](./vue-app/)** - Vue.js support with unplugin-vue

### 🔧 Advanced Features
- **[exports-generation](./exports-generation/)** - Automatic package.json exports generation
- **[asset-handling](./asset-handling/)** - Asset loading and processing
- **[watch-mode](./watch-mode/)** - Development watch mode
- **[plugin-examples](./plugin-examples/)** - Custom plugin implementations

### 🔄 Migration Examples
- **[tsup-style](./tsup-style/)** - tsup-compatible configuration
- **[unbuild-style](./unbuild-style/)** - unbuild-compatible configuration

### 🎯 Target Examples
- **[es2015-target](./es2015-target/)** - ES2015 target with @oxc-project/runtime helpers

## Running Examples

### Test All Examples

```bash
# From playground directory
npm run test

# From root directory
npm run test:playground
```

### Test Individual Example

```bash
cd <example-name>
npm install
npm run build
```

### Clean All Examples

```bash
# Clean dist directories
npm run clean

# Clean everything including node_modules
npm run clean:all
```

## Example Structure

Each example follows this structure:

```
example-name/
├── package.json       # Dependencies and scripts
├── build.config.ts    # Robuild configuration
├── src/              # Source files
└── README.md         # Example-specific documentation
```

## Dependencies

All examples use the local robuild package via `"robuild": "workspace:*"`.

To update all examples to use the latest local robuild:

```bash
npm run update-deps
```
