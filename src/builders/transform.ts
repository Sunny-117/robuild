import type { ResolveOptions } from 'exsolve'

import type { BuildContext, TransformEntry } from '../types'
import { mkdir, readFile, symlink, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { colors as c } from 'consola/utils'
import { resolveModulePath } from 'exsolve'
import MagicString from 'magic-string'
import { minify } from 'oxc-minify'
import { parseSync } from 'oxc-parser'
import { transform } from 'oxc-transform'
import { glob } from 'tinyglobby'
import { unbundleTransform } from './unbundle'
import { addBannerFooter, resolveChunkAddon } from '../transforms/banner'
import { cleanOutputDir } from '../transforms/clean'
import { copyFiles } from '../transforms/copy'
import { createFilename } from '../utils/extensions'
import { addHashToFilename, hasHash } from '../utils/hash'
import { logger } from '../core/logger'
import { transformNodeProtocol } from '../utils/node-protocol'
import { makeExecutable, SHEBANG_RE } from '../plugins/builtin/shebang'
import { fmtPath, normalizePath } from '../utils/index'

/**
 * Transform all .ts modules in a directory using oxc-transform.
 */
export async function transformDir(
  ctx: BuildContext,
  entry: TransformEntry,
): Promise<void> {
  if (entry.stub) {
    logger.log(
      `${c.cyan('Stub')}  ${c.green(`${fmtPath(entry.outDir!)}/`)}`,
    )
    await symlink(entry.input, entry.outDir!, 'junction')
    return
  }

  // Handle unbundle mode
  if (entry.unbundle) {
    logger.log(
      `${c.cyan('Unbundle')}  ${c.green(`${fmtPath(entry.outDir!)}/`)}`,
    )
    await unbundleTransform(ctx, entry)
    return
  }

  // Clean output directory if requested
  const fullOutDir = normalizePath(entry.outDir || 'dist', ctx.pkgDir)
  await cleanOutputDir(ctx.pkgDir, fullOutDir, entry.clean ?? true)

  // Ensure input is a directory - if it's a file, use its directory
  const { statSync } = await import('node:fs')
  let inputDir = entry.input
  try {
    const stats = statSync(inputDir)
    if (stats.isFile()) {
      inputDir = dirname(inputDir)
      logger.warn(`Transform input should be a directory, not a file. Using directory: ${fmtPath(inputDir)}`)
    }
  }
  catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error
    }
    // If path doesn't exist, assume it's meant to be a directory
  }

  const promises: Promise<string>[] = []

  const files = await glob('**/*.*', { cwd: inputDir })

  for await (const entryName of files) {
    promises.push(
      (async () => {
        const entryPath = join(inputDir, entryName)
        const ext = extname(entryPath)
        switch (ext) {
          case '.ts':
          case '.tsx':
          case '.jsx': {
            {
              const transformed = await transformModule(entryPath, entry)

              // Determine output filename with proper extension
              const baseName = entryName.replace(/\.(ts|tsx|jsx)$/, '')
              const outputFileName = createFilename(baseName, 'es', false, {
                platform: entry.platform,
                fixedExtension: entry.fixedExtension,
                outExtensions: entry.outExtensions,
              })

              let entryDistPath = join(entry.outDir!, outputFileName)
              await mkdir(dirname(entryDistPath), { recursive: true })
              await writeFile(entryDistPath, transformed.code, 'utf8')

              // Write sourcemap if requested
              if (entry.sourcemap && transformed.map) {
                const mapPath = `${entryDistPath}.map`
                const mapContent = typeof transformed.map === 'string'
                  ? transformed.map
                  : JSON.stringify(transformed.map)
                await writeFile(mapPath, mapContent, 'utf8')
              }

              // Add hash to filename if requested
              if (entry.hash && !hasHash(entryDistPath)) {
                const hashedPath = addHashToFilename(entryDistPath, transformed.code)
                const { rename } = await import('node:fs/promises')
                await rename(entryDistPath, hashedPath)
                entryDistPath = hashedPath
              }

              if (SHEBANG_RE.test(transformed.code)) {
                await makeExecutable(entryDistPath)
              }

              if (transformed.declaration) {
                const dtsFileName = createFilename(baseName, 'es', true, {
                  platform: entry.platform,
                  fixedExtension: entry.fixedExtension,
                  outExtensions: entry.outExtensions,
                })
                const dtsPath = join(entry.outDir!, dtsFileName)
                await writeFile(
                  dtsPath,
                  transformed.declaration,
                  'utf8',
                )
              }
              return entryDistPath
            }
          }
          default: {
            {
              const entryDistPath = join(entry.outDir!, entryName)
              await mkdir(dirname(entryDistPath), { recursive: true })
              const code = await readFile(entryPath, 'utf8')
              await writeFile(entryDistPath, code, 'utf8')

              if (SHEBANG_RE.test(code)) {
                await makeExecutable(entryDistPath)
              }

              return entryDistPath
            }
          }
        }
      })(),
    )
  }

  const writtenFiles = await Promise.all(promises)

  // Copy files if specified
  if (entry.copy) {
    await copyFiles(ctx.pkgDir, fullOutDir, entry.copy)
  }

  logger.log(
    `\n${c.cyan('Transform')}  ${c.green(`${fmtPath(entry.outDir!)}/`)} ${c.dim(`(${writtenFiles.length} files)`)}`,
  )
}

