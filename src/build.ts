import type {
  BuildConfig,
  BuildContext,
  BundleEntry,
  TransformEntry,
} from './types'

import { isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { colors as c } from 'consola/utils'
import prettyBytes from 'pretty-bytes'

import { rolldownBuild } from './builders/bundle'
import { transformDir } from './builders/transform'
import { generatePackageExports, updatePackageJsonExports } from './features/exports'
import { configureLogger, logger, resetLogCounts, shouldFailOnWarnings } from './features/logger'
import { createBuildResult, executeOnSuccess } from './features/on-success'
import { loadViteConfig } from './features/vite-config'
import {
  buildWorkspacePackages,
  discoverWorkspacePackages,
  filterWorkspacePackages,
  loadWorkspaceConfig,
} from './features/workspace'
import { analyzeDir } from './utils'
import { performWatchBuild } from './watch'

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

  // Handle workspace builds
  if (config.workspace) {
    return buildWorkspace(config, pkgDir)
  }

  // Load Vite config if requested
  let finalConfig = config
  if (config.fromVite) {
    logger.verbose('Loading configuration from Vite config file')
    const viteConfig = await loadViteConfig(pkgDir)
    finalConfig = { ...viteConfig, ...config } // config overrides vite config
  }

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

    if (!entry.input) {
      throw new Error(
        `Build entry missing \`input\`: ${JSON.stringify(entry, null, 2)}`,
      )
    }
    entry = { ...entry }
    entry.outDir = normalizePath(entry.outDir || 'dist', ctx.pkgDir)
    entry.input = Array.isArray(entry.input)
      ? entry.input.map(p => normalizePath(p, ctx.pkgDir))
      : normalizePath(entry.input, ctx.pkgDir)
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

/**
 * Build workspace packages
 */
async function buildWorkspace(config: BuildConfig, workspaceRoot: string): Promise<void> {
  logger.info('🏢 Building workspace packages...')

  // Load workspace configuration
  const workspaceConfig = await loadWorkspaceConfig(workspaceRoot)
  if (!workspaceConfig) {
    throw new Error('No workspace configuration found')
  }

  // Discover packages
  const allPackages = await discoverWorkspacePackages(workspaceRoot, workspaceConfig.packages)

  if (allPackages.length === 0) {
    logger.warn('No packages found in workspace')
    return
  }

  // Filter packages
  const filteredPackages = filterWorkspacePackages(
    allPackages,
    config.filter || config.workspace?.filter,
    config.workspace?.exclude,
  )

  if (filteredPackages.length === 0) {
    logger.warn('No packages match the filter criteria')
    return
  }

  logger.info(`Building ${filteredPackages.length} packages`)

  // Build packages
  const buildPackage = async (pkg: any) => {
    logger.info(`📦 Building ${pkg.name}...`)

    try {
      // Create package-specific config
      const packageConfig: BuildConfig = {
        ...config,
        cwd: pkg.path,
        workspace: undefined, // Prevent recursive workspace builds
      }

      // Build the package
      await build(packageConfig)

      // Generate exports if enabled
      if (config.exports?.enabled) {
        const exportsConfig = { enabled: true, ...config.exports }
        const exports = await generatePackageExports(pkg.path, packageConfig, exportsConfig)
        if (config.exports.autoUpdate) {
          await updatePackageJsonExports(pkg.path, exports)
          logger.info(`Updated exports for ${pkg.name}`)
        }
      }

      logger.success(`Built ${pkg.name}`)
    }
    catch (error) {
      logger.error(`Failed to build ${pkg.name}:`, error)
      throw error
    }
  }

  // Execute builds
  await buildWorkspacePackages(filteredPackages, buildPackage)

  logger.success(`Successfully built ${filteredPackages.length} packages`)
}

function readJSON(specifier: string) {
  return import(specifier, {
    with: { type: 'json' },
  }).then(r => r.default)
}
