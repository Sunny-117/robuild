import type { BuildConfig, BuildContext } from './types'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consola } from 'consola'
import { watch } from 'rolldown'
import { logger } from './features/logger'

// Utility function to normalize paths (copied from build.ts)
function normalizePath(path: string | URL | undefined, resolveFrom?: string) {
  return typeof path === 'string' && isAbsolute(path)
    ? path
    : path instanceof URL
      ? fileURLToPath(path)
      : resolve(resolveFrom || '.', path || '.')
}

/**
 * Perform watch build using rolldown's built-in watch mode
 */
export async function performWatchBuild(
  config: BuildConfig,
  ctx: BuildContext,
  startTime: number,
): Promise<void> {
  // Import performBuild dynamically to avoid circular dependency
  const { performBuild } = await import('./build')

  // Perform initial build
  await performBuild(config, ctx, startTime)

  // For bundle entries, use rolldown's watch mode
  const bundleEntries = (config.entries || []).filter((entry) => {
    if (typeof entry === 'string') {
      return !entry.endsWith('/')
    }
    return entry.type === 'bundle'
  })

  if (bundleEntries.length > 0) {
    // Use rolldown's watch mode for bundle entries
    await startRolldownWatch(ctx, bundleEntries)
  }
  else {
    // For transform-only builds, fall back to custom watch
    logger.warn('Transform-only watch mode not yet implemented with rolldown')
    // Keep the process alive
    return new Promise(() => {})
  }
}

/**
 * Start rolldown watch mode for bundle entries
 *
 * Note: Watch mode currently uses simplified rolldown configuration.
 * For full feature parity with build mode, the initial build is performed first.
 * The watch mode then monitors for file changes and triggers rebuilds.
 */
export async function startRolldownWatch(
  ctx: BuildContext,
  bundleEntries: any[],
): Promise<void> {
  logger.info('🚧 Using rolldown built-in watch mode...')

  // Create rolldown watch configurations for each bundle entry
  const watchConfigs = []

  for (const rawEntry of bundleEntries) {
    let entry
    if (typeof rawEntry === 'string') {
      const [input, outDir] = rawEntry.split(':') as [string, string | undefined]
      entry = {
        type: 'bundle' as const,
        input,
        outDir: outDir || 'dist',
      }
    }
    else {
      entry = rawEntry
    }

    // Normalize input path
    entry.input = Array.isArray(entry.input)
      ? entry.input.map((i: string) => normalizePath(i, ctx.pkgDir))
      : normalizePath(entry.input, ctx.pkgDir)

    // Get target and other options from entry
    const target = entry.target || 'es2022'
    const platform = entry.platform || 'node'
    const format = entry.format || 'esm'

    // Determine the correct file extension based on format
    const getExtension = (fmt: string) => {
      switch (fmt) {
        case 'esm':
          return '.mjs'
        case 'cjs':
          return '.cjs'
        case 'iife':
        case 'umd':
          return '.js'
        default:
          return '.mjs'
      }
    }

    const extension = getExtension(Array.isArray(format) ? format[0] : format)
    const rolldownFormat = Array.isArray(format) ? format[0] : format
    const formatMap: Record<string, 'es' | 'cjs' | 'iife' | 'umd'> = {
      esm: 'es',
      cjs: 'cjs',
      iife: 'iife',
      umd: 'umd',
    }

    // Create rolldown config for this entry with proper transform options
    const watchConfig = {
      input: Array.isArray(entry.input) ? entry.input[0] : entry.input,
      output: {
        dir: entry.outDir,
        format: formatMap[rolldownFormat] || 'es',
        entryFileNames: `[name]${extension}`,
        sourcemap: entry.sourcemap,
      },
      platform: platform === 'node' ? 'node' : 'neutral',
      transform: {
        target,
      },
    }

    watchConfigs.push(watchConfig)
  }

  // Start watching with rolldown
  const watcher = watch(watchConfigs)

  watcher.on('event', (event) => {
    switch (event.code) {
      case 'START':
        logger.info('🔄 Rebuilding...')
        break
      case 'BUNDLE_START':
        logger.info('📦 Bundling...')
        break
      case 'BUNDLE_END':
        logger.success('✅ Bundle complete')
        break
      case 'END':
        logger.success('🎉 Watch rebuild complete')
        break
      case 'ERROR':
        logger.error('❌ Build error:', (event as any).error)
        break
    }
  })

  // Handle graceful shutdown
  const cleanup = async () => {
    consola.info('🛑 Stopping watch mode...')
    await watcher.close()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  // Keep the process alive
  return new Promise(() => {})
}
