# Skills Generation Information

This document contains information about how these skills were generated and how to keep them synchronized with the documentation.

## Generation Details

**Generated from documentation at:**
- **Commit SHA**: `9521157`
- **Date**: 2026-02-21
- **Project Version**: v0.1.4

**Source documentation:**
- Main docs: `/docs` folder
- Project README: `/README.md`
- CLAUDE.md: `/CLAUDE.md`

## Structure

```
skills/
├── GENERATION.md               # This file
└── robuild/
    ├── README.md               # User-facing README
    ├── SKILL.md                # Main skill file with quick reference
    └── references/             # Detailed reference documentation
```

## File Naming Convention

Files are prefixed by category:
- `guide-*` - Getting started guides and tutorials
- `option-*` - Configuration options
- `advanced-*` - Advanced topics (plugins, hooks, programmatic API)
- `recipe-*` - Framework-specific recipes
- `reference-*` - CLI and API reference

## How Skills Were Generated

The robuild skills were created by:

1. **Reading core documentation** from `/docs` folder:
   - `/docs/guide/*.md` - Core guides (getting started, configuration, etc.)
   - `/docs/api/*.md` - API documentation
   - `/docs/architecture/*.md` - Architecture documentation

2. **Creating main SKILL.md**: Quick reference file with:
   - When to use robuild
   - Quick start commands
   - Basic configuration examples
   - Core references table
   - Build options table
   - Common patterns and best practices
   - CLI quick reference

3. **Creating reference documentation**:
   - Core guides (getting started, configuration)
   - Configuration options (one file per major option)
   - Advanced topics (plugins, hooks)
   - CLI reference

## Updating Skills (For Future Agents)

When robuild documentation changes, follow these steps to update the skills:

### 1. Check for Documentation Changes

```bash
# Get changes in docs since generation
git diff 9521157..HEAD -- docs/

# List changed files
git diff --name-only 9521157..HEAD -- docs/

# Get summary of changes
git log --oneline 9521157..HEAD -- docs/
```

### 2. Identify What Changed

Focus on these documentation areas:
- `/docs/guide/` - Getting started, configuration, modes
- `/docs/api/` - CLI, config, types
- `/docs/architecture/` - Core, builders, plugins

### 3. Update Skills

**For minor changes** (typos, clarifications, small additions):
- Update the relevant section in `SKILL.md`
- Update corresponding file in `references/` if needed

**For major changes**:
- Read the changed documentation files
- Update `SKILL.md` sections
- Update or add files in `references/`

**For new features**:
- Add documentation file to `references/` with appropriate prefix
- Add entry in `SKILL.md` with brief description and code example

### 4. Sync Checklist

- [ ] Read diff of docs since last generation
- [ ] Identify new options/features added
- [ ] Identify changed/deprecated options
- [ ] Update `SKILL.md` with changes
- [ ] Update `references/` folder
- [ ] Update this `GENERATION.md` with new SHA

## Reference Files

### Core Guides
- `guide-getting-started.md` - Installation, first bundle, CLI basics
- `guide-configuration.md` - Configuration file formats and options

### Configuration Options
- `option-entry.md` - Entry point configuration
- `option-format.md` - Output formats (ESM, CJS, IIFE)
- `option-output.md` - Output directory and extensions
- `option-dts.md` - TypeScript declaration generation
- `option-platform.md` - Platform (node, browser)
- `option-external.md` - External dependencies
- `option-plugins.md` - Plugin configuration
- `option-exports.md` - Package exports generation

### Advanced Topics
- `advanced-plugins.md` - Rolldown plugin support
- `advanced-hooks.md` - Build hooks
- `advanced-transform.md` - Transform mode

### Reference
- `reference-cli.md` - CLI commands and options

## Version History

| Date       | SHA      | Changes |
|------------|----------|---------|
| 2026-02-21 | 9521157  | Initial generation with exports feature |

---

Last updated: 2026-02-21
Current SHA: 9521157
