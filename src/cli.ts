#!/usr/bin/env node

import type { BuildConfig, BuildEntry } from './types'
import { parseArgs } from 'node:util'
import { loadConfig } from 'c12'
import { consola } from 'consola'

import { build } from './build'

// https://nodejs.org/api/util.html#utilparseargsconfig
const args = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    'dir': {
      type: 'string',
      default: '.',
    },
    'stub': {
      type: 'boolean',
      default: false,
    },
    'watch': {
      type: 'boolean',
      default: false,
      short: 'w',
    },
    'format': {
      type: 'string',
      multiple: true,
    },
    'platform': {
      type: 'string',
    },
    'target': {
      type: 'string',
    },
    'global-name': {
      type: 'string',
    },
    'clean': {
      type: 'boolean',
      default: true,
    },
    'no-clean': {
      type: 'boolean',
    },
    'external': {
      type: 'string',
      multiple: true,
    },
    'no-external': {
      type: 'string',
      multiple: true,
    },
    'log-level': {
      type: 'string',
    },
    'on-success': {
      type: 'string',
    },
    'fail-on-warn': {
      type: 'boolean',
    },
    'ignore-watch': {
      type: 'string',
      multiple: true,
    },
    'from-vite': {
      type: 'boolean',
    },
    'workspace': {
      type: 'boolean',
    },
    'filter': {
      type: 'string',
      multiple: true,
    },
    'generate-exports': {
      type: 'boolean',
    },
    'help': {
      type: 'boolean',
    },
    'version': {
      type: 'boolean',
    },
  },
})

// Handle help and version flags
if (args.values.help) {
  console.log(`
Usage: robuild [options] [entries...]

Options:
  --dir <dir>              Working directory (default: ".")
  --stub                   Generate stub files instead of building
  -w, --watch              Enable watch mode
  --format <format>        Output format(s): esm, cjs, iife, umd (can be used multiple times)
  --platform <platform>    Target platform: browser, node, neutral
  --target <target>        Target ES version: es5, es2015, es2016, es2017, es2018, es2019, es2020, es2021, es2022, esnext
  --global-name <name>     Global variable name for IIFE/UMD formats
  --clean                  Clean output directory before build (default: true)
  --no-clean               Disable cleaning output directory
  --external <module>      Mark dependencies as external (can be used multiple times)
  --no-external <module>   Force bundle dependencies (can be used multiple times)
  --log-level <level>      Log level: silent, error, warn, info, verbose (default: info)
  --on-success <command>   Command to run after successful build
  --fail-on-warn           Fail build on warnings
  --ignore-watch <pattern> Ignore patterns in watch mode (can be used multiple times)
  --from-vite              Load configuration from Vite config file
  --workspace              Enable workspace mode for monorepo builds
  --filter <pattern>       Filter workspace packages by name or path pattern (can be used multiple times)
  --generate-exports       Generate package.json exports field
  --help                   Show this help message
  --version                Show version number

Examples:
  robuild src/index.ts                    # Bundle single file
  robuild src/index.ts --format esm cjs  # Multiple formats
  robuild src/ --watch                   # Transform directory in watch mode
  robuild --help                         # Show help
`)
  process.exit(0)
}

if (args.values.version) {
  const pkg = await import('../package.json', { with: { type: 'json' } })
  console.log(pkg.default.version)
  process.exit(0)
}

const { config = {} } = await loadConfig<BuildConfig>({
  name: 'robuild',
  configFile: 'build.config',
  cwd: args.values.dir,
})

const rawEntries
  = args.positionals.length > 0
    ? (args.positionals as string[])
    : config.entries || []

const entries: BuildEntry[] = rawEntries.map((entry) => {
  if (typeof entry === 'string') {
    const [input, outDir] = entry.split(':') as [string, string | undefined]

    if (input.endsWith('/')) {
      // Transform entry
      return { type: 'transform' as const, input, outDir }
    }
    else {
      // Bundle entry
      const baseEntry: any = {
        type: 'bundle' as const,
        input: input.split(','),
        outDir,
      }

      // Apply CLI options to bundle entries
      // Format options
      if (args.values.format) {
        baseEntry.format = args.values.format
      }

      // Platform option
      if (args.values.platform) {
        baseEntry.platform = args.values.platform
      }

      // Target option
      if (args.values.target) {
        baseEntry.target = args.values.target
      }

      // Global name for IIFE/UMD
      if (args.values['global-name']) {
        baseEntry.globalName = args.values['global-name']
      }

      // Clean option
      if (args.values['no-clean']) {
        baseEntry.clean = false
      }
      else if (args.values.clean !== undefined) {
        baseEntry.clean = args.values.clean
      }

      // External dependencies
      if (args.values.external) {
        baseEntry.external = args.values.external.map(ext =>
          ext.startsWith('/') && ext.endsWith('/')
            ? new RegExp(ext.slice(1, -1))
            : ext,
        )
      }

      // No external dependencies
      if (args.values['no-external']) {
        baseEntry.noExternal = args.values['no-external'].map(ext =>
          ext.startsWith('/') && ext.endsWith('/')
            ? new RegExp(ext.slice(1, -1))
            : ext,
        )
      }

      return baseEntry as BuildEntry
    }
  }
  return entry
})

if (args.values.stub) {
  for (const entry of entries) {
    entry.stub = true
  }
}

if (rawEntries.length === 0) {
  consola.error('No build entries specified.')
  process.exit(1)
}

// Build final config with CLI overrides
const buildConfig: BuildConfig = {
  cwd: args.values.dir,
  ...config,
  entries,
  watch: args.values.watch
    ? {
        enabled: true,
        ...config.watch,
        ...(args.values['ignore-watch'] ? { exclude: [...(config.watch?.exclude || []), ...args.values['ignore-watch']] } : {}),
      }
    : config.watch,
}

// Apply CLI-level options
if (args.values['log-level']) {
  buildConfig.logLevel = args.values['log-level'] as any
}

if (args.values['on-success']) {
  buildConfig.onSuccess = args.values['on-success']
}

if (args.values['fail-on-warn']) {
  buildConfig.failOnWarn = true
}

if (args.values['ignore-watch']) {
  buildConfig.ignoreWatch = args.values['ignore-watch']
}

if (args.values['from-vite']) {
  buildConfig.fromVite = true
}

if (args.values.workspace) {
  buildConfig.workspace = {
    packages: ['packages/*', 'apps/*'],
    ...config.workspace,
  }
}

if (args.values.filter) {
  buildConfig.filter = args.values.filter
}

if (args.values['generate-exports']) {
  buildConfig.exports = {
    enabled: true,
    includeTypes: true,
    autoUpdate: true,
    ...config.exports,
  }
}

await build(buildConfig)
