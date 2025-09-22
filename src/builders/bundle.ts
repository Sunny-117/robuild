import type {
  InputOptions,
  ModuleFormat,
  OutputChunk,
  OutputOptions,
  Plugin,
} from 'rolldown'
import type { Options as DtsOptions } from 'rolldown-plugin-dts'
import type { BuildContext, BuildHooks, BundleEntry, OutputFormat, Platform } from '../types'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { builtinModules } from 'node:module'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { consola } from 'consola'
import { colors as c } from 'consola/utils'
import { defu } from 'defu'
import { resolveModulePath } from 'exsolve'
import { parseSync } from 'oxc-parser'
import prettyBytes from 'pretty-bytes'
import { rolldown } from 'rolldown'

import { dts } from 'rolldown-plugin-dts'

import { resolveChunkAddon } from '../features/banner'
import { copyFiles } from '../features/copy'
import { addHashToFilename, hasHash } from '../features/hash'
import { distSize, fmtPath, sideEffectSize } from '../utils'
import { nodeProtocolPlugin } from './plugins/node-protocol'
import { makeExecutable, shebangPlugin } from './plugins/shebang'

/**
 * Convert OutputFormat to Rolldown ModuleFormat
 */
function formatToRolldownFormat(format: OutputFormat): ModuleFormat {
  switch (format) {
    case 'esm':
      return 'es'
    case 'cjs':
      return 'cjs'
    case 'iife':
      return 'iife'
    case 'umd':
      return 'umd'
    default:
      return 'es'
  }
}

/**
 * Get file extension for format
 */
function getFormatExtension(
  format: OutputFormat,
  platform: Platform,
  fixedExtension = false,
): string {
  if (fixedExtension) {
    // Force .cjs/.mjs extensions
    return format === 'cjs' ? '.cjs' : '.mjs'
  }

  switch (format) {
    case 'esm':
      return '.mjs' // Always use .mjs for ESM to be explicit about module type
    case 'cjs':
      return platform === 'node' ? '.cjs' : '.js'
    case 'iife':
    case 'umd':
      return '.js'
    default:
      return '.js'
  }
}

/**
 * Clean output directory
 */
async function cleanOutputDir(projectRoot: string, outDir: string, cleanPaths?: boolean | string[]): Promise<void> {
  if (!cleanPaths)
    return

  const { rm } = await import('node:fs/promises')
  const { existsSync } = await import('node:fs')

  if (cleanPaths === true) {
    // Clean the entire output directory
    if (existsSync(outDir)) {
      consola.log(`🧻 Cleaning up ${fmtPath(outDir)}`)
      await rm(outDir, { recursive: true, force: true })
    }
  }
  else if (Array.isArray(cleanPaths)) {
    // Clean specific paths relative to project root
    for (const path of cleanPaths) {
      const fullPath = resolve(projectRoot, path)
      if (existsSync(fullPath)) {
        consola.log(`🧻 Cleaning up ${fmtPath(fullPath)}`)
        await rm(fullPath, { recursive: true, force: true })
      }
    }
  }
}

