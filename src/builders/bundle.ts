import type {
  InputOptions,
  ModuleFormat,
  ModuleTypes,
  OutputChunk,
  OutputOptions,
  Plugin,
} from 'rolldown'
import type { Options as DtsOptions } from 'rolldown-plugin-dts'
import type { BuildConfig, BuildContext, BuildHooks, BundleEntry, Platform, Target } from '../types'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { builtinModules } from 'node:module'
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { colors as c } from 'consola/utils'
import { resolveModulePath } from 'exsolve'
import { parseSync } from 'oxc-parser'
import prettyBytes from 'pretty-bytes'
import { rolldown } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'
import { getBundleEntryInput } from '../config/entry-resolver'

import { resolveExternalConfig } from '../config/external'
import { resolveCssOptions } from '../features/css'
import { createLightningCSSPlugin } from '../features/css/lightningcss'
import { createCssCodeSplitPlugin } from '../features/css/splitting'
import { logger } from '../core/logger'
import { createGlobImportPlugin } from '../plugins/builtin/glob-import'
import { nodeProtocolPlugin } from '../plugins/builtin/node-protocol'
import { makeExecutable, shebangPlugin } from '../plugins/builtin/shebang'
import { createShimsPlugin } from '../plugins/builtin/shims'
import { createSkipNodeModulesPlugin } from '../plugins/builtin/skip-node-modules'
import { createWasmPlugin, normalizeWasmConfig } from '../plugins/builtin/wasm'
import { RobuildPluginManager } from '../plugins/manager'
import { resolveChunkAddon } from '../transforms/banner'
import { cleanOutputDir } from '../transforms/clean'
import { copyFiles } from '../transforms/copy'
import { getFormatExtension } from '../utils/extensions'
import { addHashToFilename, hasHash } from '../utils/hash'
import { distSize, fmtPath, sideEffectSize } from '../utils/index'

/**
 * Create rolldown InputOptions config for a bundle entry.
 * This is shared between build mode and watch mode to ensure consistent behavior.
 */
