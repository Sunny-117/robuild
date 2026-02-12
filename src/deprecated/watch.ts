import type { BuildConfig, BuildContext, BundleEntry, WatchOptions } from '../types'
import { join, relative } from 'node:path'
// chokidar: If you've used globs before and want do replicate the functionality with v4:
// https://github.com/paulmillr/chokidar#upgrading
import { watch as chokidarWatch } from 'chokidar'
import { consola } from 'consola'
import { colors as c } from 'consola/utils'
import { normalizeIgnorePatterns } from '../config/ignore-watch'
import { fmtPath } from '../utils/index'

export interface WatchContext {
  config: BuildConfig
  ctx: BuildContext
  buildFn: (config: BuildConfig) => Promise<void>
  isBuilding: boolean
  pendingRebuild: boolean
  rebuildTimer?: NodeJS.Timeout
}

/**
 * @deprecated rolldown watch mode is all supported
 * Start watching files and rebuild on changes
 */
export async function startWatch(
  config: BuildConfig,
  ctx: BuildContext,
  buildFn: (config: BuildConfig) => Promise<void>,
): Promise<() => void> {
  const watchOptions = config.watch || {}

  if (!watchOptions.enabled) {
    throw new Error('Watch mode is not enabled')
  }

  const watchCtx: WatchContext = {
    config,
    ctx,
    buildFn,
    isBuilding: false,
    pendingRebuild: false,
  }

  // Determine what files to watch
  const watchPatterns = await getWatchPatterns(config, ctx, watchOptions)
  const ignorePatterns = getIgnorePatterns(config, watchOptions)

  consola.info(`👀 Starting watch mode...`)
  consola.info(`📁 Watching: ${c.dim(watchPatterns.join(', '))}`)
  if (ignorePatterns.length > 0) {
    consola.info(`🚫 Ignoring: ${c.dim(ignorePatterns.join(', '))}`)
  }

  const delay = watchOptions.delay ?? 100
  if (delay > 0) {
    consola.info(`⏱️  Rebuild delay: ${c.dim(`${delay}ms`)}`)
  }

  // Create file watcher
  const watcher = chokidarWatch(watchPatterns, {
    ignored: ignorePatterns,
    ignoreInitial: watchOptions.ignoreInitial ?? false,
    persistent: true,
    followSymlinks: false,
    cwd: ctx.pkgDir,
  })

  // Handle file changes
  watcher.on('change', path => handleFileChange(watchCtx, path, 'changed'))
  watcher.on('add', (path) => {
    if (watchOptions.watchNewFiles !== false) {
      handleFileChange(watchCtx, path, 'added')
    }
  })
  watcher.on('unlink', path => handleFileChange(watchCtx, path, 'removed'))

  // Handle errors
  watcher.on('error', (error) => {
    consola.error('❌ Watch error:', error)
    // Don't exit on watch errors, just log them
  })

  // Handle watcher events for debugging
  if (process.env.DEBUG) {
    watcher.on('addDir', path => consola.debug(`📁 Directory added: ${path}`))
    watcher.on('unlinkDir', path => consola.debug(`📁 Directory removed: ${path}`))
  }

  // Wait for initial scan to complete
  await new Promise<void>((resolve) => {
    watcher.on('ready', () => {
      const watchedPaths = watcher.getWatched()
      const totalFiles = Object.values(watchedPaths).reduce((sum, files) => sum + files.length, 0)
      consola.success(`🚀 Watch mode ready - watching ${totalFiles} files`)
      consola.info(`💡 Press ${c.cyan('Ctrl+C')} to stop watching`)
      resolve()
    })
  })

  // Return cleanup function
  return () => {
    if (watchCtx.rebuildTimer) {
      clearTimeout(watchCtx.rebuildTimer)
    }
    return watcher.close()
  }
}

/**
 * Handle file change events
 */
function handleFileChange(
  watchCtx: WatchContext,
  filePath: string,
  changeType: 'changed' | 'added' | 'removed',
): void {
  const { config, ctx } = watchCtx
  const watchOptions = config.watch || {}
  const delay = watchOptions.delay ?? 100

  const relativePath = relative(ctx.pkgDir, join(ctx.pkgDir, filePath))
  const formattedPath = fmtPath(relativePath)

  // Log the change
  const changeIcon = changeType === 'changed' ? '📝' : changeType === 'added' ? '➕' : '➖'
  consola.info(`${changeIcon} ${c.cyan(formattedPath)} ${changeType}`)

  // Clear existing timer
  if (watchCtx.rebuildTimer) {
    clearTimeout(watchCtx.rebuildTimer)
  }

  // Set pending rebuild flag
  watchCtx.pendingRebuild = true

  // Schedule rebuild with debouncing
  watchCtx.rebuildTimer = setTimeout(() => {
    triggerRebuild(watchCtx)
  }, delay)
}

