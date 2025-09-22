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
  },
})

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

await build({
  cwd: args.values.dir,
  ...config,
  entries,
  watch: args.values.watch ? { enabled: true, ...config.watch } : config.watch,
})