export async function rolldownBuild(
  ctx: BuildContext,
  entry: BundleEntry,
  hooks: BuildHooks,
): Promise<void> {
  const inputs: Record<string, string> = normalizeBundleInputs(
    entry.input,
    ctx,
  )

  // Get configuration with defaults
  const formats = Array.isArray(entry.format) ? entry.format : [entry.format || 'esm']
  const platform = entry.platform || 'node'
  const target = entry.target || 'es2022'
  const outDir = entry.outDir || 'dist'
  const fullOutDir = resolve(ctx.pkgDir, outDir)
  const isMultiFormat = formats.length > 1

  // Clean output directory if requested
  await cleanOutputDir(ctx.pkgDir, fullOutDir, entry.clean ?? true)

  if (entry.stub) {
    for (const [distName, srcPath] of Object.entries(inputs)) {
      const distPath = join(ctx.pkgDir, 'dist', `${distName}.mjs`)
      await mkdir(dirname(distPath), { recursive: true })
      consola.log(
        `${c.magenta('[stub bundle] ')} ${c.underline(fmtPath(distPath))}`,
      )
      const srcContents = await readFile(srcPath, 'utf8')
      const parsed = parseSync(srcPath, srcContents)
      const exportNames = parsed.module.staticExports.flatMap(e =>
        e.entries.map(e =>
          e.exportName.kind === 'Default' ? 'default' : e.exportName.name,
        ),
      )
      const hasDefaultExport = exportNames.includes('default')
      const firstLine = srcContents.split('\n')[0]
      const hasShebangLine = firstLine.startsWith('#!')
      await writeFile(
        distPath,
        `${hasShebangLine ? `${firstLine}\n` : ''}export * from "${srcPath}";\n${hasDefaultExport ? `export { default } from "${srcPath}";\n` : ''}`,
        'utf8',
      )
      if (hasShebangLine) {
        await makeExecutable(distPath)
      }
      await writeFile(
        distPath.replace(/\.mjs$/, '.d.mts'),
        `export * from "${srcPath}";\n${hasDefaultExport ? `export { default } from "${srcPath}";\n` : ''}`,
        'utf8',
      )
    }
    return
  }

  // Build external dependencies list
  const externalDeps = [
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    ...[
      ...Object.keys(ctx.pkg.dependencies || {}),
      ...Object.keys(ctx.pkg.peerDependencies || {}),
    ].flatMap(p => [p, new RegExp(`^${p}/`)]),
  ]

  // Add custom external dependencies
  if (entry.external) {
    if (typeof entry.external === 'function') {
      // Function-based external will be handled in rolldown config
    }
    else {
      externalDeps.push(...entry.external)
    }
  }

  // Prepare define options for rolldown
  const defineOptions: Record<string, string> = {}

  // Add environment variables
  if (entry.env) {
    for (const [key, value] of Object.entries(entry.env)) {
      defineOptions[`process.env.${key}`] = JSON.stringify(value)
    }
  }

  // Add defined constants
  if (entry.define) {
    for (const [key, value] of Object.entries(entry.define)) {
      defineOptions[key] = value
    }
  }

  const baseRolldownConfig = defu(entry.rolldown, {
    cwd: ctx.pkgDir,
    input: inputs,
    plugins: [
      shebangPlugin(),
      nodeProtocolPlugin(entry.nodeProtocol || false),
    ] as Plugin[],
    platform: platform === 'node' ? 'node' : 'neutral',
    external: typeof entry.external === 'function'
      ? entry.external
      : externalDeps,
    define: defineOptions,
    resolve: {
      alias: entry.alias || {},
    },
    transform: {
      target,
    },
  } satisfies InputOptions)

  await hooks.rolldownConfig?.(baseRolldownConfig, ctx)

  // Build for each format
  const allOutputEntries: Array<{
    format: OutputFormat
    name: string
    exports: string[]
    deps: string[]
    size: number
    minSize: number
    minGzipSize: number
    sideEffectSize: number
  }> = []
  const filePathMap = new Map<string, string>() // Map filename to full path for logging

  for (const format of formats) {
    const rolldownFormat = formatToRolldownFormat(format)
    const extension = getFormatExtension(format, platform, entry.fixedExtension)

    // Create config for this format
    const formatConfig = { ...baseRolldownConfig }

    // Only add DTS plugin for ESM format (DTS plugin doesn't support CJS)
    if (entry.dts !== false && format === 'esm') {
      formatConfig.plugins = [...formatConfig.plugins, ...dts({ ...(entry.dts as DtsOptions) })]
    }

    const res = await rolldown(formatConfig)

    // Determine output directory for this format
    let formatOutDir = fullOutDir
    let entryFileName = `[name]${extension}`

    if (isMultiFormat) {
      // For multi-format builds, create subdirectories
      if (format === 'cjs') {
        formatOutDir = join(fullOutDir, 'cjs')
        entryFileName = `[name].cjs`
      }
      else if (format === 'iife' || format === 'umd') {
        formatOutDir = join(fullOutDir, platform === 'browser' ? 'browser' : format)
        entryFileName = `[name].js`
      }
      // ESM stays in root directory as index.mjs
    }
    else {
      // For single format builds, still create subdirectories for IIFE/UMD on browser platform
      if ((format === 'iife' || format === 'umd') && platform === 'browser') {
        formatOutDir = join(fullOutDir, 'browser')
        entryFileName = `[name].js`
      }
    }

    const outConfig: OutputOptions = {
      dir: formatOutDir,
      format: rolldownFormat,
      entryFileNames: entryFileName,
      chunkFileNames: `_chunks/[name]-[hash]${extension}`,
      minify: entry.minify,
      name: entry.globalName, // For IIFE/UMD formats
      banner: resolveChunkAddon(entry.banner, format),
      footer: resolveChunkAddon(entry.footer, format),
    }

    await hooks.rolldownOutput?.(outConfig, res, ctx)

    const { output } = await res.write(outConfig)
    await res.close()

    // Process output for this format
    const depsCache = new Map<OutputChunk, Set<string>>()
    const resolveDeps = (chunk: OutputChunk): string[] => {
      if (!depsCache.has(chunk)) {
        depsCache.set(chunk, new Set<string>())
      }
      const deps = depsCache.get(chunk)!
      for (const id of chunk.imports) {
        if (builtinModules.includes(id) || id.startsWith('node:')) {
          deps.add(`[Node.js]`)
          continue
        }
        const depChunk = output.find(
          (o): o is OutputChunk => o.type === 'chunk' && o.fileName === id,
        )
        if (depChunk) {
          for (const dep of resolveDeps(depChunk)) {
            deps.add(dep)
          }
          continue
        }
        deps.add(id)
      }
      return [...deps].sort()
    }

    for (const chunk of output) {
      if (chunk.type !== 'chunk' || !chunk.isEntry)
        continue
      if (chunk.fileName.endsWith('ts'))
        continue

      let finalFileName = chunk.fileName
      let finalFilePath = join(formatOutDir, chunk.fileName)

      // Add hash to filename if requested
      if (entry.hash && !hasHash(chunk.fileName)) {
        const content = chunk.code
        const hashedFileName = addHashToFilename(chunk.fileName, content)
        const hashedFilePath = join(formatOutDir, hashedFileName)

        // Rename the file to include hash
        const { rename } = await import('node:fs/promises')
        await rename(finalFilePath, hashedFilePath)

        finalFileName = hashedFileName
        finalFilePath = hashedFilePath
      }

      // Store full path for logging
      filePathMap.set(finalFileName, finalFilePath)

      allOutputEntries.push({
        format,
        name: finalFileName,
        exports: chunk.exports,
        deps: resolveDeps(chunk),
        ...(await distSize(formatOutDir, finalFileName)),
        sideEffectSize: await sideEffectSize(formatOutDir, finalFileName),
      })
    }
  }

  // Copy files if specified
  if (entry.copy) {
    await copyFiles(ctx.pkgDir, fullOutDir, entry.copy)
  }

  // Display build results
  consola.log(
    `\n${allOutputEntries
      .map(o =>
        [
          `${c.magenta(`[bundle] `)}${c.underline(fmtPath(filePathMap.get(o.name) || join(fullOutDir, o.name)))}`,
          c.dim(
            `${c.bold('Size:')} ${prettyBytes(o.size)}, ${c.bold(prettyBytes(o.minSize))} minified, ${prettyBytes(o.minGzipSize)} min+gzipped (Side effects: ${prettyBytes(o.sideEffectSize)})`,
          ),
          o.exports.some(e => e !== 'default')
            ? c.dim(
                `${c.bold('Exports:')} ${o.exports.map(e => e).join(', ')}`,
              )
            : '',
          o.deps.length > 0
            ? c.dim(`${c.bold('Dependencies:')} ${o.deps.join(', ')}`)
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\n')}`,
  )
}

export function normalizeBundleInputs(
  input: string | string[],
  ctx: BuildContext,
): Record<string, string> {
  const inputs: Record<string, string> = {}

  for (let src of Array.isArray(input) ? input : [input]) {
    src = resolveModulePath(src, {
      from: ctx.pkgDir,
      extensions: ['.ts', '.js', '.mjs', '.cjs', '.json'],
    })
    let relativeSrc = relative(join(ctx.pkgDir, 'src'), src)
    if (relativeSrc.startsWith('..')) {
      relativeSrc = relative(join(ctx.pkgDir), src)
    }
    if (relativeSrc.startsWith('..')) {
      throw new Error(
        `Source should be within the package directory (${ctx.pkgDir}): ${src}`,
      )
    }

    const distName = join(
      dirname(relativeSrc),
      basename(relativeSrc, extname(relativeSrc)),
    )
    if (inputs[distName]) {
      throw new Error(
        `Rename one of the entries to avoid a conflict in the dist name "${distName}":\n - ${src}\n - ${inputs[distName]}`,
      )
    }
    inputs[distName] = src
  }

  return inputs
}
