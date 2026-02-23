import type {
  BuildConfig,
  BuildContext,
  BuildEntry,
  BundleEntry,
  TransformEntry,
} from './types'

import { join } from 'node:path'
import { colors as c } from 'consola/utils'
import prettyBytes from 'pretty-bytes'

import { rolldownBuild } from './builders/bundle'
import { transformDir } from './builders/transform'

import {
  getBundleEntryInput,
  hasValidInput,
  normalizeEntryInput,
  parseEntryString,
} from './config/entry-resolver'
import { loadViteConfig, mergeViteConfig } from './config/vite-config'
import { configureLogger, logger, resetLogCounts, shouldFailOnWarnings } from './core/logger'
import { generatePackageExports, updatePackageJsonExports } from './transforms/exports'
import { createBuildResult, executeOnSuccess } from './transforms/on-success'

import { analyzeDir, normalizePath } from './utils/index'
import { performWatchBuild } from './watch'

/**
 * Shared configuration fields between BuildConfig and BuildEntry
 */
const SHARED_CONFIG_FIELDS = [
  'format',
  'outDir',
  'platform',
  'target',
  'minify',
  'dts',
  'dtsOnly',
  'splitting',
  'treeshake',
  'sourcemap',
  'external',
  'noExternal',
  'env',
  'alias',
  'banner',
  'footer',
  'shims',
  'rolldown',
  'loaders',
  'clean',
] as const

/**
 * Inherit configuration from parent config to entry
 * Only inherits fields that are not already set in the entry
 */
export function inheritConfig<T extends Partial<BuildEntry>>(
  entry: T,
  config: BuildConfig,
  additionalMappings?: Record<string, string>,
): T {
  const result: any = { ...entry }

  // Inherit shared fields
  for (const field of SHARED_CONFIG_FIELDS) {
    if (result[field] === undefined && config[field] !== undefined) {
      ;result[field] = config[field]
    }
  }

  // Handle additional field mappings (e.g., 'name' -> 'globalName')
  if (additionalMappings) {
    for (const [configKey, entryKey] of Object.entries(additionalMappings)) {
      if (result[entryKey] === undefined && (config as any)[configKey] !== undefined) {
        ;result[entryKey] = (config as any)[configKey]
      }
    }
  }

  return result
}

/**
 * Normalize tsup-style config to entries-based config
 */
function normalizeTsupConfig(config: BuildConfig): BuildConfig {
  // If entries already exist, no need to normalize
  if (config.entries && config.entries.length > 0) {
    return config
  }

  // If entry field exists (tsup-style), convert to entries
  if (config.entry) {
    const entry: BundleEntry = inheritConfig(
      {
        type: 'bundle' as const,
        entry: config.entry,
      },
      config,
      {
        name: 'globalName', // Map 'name' to 'globalName'
      },
    )

    return {
      ...config,
      entries: [entry],
    }
  }

  return config
}

/**
 * Build dist/ from src/
 */
export async function build(config: BuildConfig): Promise<void> {
  const startTime = Date.now()

  // Configure logger
  if (config.logLevel) {
    configureLogger(config.logLevel)
  }

  // Reset log counts for this build
  resetLogCounts()

  const pkgDir = normalizePath(config.cwd)
  const pkg = await readJSON(join(pkgDir, 'package.json')).catch(() => ({}))
  const ctx: BuildContext = { pkg, pkgDir }

  // Load Vite config if requested
  let finalConfig = config
  if (config.fromVite) {
    logger.verbose('Loading configuration from Vite config file')
    const viteConfig = await loadViteConfig(pkgDir)
    finalConfig = mergeViteConfig(viteConfig, config)
  }

  // Normalize tsup-style config to entries-based config
  finalConfig = normalizeTsupConfig(finalConfig)

  // Check if watch mode is enabled
  if (finalConfig.watch?.enabled) {
    logger.info(
      `Watching ${c.cyan(ctx.pkg.name || '<unnamed>')}`,
    )

    // Use rolldown's built-in watch mode
    await performWatchBuild(finalConfig, ctx, startTime)
    return
  }

  logger.info(
    `Building ${c.cyan(ctx.pkg.name || '<unnamed>')}`,
  )

  await performBuild(finalConfig, ctx, startTime)
}

