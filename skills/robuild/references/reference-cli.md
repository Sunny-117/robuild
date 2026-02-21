# CLI Reference

## Basic Usage

```bash
robuild [entries...] [options]
```

## Commands

### Build (default)

```bash
# Auto-detect entry (src/index.ts)
robuild

# Specific entry
robuild ./src/index.ts

# Multiple entries
robuild ./src/index.ts ./src/cli.ts

# With format
robuild ./src/index.ts --format esm,cjs
```

### Watch Mode

```bash
robuild --watch
robuild -w
```

## Options

### Entry & Output

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--format <format>` | `-f` | Output format (esm, cjs, iife) | `esm` |
| `--outDir <dir>` | `-o` | Output directory | `dist` |
| `--clean` | | Clean output before build | `false` |

### Build Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--dts` | | Generate type declarations | `false` |
| `--minify` | `-m` | Minify output | `false` |
| `--sourcemap` | | Generate source maps | `false` |
| `--target <target>` | | ECMAScript target | `es2022` |
| `--platform <platform>` | | Target platform (node, browser) | `node` |

### Dependencies

| Option | Description |
|--------|-------------|
| `--external <deps>` | External dependencies (comma-separated) |
| `--no-external <deps>` | Force bundle dependencies |

### Config

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--config <file>` | `-c` | Config file path | Auto-detect |
| `--watch` | `-w` | Watch mode | `false` |

### Package

| Option | Description |
|--------|-------------|
| `--generate-exports` | Generate package.json exports field |

### Misc

| Option | Description |
|--------|-------------|
| `--help` | Show help |
| `--version` | Show version |

## Examples

### Basic Library

```bash
robuild ./src/index.ts --format esm,cjs --dts
```

### CLI Tool

```bash
robuild ./src/cli.ts --format esm --platform node
```

### Browser Library

```bash
robuild ./src/index.ts --format iife --platform browser --minify
```

### Development

```bash
robuild --watch --sourcemap
```

### Production

```bash
robuild --clean --minify --dts
```

### With Exports

```bash
robuild --generate-exports --dts --format esm,cjs
```

## Config File Priority

1. `--config <file>` if specified
2. `build.config.ts`
3. `build.config.js`
4. `build.config.mjs`
5. `build.config.cjs`
6. `build.config.json`
