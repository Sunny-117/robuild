import type {
  InputOptions,
  ModuleFormat,
  ModuleTypes,
  OutputChunk,
  OutputOptions,
  Plugin,
} from 'rolldown'
import type { Options as DtsOptions } from 'rolldown-plugin-dts'
import type { BuildConfig, BuildContext, BuildHooks, BundleEntry, Platform } from '../types'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { builtinModules } from 'node:module'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { consola } from 'consola'
import { colors as c } from 'consola/utils'
import { resolveModulePath } from 'exsolve'
import { parseSync } from 'oxc-parser'
import prettyBytes from 'pretty-bytes'
import { rolldown } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'
import { createSkipNodeModulesPlugin } from '../features/advanced-build'

import { resolveChunkAddon } from '../features/banner'

import { copyFiles } from '../features/copy'
import { createGlobImportPlugin } from '../features/glob-import'
import { addHashToFilename, hasHash } from '../features/hash'
import { RobuildPluginManager } from '../features/plugin-manager'
import { createShimsPlugin } from '../features/shims'
import { nodeProtocolPlugin } from '../plugins/node-protocol'
import { makeExecutable, shebangPlugin } from '../plugins/shebang'
import { distSize, fmtPath, sideEffectSize } from '../utils'

/**
 * Get file extension for format
 */
