# robuild Skills for Claude Code

Agent skills that help Claude Code understand and work with [robuild](https://github.com/Sunny-117/robuild), the zero-config ESM/TS package builder.

## Installation

```bash
npx skills add Sunny-117/robuild
```

This will add the robuild skill to your Claude Code configuration.

## What's Included

The robuild skill provides Claude Code with knowledge about:

- **Core Concepts** - What robuild is, why use it, key features
- **Configuration** - Config file formats, entries-based and tsup-style configs
- **Build Modes** - Bundle mode, transform mode
- **Build Options** - Entry points, output formats, type declarations, targets
- **Dependency Handling** - External/noExternal dependencies
- **Output Enhancement** - Shims, exports generation, banner/footer
- **Plugin System** - Rolldown plugins, robuild plugin extensions
- **CLI Commands** - All CLI options and usage patterns

## Usage

Once installed, Claude Code will automatically use robuild knowledge when:

- Building TypeScript/JavaScript libraries
- Configuring package bundlers
- Setting up type declaration generation
- Working with multi-format builds (ESM, CJS)
- Setting up exports in package.json
- Migrating from tsup or unbuild

### Example Prompts

```
Set up robuild to build my TypeScript library with ESM and CJS formats
```

```
Configure robuild to generate type declarations and package.json exports
```

```
Help me configure multiple entries in robuild
```

```
Set up watch mode for development with robuild
```

```
Add shims for ESM/CJS compatibility in my robuild config
```

## Documentation

- [GitHub Repository](https://github.com/Sunny-117/robuild)
- [Rolldown](https://rolldown.rs)
- [Oxc](https://oxc.rs)

## License

MIT