export async function createBundleInputConfig(
  ctx: BuildContext,
  entry: BundleEntry,
  config?: BuildConfig,
): Promise<{
  inputConfig: InputOptions
  pluginManager: RobuildPluginManager
  formats: string[]
  platform: Platform
  target: Target
  fullOutDir: string
  isMultiFormat: boolean
  userOutputConfig?: any
}> {
  // Support both 'input' and 'entry' (tsup compatibility)
  const entryInput = getBundleEntryInput(entry)
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

  // Build external dependencies using shared logic
  const externalConfig = resolveExternalConfig(ctx, {
    external: entry.external,
    noExternal: entry.noExternal,
  })

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

  // Add WASM plugin if enabled (entry config overrides global config)
  const wasmConfig = normalizeWasmConfig(entry.wasm ?? config?.wasm)
  if (wasmConfig) {
    const wasmPlugin = await createWasmPlugin(wasmConfig)
    if (wasmPlugin) {
      rolldownPlugins.push(wasmPlugin)
    }
    else {
      logger.warn('WASM support is enabled but rolldown-plugin-wasm is not installed.')
      logger.warn('Install it with: pnpm add -D rolldown-plugin-wasm')
    }
  }

  // Add CSS plugins if configured
  const cssOptions = resolveCssOptions(config?.css)

  // Add LightningCSS plugin for CSS transformation/minification
  if (cssOptions.lightningcss) {
    const lightningPlugin = await createLightningCSSPlugin({ target })
    if (lightningPlugin) {
      rolldownPlugins.push(lightningPlugin)
    }
    else {
      logger.warn('LightningCSS is enabled but unplugin-lightningcss is not installed.')
      logger.warn('Install it with: pnpm add -D unplugin-lightningcss lightningcss')
    }
  }

  // Add CSS code splitting plugin
  const cssSplitPlugin = createCssCodeSplitPlugin(cssOptions)
  if (cssSplitPlugin) {
    rolldownPlugins.push(cssSplitPlugin)
  }

  // Add user plugins from plugin manager
  rolldownPlugins.push(...pluginManager.getRolldownPlugins())

  // Build moduleTypes config from loaders
  const moduleTypes: ModuleTypes = {}
  if (entry.loaders) {
    for (const [ext, loaderConfig] of Object.entries(entry.loaders)) {
      // Cast to ModuleType since LoaderType extends ModuleType
      moduleTypes[ext] = loaderConfig.loader as any
    }
  }

  // Build base config from robuild options
  const robuildGeneratedConfig: InputOptions = {
    cwd: ctx.pkgDir,
    input: inputs,
    plugins: rolldownPlugins,
    platform: platform === 'node' ? 'node' : 'neutral',
    external: externalConfig,
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

  const inputConfig: InputOptions = {
    ...robuildGeneratedConfig,
    ...userRolldownConfig,
    // Merge plugins array (robuild plugins + user plugins)
    plugins: [
      ...rolldownPlugins,
      ...(Array.isArray(userPlugins) ? userPlugins : userPlugins ? [userPlugins] : []),
    ],
  }

  return {
    inputConfig,
    pluginManager,
    formats,
    platform,
    target,
    fullOutDir,
    isMultiFormat,
    userOutputConfig,
  }
}

export async function rolldownBuild(
  ctx: BuildContext,
  entry: BundleEntry,
  hooks: BuildHooks,
  config?: BuildConfig,
): Promise<void> {
  // Support both 'input' and 'entry' (tsup compatibility)
  const entryInput = getBundleEntryInput(entry)
  if (!entryInput) {
    throw new Error('Entry input is required')
  }

  const inputs: Record<string, string> = normalizeBundleInputs(
    entryInput,
    ctx,
  )

  // Get configuration with defaults
  const formats = Array.isArray(entry.format) ? entry.format : [entry.format || 'es']
  const outDir = entry.outDir || 'dist'
  const fullOutDir = resolve(ctx.pkgDir, outDir)

  // Create shared input config
  const {
    inputConfig: baseRolldownConfig,
    pluginManager,
    platform,
    isMultiFormat,
    userOutputConfig,
  } = await createBundleInputConfig(ctx, entry, config)

  // Execute robuild buildStart hooks
  await pluginManager.executeRobuildBuildStart()

  // Clean output directory if requested
  await cleanOutputDir(ctx.pkgDir, fullOutDir, entry.clean ?? true)

  // Handle dtsOnly mode (only generate declaration files)
  if (entry.dtsOnly) {
    logger.info('Running in dtsOnly mode - only generating declaration files')
    // Force dts to be enabled
    entry.dts = entry.dts === false ? true : (entry.dts || true)
    // Force ESM format since DTS plugin only works with ESM
    formats.length = 0
    formats.push('esm')
  }

  if (entry.stub) {
    for (const [distName, srcPath] of Object.entries(inputs)) {
      const distPath = join(ctx.pkgDir, 'dist', `${distName}.mjs`)
      await mkdir(dirname(distPath), { recursive: true })
      logger.log(
        `${c.cyan('Stub')}  ${c.green(fmtPath(distPath))}`,
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

  await hooks.rolldownConfig?.(baseRolldownConfig, ctx)

  // Build for each format - in parallel for better performance
  type OutputEntryInfo = {
    format: ModuleFormat
    name: string
    exports: string[]
    deps: string[]
    size: number
    minSize: number
    minGzipSize: number
    sideEffectSize: number
  }

  const filePathMap = new Map<string, string>() // Map filename to full path for logging

  // Build all formats in parallel
  const buildFormat = async (format: ModuleFormat): Promise<OutputEntryInfo[]> => {
    const extension = getFormatExtension(format, platform, entry.fixedExtension)

    // Create config for this format
    const formatConfig = { ...baseRolldownConfig }

    // Only add DTS plugin for ESM format (DTS plugin doesn't support CJS)
    if (entry.dts !== false && (format === 'es' || format === 'esm' || format === 'module')) {
      // Normalize dts options: true becomes empty object, object is passed as-is
      const dtsOptions: DtsOptions = {
        cwd: ctx.pkgDir, // Pass cwd for tsconfig resolution
        ...(typeof entry.dts === 'object' ? entry.dts : {}),
      }
      const dtsPlugins = dts(dtsOptions)
      formatConfig.plugins = [
        ...(Array.isArray(formatConfig.plugins) ? formatConfig.plugins : [formatConfig.plugins]),
        ...(Array.isArray(dtsPlugins) ? dtsPlugins : [dtsPlugins]),
      ]
    }

    // For CJS format with dts enabled and cjsDefault, we need a separate DTS build pass
    // to generate .d.cts files with export = syntax
    const needsCjsDts = entry.dts !== false
      && (format === 'cjs' || format === 'commonjs')
      && isMultiFormat
      && (entry.cjsDefault ?? true)

    const res = await rolldown(formatConfig)

    // Determine output directory for this format
    const formatOutDir = fullOutDir
    let entryFileName = `[name]${extension}`

    // Use custom fileName if provided (only for single-entry builds)
    if (entry.fileName) {
      entryFileName = entry.fileName
    }
    else if (isMultiFormat) {
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

    // Determine exports mode based on cjsDefault option
    // When cjsDefault is enabled, use 'auto' to allow default exports to be
    // converted to module.exports = ... for better CJS compatibility
    const cjsDefault = entry.cjsDefault ?? true // Default to true like tsdown
    const exportsMode = cjsDefault ? 'auto' : 'named'

    // Build base output config from robuild options
    const robuildOutputConfig: OutputOptions = {
      dir: formatOutDir,
      format,
      exports: exportsMode as any,
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
      ...userOutputConfig,
    }

    await hooks.rolldownOutput?.(outConfig, res, ctx)

    const { output } = await res.write(outConfig)
    await res.close()

    // Generate CJS DTS files if needed (separate pass for .d.cts with export = syntax)
    if (needsCjsDts) {
      const cjsDtsConfig = { ...baseRolldownConfig }
      const dtsOptions: DtsOptions = {
        cwd: ctx.pkgDir,
        emitDtsOnly: true,
        cjsDefault: true, // Enable export = syntax for CJS DTS
        ...(typeof entry.dts === 'object' ? entry.dts : {}),
      }
      const dtsPlugins = dts(dtsOptions)
      cjsDtsConfig.plugins = [
        ...(Array.isArray(cjsDtsConfig.plugins) ? cjsDtsConfig.plugins : [cjsDtsConfig.plugins]),
        ...(Array.isArray(dtsPlugins) ? dtsPlugins : [dtsPlugins]),
      ]

      const cjsDtsRes = await rolldown(cjsDtsConfig)
      const cjsDtsOutput = await cjsDtsRes.write({
        dir: formatOutDir,
        format: 'es', // DTS plugin outputs ES format, it handles .d.cts naming internally
        entryFileNames: '[name].d.cts',
        chunkFileNames: '[name]2.d.cts',
      })
      await cjsDtsRes.close()

      // Post-process: find the actual DTS file (non-empty) and rename if needed
      // rolldown-plugin-dts emitDtsOnly mode outputs:
      // - An empty entry file ([name].d.cts)
      // - The actual DTS content in a chunk file ([name]2.d.cts)
      // We need to delete the empty entry and rename the chunk
      const { readFile: rf, unlink: ul, rename: rn, stat } = await import('node:fs/promises')
      for (const chunk of cjsDtsOutput.output) {
        if (chunk.type !== 'chunk')
          continue
        const filePath = join(formatOutDir, chunk.fileName)
        const content = await rf(filePath, 'utf8')
        // If this is the empty entry file, delete it
        if (content.trim() === 'export { };' || content.trim() === '') {
          await ul(filePath)
        }
        // If this is the chunk with content, rename it to the expected entry name
        else if (chunk.fileName.includes('2.d.cts')) {
          const newFileName = chunk.fileName.replace('2.d.cts', '.d.cts')
          const newFilePath = join(formatOutDir, newFileName)
          // Check if target already exists and is empty
          try {
            const existingStat = await stat(newFilePath)
            if (existingStat.isFile()) {
              const existingContent = await rf(newFilePath, 'utf8')
              if (existingContent.trim() === 'export { };' || existingContent.trim() === '') {
                await ul(newFilePath)
              }
            }
          }
          catch {
            // Target doesn't exist, that's fine
          }
          await rn(filePath, newFilePath)
        }
      }
    }

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

    const formatOutputEntries: OutputEntryInfo[] = []

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

      formatOutputEntries.push({
        format,
        name: finalFileName,
        exports: chunk.exports,
        deps: resolveDeps(chunk),
        ...(await distSize(formatOutDir, finalFileName)),
        sideEffectSize: await sideEffectSize(formatOutDir, finalFileName),
      })
    }

    return formatOutputEntries
  }

  // Execute all format builds in parallel
  const formatResults = await Promise.all(formats.map(buildFormat))
  const allOutputEntries = formatResults.flat()

  // Handle dtsOnly mode: delete JS files, keep only .d.ts files
  if (entry.dtsOnly) {
    const jsFilesToDelete: string[] = []
    for (const outputEntry of allOutputEntries) {
      const filePath = filePathMap.get(outputEntry.name)
      if (filePath && !filePath.endsWith('.d.ts') && !filePath.endsWith('.d.mts') && !filePath.endsWith('.d.cts')) {
        jsFilesToDelete.push(filePath)
      }
    }
    // Delete JS files
    for (const filePath of jsFilesToDelete) {
      try {
        await unlink(filePath)
        // Also try to delete sourcemap if exists
        try {
          await unlink(`${filePath}.map`)
        }
        catch {
          // ignore if no map file
        }
      }
      catch {
        // ignore if file doesn't exist
      }
    }
    // Filter out JS entries from output display
    const dtsEntries = allOutputEntries.filter(o =>
      o.name.endsWith('.d.ts') || o.name.endsWith('.d.mts') || o.name.endsWith('.d.cts'),
    )
    // Clear and re-add only DTS entries
    allOutputEntries.length = 0
    allOutputEntries.push(...dtsEntries)
  }

  // Copy files if specified
  if (entry.copy) {
    await copyFiles(ctx.pkgDir, fullOutDir, entry.copy)
  }

  // Execute robuild buildEnd hooks
  await pluginManager.executeRobuildBuildEnd({ allOutputEntries })

  // Display build results
  logger.log(
    `\n${allOutputEntries
      .map(o =>
        [
          `${c.cyan('Bundle')}  ${c.green(fmtPath(filePathMap.get(o.name) || join(fullOutDir, o.name)))}`,
          c.dim(
            `         ${prettyBytes(o.size)} / minified: ${prettyBytes(o.minSize)} / gzip: ${prettyBytes(o.minGzipSize)}`,
          ),
          o.exports.some(e => e !== 'default')
            ? c.dim(
                `         Exports: ${o.exports.map(e => e).join(', ')}`,
              )
            : '',
          o.deps.length > 0
            ? c.dim(`         Dependencies: ${o.deps.join(', ')}`)
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\n')}`,
  )
}

/**
 * Ensure a path is properly formatted for resolveModulePath.
 * Adds './' prefix for relative paths that don't start with './' or '../'
 */
function ensureRelativePrefix(path: string): string {
  // Skip if already absolute or has relative prefix
  if (isAbsolute(path) || path.startsWith('./') || path.startsWith('../')) {
    return path
  }
  return `./${path}`
}

export function normalizeBundleInputs(
  input: string | string[] | Record<string, string>,
  ctx: BuildContext,
): Record<string, string> {
  const inputs: Record<string, string> = {}

  // Handle object format (tsup-style named entries)
  if (typeof input === 'object' && !Array.isArray(input)) {
    for (const [name, src] of Object.entries(input)) {
      const resolvedSrc = resolveModulePath(ensureRelativePrefix(src), {
        from: ctx.pkgDir,
        extensions: ['.ts', '.js', '.mjs', '.cjs', '.json'],
      })
      inputs[name] = resolvedSrc
    }
    return inputs
  }

  // Handle string or array format
  for (let src of Array.isArray(input) ? input : [input]) {
    src = resolveModulePath(ensureRelativePrefix(src), {
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