/**
 * Trigger a rebuild
 */
async function triggerRebuild(watchCtx: WatchContext): Promise<void> {
  const { config, buildFn } = watchCtx

  // Skip if already building
  if (watchCtx.isBuilding) {
    return
  }

  // Skip if no pending rebuild
  if (!watchCtx.pendingRebuild) {
    return
  }

  watchCtx.isBuilding = true
  watchCtx.pendingRebuild = false

  try {
    consola.info(`🔄 Rebuilding...`)
    const start = Date.now()

    // Create a new config without watch to avoid infinite recursion
    const buildConfig = { ...config, watch: { ...config.watch, enabled: false } }
    await buildFn(buildConfig)

    const duration = Date.now() - start
    consola.success(`✅ Rebuild completed in ${duration}ms`)
  }
  catch (error) {
    consola.error('❌ Rebuild failed:')

    // Log error details based on type
    if (error instanceof Error) {
      consola.error(`   ${error.message}`)
      if (process.env.DEBUG && error.stack) {
        consola.debug(error.stack)
      }
    }
    else {
      consola.error(`   ${String(error)}`)
    }

    consola.info('👀 Still watching for changes...')
  }
  finally {
    watchCtx.isBuilding = false

    // Check if another rebuild is pending
    if (watchCtx.pendingRebuild) {
      setTimeout(() => triggerRebuild(watchCtx), watchCtx.config.watch?.delay ?? 100)
    }
  }
}

/**
 * Get patterns for files to watch
 */
async function getWatchPatterns(
  config: BuildConfig,
  _ctx: BuildContext,
  watchOptions: WatchOptions,
): Promise<string[]> {
  // If explicit patterns are provided, use them
  if (watchOptions.include && watchOptions.include.length > 0) {
    return watchOptions.include
  }

  // Otherwise, derive patterns from build entries
  const patterns: string[] = []

  for (const entry of config.entries || []) {
    if (typeof entry === 'string') {
      const [input] = entry.split(':')
      if (input.endsWith('/')) {
        // Transform entry - watch the entire directory
        patterns.push(`${input}**/*`)
      }
      else {
        // Bundle entry - watch the specific files and their dependencies
        const inputs = input.split(',')
        for (const inputFile of inputs) {
          patterns.push(inputFile)
          // Also watch the directory containing the input file
          const dir = inputFile.substring(0, inputFile.lastIndexOf('/'))
          if (dir) {
            patterns.push(`${dir}/**/*`)
          }
        }
      }
    }
    else {
      if (entry.type === 'transform') {
        patterns.push(`${entry.input}/**/*`)
      }
      else {
        const entryInput = (entry as BundleEntry).input || (entry as BundleEntry).entry
        if (!entryInput)
          continue

        // Handle different input formats
        let inputs: string[] = []
        if (typeof entryInput === 'object' && !Array.isArray(entryInput)) {
          // Object format (named entries)
          inputs = Object.values(entryInput)
        }
        else if (Array.isArray(entryInput)) {
          inputs = entryInput
        }
        else {
          inputs = [entryInput]
        }

        for (const inputFile of inputs) {
          patterns.push(inputFile)
          // Also watch the directory containing the input file
          const dir = inputFile.substring(0, inputFile.lastIndexOf('/'))
          if (dir) {
            patterns.push(`${dir}/**/*`)
          }
        }
      }
    }
  }

  // Add common source patterns if no specific patterns found
  if (patterns.length === 0) {
    patterns.push('src/**/*', '*.ts', '*.js', '*.mjs', '*.json')
  }

  return Array.from(new Set(patterns)) // Remove duplicates
}

/**
 * Get patterns for files to ignore
 */
function getIgnorePatterns(config: BuildConfig, watchOptions: WatchOptions): string[] {
  const defaultIgnores = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.git/**',
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.log',
    '**/tmp/**',
    '**/temp/**',
  ]

  const allIgnores = [...defaultIgnores]

  // Add patterns from watch options
  if (watchOptions.exclude && watchOptions.exclude.length > 0) {
    allIgnores.push(...watchOptions.exclude)
  }

  // Add patterns from build config
  if (config.ignoreWatch && config.ignoreWatch.length > 0) {
    allIgnores.push(...normalizeIgnorePatterns(config.ignoreWatch))
  }

  return allIgnores
}
