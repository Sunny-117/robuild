import type { ModuleFormat, WatchOptions } from 'rolldown'
import type { BuildConfig, BuildContext } from './types'
import { consola } from 'consola'
import { watch } from 'rolldown'
import {
  getBundleEntryInput,
  normalizeEntryInput,
  parseEntryString,
} from './features/entry-resolver'
import { getFormatExtension } from './features/extensions'
import { resolveExternalConfig } from './features/external'
import { logger } from './features/logger'

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
    await startRolldownWatch(config, ctx, bundleEntries)
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
  config: BuildConfig,
  ctx: BuildContext,
  bundleEntries: any[],
): Promise<void> {
  logger.info('🚧 Using rolldown built-in watch mode...')

  // Import plugin manager
  const { RobuildPluginManager } = await import('./features/plugin-manager')

  // Create rolldown watch configurations for each bundle entry
  const watchConfigs: WatchOptions[] = []

  for (const rawEntry of bundleEntries) {
    // Parse string entries using shared logic
    const entry = typeof rawEntry === 'string'
      ? parseEntryString(rawEntry)
      : rawEntry

    // Get the actual input using shared logic
    const entryInput = getBundleEntryInput(entry)
    if (!entryInput) {
      logger.warn('Skipping entry without input:', entry)
      continue
    }

    // Normalize input path using shared logic
    const normalizedInput = normalizeEntryInput(entryInput, ctx.pkgDir)

    // Get target and other options from entry
    const target = entry.target || 'es2022'
    const platform = entry.platform || 'node'
    const format = entry.format || 'es'

    // Determine the correct file extension using shared logic
    const rolldownFormat = Array.isArray(format) ? format[0] : format
    const extension = getFormatExtension(rolldownFormat, platform)

    const formatMap: Record<string, ModuleFormat> = {
      esm: 'es',
      cjs: 'cjs',
      iife: 'iife',
      umd: 'umd',
    }

    // Determine the input for rolldown watch
    // For arrays, use the first entry; for objects, use the object directly
    let rolldownInput: string | Record<string, string>
    if (Array.isArray(normalizedInput)) {
      rolldownInput = normalizedInput[0]
    }
    else if (typeof normalizedInput === 'object') {
      rolldownInput = normalizedInput
    }
    else {
      rolldownInput = normalizedInput
    }

    // Create plugin manager for this entry to get rolldown plugins
    const pluginManager = new RobuildPluginManager(config, entry, ctx.pkgDir)
    const rolldownPlugins = [
      ...pluginManager.getRolldownPlugins(),
      ...(entry.rolldown?.plugins || []),
    ]

    // Build external dependencies using shared logic
    const externalConfig = resolveExternalConfig(ctx, {
      external: entry.external,
      noExternal: entry.noExternal,
    })

    // Create rolldown config for this entry with proper transform options
    const watchConfig = {
      input: rolldownInput,
      output: {
        dir: entry.outDir,
        format: formatMap[rolldownFormat] || 'es',
        entryFileNames: `[name]${extension}`,
        sourcemap: entry.sourcemap,
      },
      platform: platform === 'node' ? 'node' : 'neutral',
      external: externalConfig,
      transform: {
        target,
      },
      plugins: rolldownPlugins,
    } satisfies WatchOptions

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
