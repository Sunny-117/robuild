import type {
  BuildConfig,
  BuildContext,
  BuildEntry,
  BundleEntry,
  TransformEntry,
} from './types'

import { isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { colors as c } from 'consola/utils'
import prettyBytes from 'pretty-bytes'

import { rolldownBuild } from './builders/bundle'
import { transformDir } from './builders/transform'

import { configureLogger, logger, resetLogCounts, shouldFailOnWarnings } from './features/logger'
import { createBuildResult, executeOnSuccess } from './features/on-success'
import { loadViteConfig } from './features/vite-config'

import { analyzeDir } from './utils'
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
] as const

/**
 * Inherit configuration from parent config to entry
 * Only inherits fields that are not already set in the entry
 */
function inheritConfig<T extends Partial<BuildEntry>>(
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
    finalConfig = { ...viteConfig, ...config } // config overrides vite config
  }

  // Normalize tsup-style config to entries-based config
  finalConfig = normalizeTsupConfig(finalConfig)

  // Check if watch mode is enabled
  if (finalConfig.watch?.enabled) {
    logger.info(
      `👀 Starting watch mode for \`${ctx.pkg.name || '<no name>'}\` (\`${ctx.pkgDir}\`)`,
    )

    // Use rolldown's built-in watch mode
    await performWatchBuild(finalConfig, ctx, startTime)
    return
  }

  logger.info(
    `📦 Building \`${ctx.pkg.name || '<no name>'}\` (\`${ctx.pkgDir}\`)`,
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
    let entry: TransformEntry | BundleEntry

    if (typeof rawEntry === 'string') {
      const [input, outDir] = rawEntry.split(':') as [
        string,
        string | undefined,
      ]
      entry = input.endsWith('/')
        ? ({ type: 'transform', input, outDir } as TransformEntry)
        : ({ type: 'bundle', input: input.split(','), outDir } as BundleEntry)
    }
    else {
      entry = rawEntry
    }

    // Inherit top-level config fields if not specified in entry
    if (entry.type === 'bundle') {
      entry = inheritConfig(entry as BundleEntry, config)
    }
    else if (entry.type === 'transform') {
      entry = inheritConfig(entry as TransformEntry, config)
    }

    // Check for input or entry (tsup compatibility)
    const hasInput = entry.type === 'transform'
      ? !!entry.input
      : !!((entry as BundleEntry).input || (entry as BundleEntry).entry)

    if (!hasInput) {
      throw new Error(
        `Build entry missing \`input\` or \`entry\`: ${JSON.stringify(entry, null, 2)}`,
      )
    }
    entry = { ...entry }
    entry.outDir = normalizePath(entry.outDir || 'dist', ctx.pkgDir)

    // Normalize input/entry paths
    if (entry.type === 'transform') {
      // Normalize transform entry input
      if ((entry as TransformEntry).input) {
        ;(entry as TransformEntry).input = normalizePath((entry as TransformEntry).input, ctx.pkgDir)
      }
    }
    else {
      // Normalize bundle entry input/entry
      const entryInput = (entry as BundleEntry).input || (entry as BundleEntry).entry
      if (entryInput) {
        if (typeof entryInput === 'object' && !Array.isArray(entryInput)) {
          // Handle object format (named entries)
          const normalizedInput: Record<string, string> = {}
          for (const [key, value] of Object.entries(entryInput)) {
            normalizedInput[key] = normalizePath(value, ctx.pkgDir)
          }
          ;(entry as BundleEntry).input = normalizedInput
        }
        else if (Array.isArray(entryInput)) {
          ;(entry as BundleEntry).input = entryInput.map(p => normalizePath(p, ctx.pkgDir))
        }
        else {
          ;(entry as BundleEntry).input = normalizePath(entryInput, ctx.pkgDir)
        }
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

  for (const entry of entries) {
    await (entry.type === 'bundle'
      ? rolldownBuild(ctx, entry, hooks, config)
      : transformDir(ctx, entry))
  }

  await hooks.end?.(ctx)

  // Check for warnings and fail if requested
  if (shouldFailOnWarnings(config.failOnWarn || false)) {
    throw new Error('Build failed due to warnings')
  }

  const dirSize = analyzeDir(outDirs)
  logger.info(
    c.dim(
      `\nΣ Total dist byte size: ${c.underline(prettyBytes(dirSize.size))} (${c.underline(dirSize.files)} files)`,
    ),
  )

  const duration = Date.now() - start
  logger.success(`\n✅ robuild finished in ${duration}ms`)

  // Execute onSuccess callback
  if (config.onSuccess) {
    const buildResult = createBuildResult([], startTime)
    await executeOnSuccess(config.onSuccess, buildResult, ctx.pkgDir)
  }
}

// --- utils ---

function normalizePath(path: string | URL | undefined, resolveFrom?: string) {
  return typeof path === 'string' && isAbsolute(path)
    ? path
    : path instanceof URL
      ? fileURLToPath(path)
      : resolve(resolveFrom || '.', path || '.')
}

async function readJSON(specifier: string) {
  const module = await import(specifier, {
    with: { type: 'json' },
  })
  return module.default
}