/**
 * Perform the actual build process
 */
export async function performBuild(config: BuildConfig, ctx: BuildContext, startTime: number): Promise<void> {
  const start = Date.now()
  const hooks = config.hooks || {}

  await hooks.start?.(ctx)

  const entries = (config.entries || []).map((rawEntry) => {
    // Parse string entries using shared logic
    let entry: TransformEntry | BundleEntry = typeof rawEntry === 'string'
      ? parseEntryString(rawEntry)
      : rawEntry

    // Inherit top-level config fields if not specified in entry
    if (entry.type === 'bundle') {
      entry = inheritConfig(entry as BundleEntry, config)
    }
    else if (entry.type === 'transform') {
      entry = inheritConfig(entry as TransformEntry, config)
    }

    // Check for valid input using shared logic
    if (!hasValidInput(entry)) {
      throw new Error(
        `Build entry missing \`input\` or \`entry\`: ${JSON.stringify(entry, null, 2)}`,
      )
    }

    entry = { ...entry }
    entry.outDir = normalizePath(entry.outDir || 'dist', ctx.pkgDir)

    // Normalize input/entry paths using shared logic
    if (entry.type === 'transform') {
      if ((entry as TransformEntry).input) {
        ;(entry as TransformEntry).input = normalizePath((entry as TransformEntry).input, ctx.pkgDir)
      }
    }
    else {
      const entryInput = getBundleEntryInput(entry as BundleEntry)
      if (entryInput) {
        ;(entry as BundleEntry).input = normalizeEntryInput(entryInput, ctx.pkgDir)
      }
    }

    return entry
  })

  await hooks.entries?.(entries, ctx)

  // Collect unique output directories for size analysis
  const outDirs: Array<string> = []
  for (const outDir of entries.map(e => e.outDir).sort() as string[]) {
    if (!outDirs.some(dir => outDir.startsWith(dir))) {
      outDirs.push(outDir)
    }
  }

  // Build all entries in parallel for better performance
  await Promise.all(
    entries.map(entry =>
      entry.type === 'bundle'
        ? rolldownBuild(ctx, entry, hooks, config)
        : transformDir(ctx, entry),
    ),
  )

  await hooks.end?.(ctx)

  // Generate package.json exports if enabled
  if (config.exports?.enabled) {
    const exportsCtx = {
      pkgDir: ctx.pkgDir,
      config,
      entries,
    }
    const packageExports = generatePackageExports(exportsCtx, config.exports)

    if (Object.keys(packageExports).length > 0 && config.exports.autoUpdate !== false) {
      updatePackageJsonExports(ctx.pkgDir, packageExports)
    }
  }

  // Check for warnings and fail if requested
  if (shouldFailOnWarnings(config.failOnWarn || false)) {
    throw new Error('Build failed due to warnings')
  }

  const dirSize = analyzeDir(outDirs)
  logger.info(
    c.dim(
      `\nTotal: ${c.bold(prettyBytes(dirSize.size))} (${dirSize.files} files)`,
    ),
  )

  const duration = Date.now() - start
  logger.success(`\nBuild succeeded in ${c.bold(`${duration}ms`)}`)

  // Execute onSuccess callback
  if (config.onSuccess) {
    const buildResult = createBuildResult([], startTime)
    await executeOnSuccess(config.onSuccess, buildResult, ctx.pkgDir)
  }
}

// --- utils ---

async function readJSON(specifier: string) {
  const module = await import(specifier, {
    with: { type: 'json' },
  })
  return module.default
}