function getFormatExtension(
  format: ModuleFormat,
  platform: Platform,
  fixedExtension = false,
): string {
  if (fixedExtension) {
    // Force .cjs/.mjs extensions
    return format === 'cjs' ? '.cjs' : '.mjs'
  }

  switch (format) {
    case 'es':
    case 'esm':
    case 'module':
      return '.mjs' // Always use .mjs for ESM to be explicit about module type
    case 'cjs':
    case 'commonjs':
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
  config?: BuildConfig,
): Promise<void> {
  // Support both 'input' and 'entry' (tsup compatibility)
  const entryInput = entry.input || entry.entry
  if (!entryInput) {
    throw new Error('Entry input is required')
  }

  const inputs: Record<string, string> = normalizeBundleInputs(
    entryInput,
    ctx,
  )

  // Initialize plugin manager
  const pluginManager = new RobuildPluginManager(config || {}, entry, ctx.pkgDir)
  await pluginManager.initializeRobuildHooks()

  // Get configuration with defaults
  const formats = Array.isArray(entry.format) ? entry.format : [entry.format || 'es']
  const platform = entry.platform || 'node'
  const target = entry.target || 'es2022'
  const outDir = entry.outDir || 'dist'
  const fullOutDir = resolve(ctx.pkgDir, outDir)
  const isMultiFormat = formats.length > 1

  // Update plugin context with build parameters
  pluginManager.updateContext({ format: formats, platform, target, outDir: fullOutDir })

  // Execute robuild buildStart hooks
  await pluginManager.executeRobuildBuildStart()

  // Clean output directory if requested
  await cleanOutputDir(ctx.pkgDir, fullOutDir, entry.clean ?? true)

  // Handle dtsOnly mode (only generate declaration files)
  if (entry.dtsOnly) {
    consola.info('Running in dtsOnly mode - only generating declaration files')
    // Force dts to be enabled
    entry.dts = entry.dts === false ? true : (entry.dts || true)
    // We'll skip the normal build and only run DTS generation
    // This will be handled in the format loop below
  }

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
  let externalDeps = [
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    ...[
      ...Object.keys(ctx.pkg.dependencies || {}),
      ...Object.keys(ctx.pkg.peerDependencies || {}),
    ].flatMap(p => [p, new RegExp(`^${p}/`)]),
  ]

  // noExternal can be an array of (string | RegExp) or a predicate function
  if (entry.noExternal) {
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    if (typeof entry.noExternal === 'function') {
      const predicate = entry.noExternal

      // If predicate returns true for a package name, remove both the
      // package name string and the autogenerated RegExp (^pkg/) from externalDeps.
      const depNames = [...Object.keys(ctx.pkg.dependencies || {}), ...Object.keys(ctx.pkg.peerDependencies || {})]
      const excludedNames = new Set<string>()
      for (const name of depNames) {
        try {
          if (predicate(name))
            excludedNames.add(name)
        }
        catch {
          // Ignore predicate errors and treat as not excluded
        }
      }

      externalDeps = externalDeps.filter((dep) => {
        if (typeof dep === 'string') {
          return !excludedNames.has(dep)
        }
        if (dep instanceof RegExp) {
          // Match any RegExp we generated for an excluded package (source starts with ^<pkg>/)
          for (const name of Array.from(excludedNames)) {
            if (dep.source.startsWith(`^${escapeRegExp(name)}/`))
              return false
          }
          return true
        }
        return true
      })
    }
    else if (Array.isArray(entry.noExternal)) {
      const rules = entry.noExternal

      externalDeps = externalDeps.filter((dep) => {
        for (const rule of rules) {
          if (typeof rule === 'string') {
            if (typeof dep === 'string') {
              if (dep === rule)
                return false
            }
            else if (dep instanceof RegExp) {
              // dep was created as new RegExp(`^${p}/`)
              if (dep.source.startsWith(`^${escapeRegExp(rule)}/`))
                return false
            }
          }
          else if (rule instanceof RegExp) {
            if (typeof dep === 'string') {
              if (rule.test(dep))
                return false
            }
            else if (dep instanceof RegExp) {
              // Compare pattern source and flags
              if (dep.source === rule.source && dep.flags === rule.flags)
                return false
            }
          }
        }

        return true
      })
    }
  }

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

  // Get rolldown plugins from plugin manager
  const rolldownPlugins: Plugin[] = [
    // Add built-in plugins first
    shebangPlugin(),
    nodeProtocolPlugin(entry.nodeProtocol || false),
  ]

  // Add feature plugins - convert robuild plugins to rolldown plugins
  if (config?.globImport?.enabled) {
    const globPlugin = createGlobImportPlugin(config.globImport)
    if (globPlugin.transform) {
      rolldownPlugins.push({
        name: 'glob-import',
        transform: async (code: string, id: string, _meta: any) => {
          // Call the robuild plugin transform with only the parameters it expects
          const result = await (globPlugin.transform as any)(code, id)
          return result ? { code: result } : null
        },
      } as Plugin)
    }
  }

  if (entry.shims) {
    const shimsPlugin = createShimsPlugin(entry.shims)
    if (shimsPlugin.transform) {
      rolldownPlugins.push({
        name: 'shims',
        transform: async (code: string, id: string, _meta: any) => {
          // Call the robuild plugin transform with only the parameters it expects
          const result = await (shimsPlugin.transform as any)(code, id)
          return result ? { code: result } : null
        },
      } as Plugin)
    }
  }

  if (entry.skipNodeModules) {
    const skipPlugin = createSkipNodeModulesPlugin({
      // Always inline @oxc-project/runtime helpers
      noExternal: ['@oxc-project/runtime'],
    })
    if (skipPlugin.resolveId) {
      rolldownPlugins.push({
        name: 'skip-node-modules',
        resolveId: skipPlugin.resolveId,
      } as Plugin)
    }
  }

  // Add user plugins from plugin manager
  rolldownPlugins.push(...pluginManager.getRolldownPlugins())

  // Build moduleTypes config from loaders
  const moduleTypes: ModuleTypes = {}
  if (entry.loaders) {
    for (const [ext, config] of Object.entries(entry.loaders)) {
      // Cast to ModuleType since LoaderType extends ModuleType
      moduleTypes[ext] = config.loader as any
    }
  }

  // Build base config from robuild options
  const robuildGeneratedConfig: InputOptions = {
    cwd: ctx.pkgDir,
    input: inputs,
    plugins: rolldownPlugins,
    platform: platform === 'node' ? 'node' : 'neutral',
    external: typeof entry.external === 'function'
      ? entry.external
      : externalDeps,
    resolve: {
      alias: entry.alias || {},
    },
    transform: {
      target,
      define: defineOptions,
    },
    // Add moduleTypes for static asset handling
    ...(Object.keys(moduleTypes).length > 0 ? { moduleTypes } : {}),
  }

  // Handle treeshake configuration
  if (entry.treeshake !== undefined) {
    if (typeof entry.treeshake === 'boolean') {
      robuildGeneratedConfig.treeshake = entry.treeshake
    }
    else {
      robuildGeneratedConfig.treeshake = entry.treeshake
    }
  }

  // Merge with user's rolldown config (user config has highest priority)
  // Extract output config separately as it's handled per-format
  const { output: userOutputConfig, plugins: userPlugins, ...userRolldownConfig } = entry.rolldown || {}

  const baseRolldownConfig: InputOptions = {
    ...robuildGeneratedConfig,
    ...userRolldownConfig,
    // Merge plugins array (robuild plugins + user plugins)
    plugins: [
      ...rolldownPlugins,
      ...(Array.isArray(userPlugins) ? userPlugins : userPlugins ? [userPlugins] : []),
    ],
  }

  await hooks.rolldownConfig?.(baseRolldownConfig, ctx)

  // Build for each format
  const allOutputEntries: Array<{
    format: ModuleFormat
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
    const extension = getFormatExtension(format, platform, entry.fixedExtension)

    // Create config for this format
    const formatConfig = { ...baseRolldownConfig }

    // Only add DTS plugin for ESM format (DTS plugin doesn't support CJS)
    if (entry.dts !== false && (format === 'es' || format === 'esm' || format === 'module')) {
      const dtsPlugins = dts({ ...(entry.dts as DtsOptions) })
      formatConfig.plugins = [
        ...(Array.isArray(formatConfig.plugins) ? formatConfig.plugins : [formatConfig.plugins]),
        ...(Array.isArray(dtsPlugins) ? dtsPlugins : [dtsPlugins]),
      ]
    }

    const res = await rolldown(formatConfig)

    // Determine output directory for this format
    const formatOutDir = fullOutDir
    let entryFileName = `[name]${extension}`

    if (isMultiFormat) {
      // For multi-format builds, use different extensions to avoid conflicts
      // All formats are placed in the same directory (tsup-style behavior)
      if (format === 'cjs' || format === 'commonjs') {
        entryFileName = `[name].cjs`
      }
      else if (format === 'es' || format === 'esm' || format === 'module') {
        entryFileName = `[name].mjs`
      }
      else if (format === 'iife' || format === 'umd') {
        // IIFE/UMD use .js extension
        entryFileName = `[name].js`
      }
    }
    else {
      // For single format builds, use the default extension
      // No subdirectories needed since there's only one format
    }

    // Build base output config from robuild options
    const robuildOutputConfig: OutputOptions = {
      dir: formatOutDir,
      format,
      entryFileNames: entryFileName,
      // Use function to handle dts chunks - output to root dir without hash for stable output
      chunkFileNames: (chunk) => {
        // Check if this is a dts chunk (ends with .d or contains .d.)
        // DTS entry chunks should go to root directory, not _chunks/
        // Return .mjs extension so rolldown-plugin-dts can convert it to .d.mts
        if (chunk.name.endsWith('.d') || chunk.name.includes('.d.')) {
          return `[name].mjs`
        }
        return `_chunks/[name]-[hash]${extension}`
      },

      // 问题原因
      // rolldown 1.0.0-rc.3 有一个优化："Avoid Unnecessary Facade Chunks"，这改变了 chunk 分割行为。rolldown-plugin-dts 将 dts 文件作为 chunk 类型 emit，所以它会使用 chunkFileNames 配置。之前的配置 _chunks/[name]-[hash]${extension} 导致 dts 文件输出为带 hash 的文件名（如 _chunks/index-hDZaHp_q.d.mts）。

      // 解决方案
      // 修改 chunkFileNames 为一个函数，检测 dts chunk 并为其返回不同的文件名模板：

      // chunkFileNames: (chunk) => {
      //   // 检测 dts chunk
      //   if (chunk.name.endsWith('.d') || chunk.name.includes('.d.')) {
      //     // 输出到根目录，不带 hash，使用 .mjs 扩展名让 rolldown-plugin-dts 转换为 .d.mts
      //     return `[name].mjs`
      //   }
      //   // 其他 chunk 保持原有行为
      //   return `_chunks/[name]-[hash]${extension}`
      // }
      // 这样：

      // dts 文件输出为固定文件名 index.d.mts（不带 hash）
      // 其他 chunk 文件仍然带有 hash（_chunks/xxx-[hash].mjs）

      minify: entry.minify,
      name: entry.globalName, // For IIFE/UMD formats
      banner: resolveChunkAddon(entry.banner, format),
      footer: resolveChunkAddon(entry.footer, format),
    }

    // Enable source maps if requested on the entry
    if (entry.sourcemap !== undefined) {
      // Rollup/Rolldown supports boolean | 'inline' | 'hidden'
      ;(robuildOutputConfig as any).sourcemap = entry.sourcemap as any
    }

    // Merge with user's output config (user config has highest priority)
    const outConfig: OutputOptions = {
      ...robuildOutputConfig,
      ...(userOutputConfig || {}),
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
      return Array.from(deps).sort()
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

        // Also rename source map file if it exists (when sourcemap emitted as separate file)
        try {
          const mapOld = `${finalFilePath}.map`
          const mapNew = `${hashedFilePath}.map`
          await rename(mapOld, mapNew)
        }
        catch {
          // ignore if no map file
        }

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

  // Execute robuild buildEnd hooks
  await pluginManager.executeRobuildBuildEnd({ allOutputEntries })

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
  input: string | string[] | Record<string, string>,
  ctx: BuildContext,
): Record<string, string> {
  const inputs: Record<string, string> = {}

  // Handle object format (tsup-style named entries)
  if (typeof input === 'object' && !Array.isArray(input)) {
    for (const [name, src] of Object.entries(input)) {
      const resolvedSrc = resolveModulePath(src, {
        from: ctx.pkgDir,
        extensions: ['.ts', '.js', '.mjs', '.cjs', '.json'],
      })
      inputs[name] = resolvedSrc
    }
    return inputs
  }

  // Handle string or array format
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
