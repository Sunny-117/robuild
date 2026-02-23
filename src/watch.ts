import type { WatchOptions } from 'rolldown'
import type { BuildConfig, BuildContext, BundleEntry } from './types'
import { watch } from 'rolldown'
import { createBundleInputConfig } from './builders/bundle'
import {
  getBundleEntryInput,
  parseEntryString,
} from './config/entry-resolver'
import { logger } from './core/logger'
import { getFormatExtension } from './utils/extensions'

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
 * Uses the same configuration logic as build mode via createBundleInputConfig
 * to ensure consistent behavior between build and watch modes.
 */
export async function startRolldownWatch(
  config: BuildConfig,
  ctx: BuildContext,
  bundleEntries: any[],
): Promise<void> {
  logger.info('Watching for changes...')

  // Import inheritConfig from build module to apply top-level config to entries
  const { inheritConfig } = await import('./build')

  // Create rolldown watch configurations for each bundle entry
  const watchConfigs: WatchOptions[] = []

  for (const rawEntry of bundleEntries) {
    // Parse string entries using shared logic
    let entry: BundleEntry = typeof rawEntry === 'string'
      ? parseEntryString(rawEntry) as BundleEntry
      : rawEntry

    // Inherit top-level config fields (same as build mode)
    entry = inheritConfig(entry, config)

    // Check for valid input before creating config
    const entryInput = getBundleEntryInput(entry)
    if (!entryInput) {
      logger.warn('Skipping entry without input:', entry)
      continue
    }

    // Use shared config creation logic from bundle.ts
    const {
      inputConfig,
      formats,
      platform,
      fullOutDir,
    } = await createBundleInputConfig(ctx, entry, config)

    // Create watch config for each format
    for (const format of formats) {
      const extension = getFormatExtension(format, platform)

      const watchConfig: WatchOptions = {
        ...inputConfig,
        output: {
          dir: fullOutDir,
          format: format === 'esm' ? 'es' : format as any,
          entryFileNames: `[name]${extension}`,
          sourcemap: typeof entry.sourcemap === 'object' ? undefined : entry.sourcemap,
          minify: entry.minify,
          banner: entry.banner as any,
          footer: entry.footer as any,
        },
      }

      watchConfigs.push(watchConfig)
    }
  }

  // Start watching with rolldown
  const watcher = watch(watchConfigs)

  watcher.on('event', (event) => {
    switch (event.code) {
      case 'START':
        logger.info('Rebuilding...')
        break
      case 'BUNDLE_START':
        // Silent - no need to log bundling start
        break
      case 'BUNDLE_END':
        // Silent - will log on END
        break
      case 'END':
        logger.success('Rebuilt')
        break
      case 'ERROR':
        logger.error('Build error:', (event as any).error)
        break
    }
  })

  // Handle graceful shutdown
  const cleanup = async () => {
    logger.info('Stopping watch mode...')
    await watcher.close()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  // Keep the process alive
  return new Promise(() => {})
}
