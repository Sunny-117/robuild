#!/usr/bin/env node

import type { BuildConfig, BuildEntry } from './types'
import process from 'node:process'
import { loadConfig } from 'c12'
import { cac } from 'cac'
import { consola } from 'consola'
import { colors as c } from 'consola/utils'
import { build } from './build'

const pkg = await import('../package.json', { with: { type: 'json' } })

const cli = cac('robuild')

cli
  .version(pkg.default.version)
  .help()

cli
  .command('[...entries]', 'Bundle or transform files', {
    ignoreOptionDefaultValue: true,
    allowUnknownOptions: false,
  })
  .option('-c, --config <filename>', 'Use a custom config file')
  .option('--no-config', 'Disable config file')
  .option('--dir <dir>', 'Working directory', { default: '.' })
  .option('--stub', 'Generate stub files instead of building')
  .option('-w, --watch', 'Enable watch mode')
  .option('-f, --format <format>', 'Output format(s): esm, cjs, iife, umd')
  .option('-d, --out-dir <dir>', 'Output directory', { default: 'dist' })
  .option('--platform <platform>', 'Target platform: browser, node, neutral', { default: 'node' })
  .option('--target <target>', 'Target ES version: es2015, es2020, esnext, etc.', { default: 'es2022' })
  .option('--global-name <name>', 'Global variable name for IIFE/UMD formats')
  .option('--minify', 'Minify output')
  .option('--dts', 'Generate declaration files')
  .option('--dts-only', 'Only generate declaration files')
  .option('--splitting', 'Enable code splitting')
  .option('--treeshake', 'Enable tree shaking', { default: true })
  .option('--sourcemap', 'Generate source maps')
  .option('--clean', 'Clean output directory before build')
  .option('--no-clean', 'Disable cleaning output directory')
  .option('--external <module>', 'Mark dependencies as external')
  .option('--no-external <module>', 'Force bundle dependencies')
  .option('--shims', 'Enable CJS/ESM compatibility shims')
  .option('--skip-node-modules', 'Skip bundling node_modules dependencies')
  .option('--unbundle', 'Preserve file structure without bundling')
  .option('--cjs-default <mode>', 'CommonJS default export handling: true, false, auto')
  .option('--generate-exports', 'Generate package.json exports field')
  .option('-l, --log-level <level>', 'Log level: silent, error, warn, info, verbose', { default: 'info' })
  .option('--on-success <command>', 'Command to run after successful build')
  .option('--fail-on-warn', 'Fail build on warnings')
  .option('--ignore-watch <pattern>', 'Ignore patterns in watch mode')
  .option('--from-vite', 'Load configuration from Vite config file')
  .example('robuild src/index.ts')
  .example('robuild src/index.ts --format esm --format cjs')
  .example('robuild src/ --watch')
  .example('robuild --config custom.config.ts')
  .action(async (entries: string[], flags: any) => {
    try {
      await runBuild(entries, flags)
    }
    catch (error) {
      consola.error(error)
      process.exit(1)
    }
  })

