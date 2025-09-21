import type {
  BuildConfig,
  BuildContext,
  BundleEntry,
  TransformEntry,
} from './types'

import { rm } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consola } from 'consola'
import { colors as c } from 'consola/utils'
import prettyBytes from 'pretty-bytes'
import { rolldownBuild } from './builders/bundle'
import { transformDir } from './builders/transform'
import { analyzeDir, fmtPath } from './utils'
import { startWatch } from './watch'

/**
 * Build dist/ from src/
 */
export async function build(config: BuildConfig): Promise<void> {
  // const start = Date.now()

  const pkgDir = normalizePath(config.cwd)
  const pkg = await readJSON(join(pkgDir, 'package.json')).catch(() => ({}))
  const ctx: BuildContext = { pkg, pkgDir }

  // Check if watch mode is enabled
  if (config.watch?.enabled) {
    consola.log(
      `👀 Starting watch mode for \`${ctx.pkg.name || '<no name>'}\` (\`${ctx.pkgDir}\`)`,
    )

    // Perform initial build
    await performBuild(config, ctx)

    // Start watching
    const stopWatch = await startWatch(config, ctx, build)

    // Handle graceful shutdown
    const cleanup = () => {
      consola.info('🛑 Stopping watch mode...')
      stopWatch()
      process.exit(0)
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)

    // Keep the process alive
    return new Promise(() => {}) // Never resolves, keeps watching
  }

  consola.log(
    `📦 Building \`${ctx.pkg.name || '<no name>'}\` (\`${ctx.pkgDir}\`)`,
  )

  await performBuild(config, ctx)
}

/**
 * Perform the actual build process
 */
async function performBuild(config: BuildConfig, ctx: BuildContext): Promise<void> {
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

  const outDirs: Array<string> = []
  for (const outDir of entries.map(e => e.outDir).sort() as string[]) {
    if (!outDirs.some(dir => outDir.startsWith(dir))) {
      outDirs.push(outDir)
    }
  }
  for (const outDir of outDirs) {
    consola.log(`🧻 Cleaning up \`${fmtPath(outDir)}\``)
    await rm(outDir, { recursive: true, force: true })
  }

  for (const entry of entries) {
    await (entry.type === 'bundle'
      ? rolldownBuild(ctx, entry, hooks)
      : transformDir(ctx, entry))
  }

  await hooks.end?.(ctx)

  const dirSize = analyzeDir(outDirs)
  consola.log(
    c.dim(
      `\nΣ Total dist byte size: ${c.underline(prettyBytes(dirSize.size))} (${c.underline(dirSize.files)} files)`,
    ),
  )

  consola.log(`\n✅ robuild finished in ${Date.now() - start}ms`)
}

// --- utils ---

function normalizePath(path: string | URL | undefined, resolveFrom?: string) {
  return typeof path === 'string' && isAbsolute(path)
    ? path
    : path instanceof URL
      ? fileURLToPath(path)
      : resolve(resolveFrom || '.', path || '.')
}

function readJSON(specifier: string) {
  return import(specifier, {
    with: { type: 'json' },
  }).then(r => r.default)
}