/**
 * Transform a .ts module using oxc-transform.
 */
async function transformModule(entryPath: string, entry: TransformEntry) {
  let sourceText = await readFile(entryPath, 'utf8')

  // Determine language based on file extension
  const ext = extname(entryPath)
  const lang = ext === '.tsx' || ext === '.jsx' ? 'tsx' : 'ts'

  const sourceOptions = {
    lang,
    sourceType: 'module',
  } as const

  const parsed = parseSync(entryPath, sourceText, {
    ...sourceOptions,
  })

  if (parsed.errors.length > 0) {
    const error = new Error(`Errors while parsing ${entryPath}:`)
    ;(error as any).cause = parsed.errors
    throw error
  }

  const resolveOptions: ResolveOptions = {
    ...entry.resolve,
    from: pathToFileURL(entryPath),
    extensions: entry.resolve?.extensions ?? [
      '.ts',
      '.tsx',
      '.jsx',
      '.js',
      '.mjs',
      '.cjs',
      '.json',
    ],
    suffixes: entry.resolve?.suffixes ?? ['', '/index'],
  }

  const magicString = new MagicString(sourceText)

  // Rewrite relative imports and aliases
  const updatedStarts = new Set<number>()
  const rewriteSpecifier = (req: {
    value: string
    start: number
    end: number
  }) => {
    let moduleId = req.value
    let wasAliasResolved = false

    // Handle aliases first
    if (entry.alias) {
      for (const [alias, target] of Object.entries(entry.alias)) {
        if (moduleId === alias || moduleId.startsWith(`${alias}/`)) {
          moduleId = moduleId.replace(alias, target)
          wasAliasResolved = true
          break
        }
      }
    }

    // Skip external modules unless they were resolved from aliases
    if (!moduleId.startsWith('.') && !wasAliasResolved) {
      return
    }

    if (updatedStarts.has(req.start)) {
      return // prevent double rewritings
    }
    updatedStarts.add(req.start)

    const resolvedAbsolute = resolveModulePath(moduleId, resolveOptions)
    const newId = relative(
      dirname(entryPath),
      resolvedAbsolute.replace(/\.(ts|tsx|jsx)$/, '.mjs'),
    )
    magicString.remove(req.start, req.end)
    magicString.prependLeft(
      req.start,
      JSON.stringify(newId.startsWith('.') ? newId : `./${newId}`),
    )
  }

  for (const staticImport of parsed.module.staticImports) {
    rewriteSpecifier(staticImport.moduleRequest)
  }

  for (const staticExport of parsed.module.staticExports) {
    for (const staticExportEntry of staticExport.entries) {
      if (staticExportEntry.moduleRequest) {
        rewriteSpecifier(staticExportEntry.moduleRequest)
      }
    }
  }

  sourceText = magicString.toString()

  const transformed = await transform(entryPath, sourceText, {
    ...entry.oxc,
    ...sourceOptions,
    cwd: dirname(entryPath),
    target: entry.target || 'es2022',
    sourcemap: !!entry.sourcemap,
    typescript: {
      declaration: { stripInternal: true },
      ...entry.oxc?.typescript,
    },
  })

  const transformErrors = transformed.errors.filter(
    err => !err.message.includes('--isolatedDeclarations'),
  )

  if (transformErrors.length > 0) {
    await writeFile(
      'build-dump.ts',
      `/** Error dump for ${entryPath} */\n\n${sourceText}`,
      'utf8',
    )
    const error = new Error(
      `Errors while transforming ${entryPath}: (hint: check build-dump.ts)`,
    )
    ;(error as any).cause = transformErrors
    throw error
  }

  if (entry.minify) {
    const res = await minify(
      entryPath,
      transformed.code,
      entry.minify === true ? {} : entry.minify,
    )
    transformed.code = res.code
    transformed.map = res.map
  }

  // Apply banner/footer
  const banner = resolveChunkAddon(entry.banner, 'es') // Transform mode uses ESM
  const footer = resolveChunkAddon(entry.footer, 'es')
  transformed.code = addBannerFooter(transformed.code, banner, footer)

  // Apply Node.js protocol handling
  if (entry.nodeProtocol) {
    transformed.code = transformNodeProtocol(transformed.code, entry.nodeProtocol)
  }

  return transformed
}