async function runBuild(entries: string[], flags: any): Promise<void> {
  // Set log level
  if (flags.logLevel) {
    consola.level = flags.logLevel === 'silent' ? 0 : flags.logLevel === 'verbose' ? 5 : 3
  }

  // Show version info
  consola.info(`robuild ${c.dim(`v${pkg.default.version}`)}`)
  consola.info('')

  // Load config file
  const configOptions: any = {
    name: 'robuild',
    cwd: flags.dir || '.',
  }

  // Handle --config option
  if (flags.config) {
    configOptions.configFile = flags.config
  }
  else if (flags.noConfig) {
    configOptions.configFile = false
  }
  else {
    configOptions.configFile = 'build.config'
  }

  const { config = {} } = await loadConfig<BuildConfig>(configOptions)

  // Support both entries and entry (tsup-style)
  let rawEntries: (BuildEntry | string)[]
  if (entries.length > 0) {
    rawEntries = entries
  }
  else if (config.entries && config.entries.length > 0) {
    rawEntries = config.entries
  }
  else if (config.entry) {
    // Convert tsup-style entry to entries format
    rawEntries = [{
      type: 'bundle' as const,
      entry: config.entry,
      format: config.format,
      outDir: config.outDir,
      platform: config.platform,
      target: config.target,
      globalName: config.name,
      minify: config.minify,
      dts: config.dts,
      dtsOnly: config.dtsOnly,
      splitting: config.splitting,
      treeshake: config.treeshake,
      sourcemap: config.sourcemap,
      external: config.external,
      noExternal: config.noExternal,
      env: config.env,
      alias: config.alias,
      banner: config.banner,
      footer: config.footer,
      shims: config.shims,
      rolldown: config.rolldown,
    }]
  }
  else {
    // Default entry: src/index.ts
    const { existsSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const defaultEntry = resolve(flags.dir || '.', 'src/index.ts')

    if (existsSync(defaultEntry)) {
      rawEntries = ['src/index.ts']
    }
    else {
      rawEntries = []
    }
  }

  const processedEntries: BuildEntry[] = rawEntries.map((entry) => {
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
        if (flags.format) {
          baseEntry.format = Array.isArray(flags.format) ? flags.format : [flags.format]
        }

        if (flags.platform) {
          baseEntry.platform = flags.platform
        }

        if (flags.target) {
          baseEntry.target = flags.target
        }

        if (flags.globalName) {
          baseEntry.globalName = flags.globalName
        }

        if (flags.minify) {
          baseEntry.minify = true
        }

        if (flags.dts) {
          baseEntry.dts = true
        }

        if (flags.dtsOnly) {
          baseEntry.dtsOnly = true
        }

        if (flags.splitting) {
          baseEntry.splitting = true
        }

        if (flags.treeshake !== undefined) {
          baseEntry.treeshake = flags.treeshake
        }

        if (flags.sourcemap) {
          baseEntry.sourcemap = true
        }

        if (flags.external) {
          baseEntry.external = Array.isArray(flags.external) ? flags.external : [flags.external]
        }

        if (flags.noExternal !== undefined && flags.noExternal !== true) {
          baseEntry.noExternal = Array.isArray(flags.noExternal) ? flags.noExternal : [flags.noExternal]
        }

        if (flags.cjsDefault) {
          baseEntry.cjsDefault = flags.cjsDefault
        }

        if (flags.shims) {
          baseEntry.shims = true
        }

        if (flags.skipNodeModules) {
          baseEntry.skipNodeModules = true
        }

        if (flags.unbundle) {
          baseEntry.unbundle = true
        }

        return baseEntry as BuildEntry
      }
    }
    return entry
  })

  if (flags.stub) {
    for (const entry of processedEntries) {
      entry.stub = true
    }
  }

  if (rawEntries.length === 0) {
    consola.error('No build entries specified.')
    consola.info('Run `robuild --help` for usage information.')
    process.exit(1)
  }

  // Build final config with CLI overrides
  const buildConfig: BuildConfig = {
    cwd: flags.dir,
    ...config,
    entries: processedEntries,
    watch: flags.watch
      ? {
          enabled: true,
          ...config.watch,
        }
      : config.watch,
    clean: flags.clean === false ? false : (flags.clean ?? config.clean ?? true),
    logLevel: flags.logLevel || config.logLevel,
    onSuccess: flags.onSuccess || config.onSuccess,
    failOnWarn: flags.failOnWarn ?? config.failOnWarn,
    ignoreWatch: flags.ignoreWatch || config.ignoreWatch,
    fromVite: flags.fromVite ?? config.fromVite,
    exports: flags.generateExports
      ? { enabled: true, ...config.exports }
      : config.exports,
  }

  await build(buildConfig)
}

// Run CLI
cli.parse(process.argv, { run: false })

try {
  await cli.runMatchedCommand()
}
catch (error) {
  consola.error(error)
  process.exit(1)
}
