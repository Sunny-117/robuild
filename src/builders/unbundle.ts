import type { BuildContext, TransformEntry } from '../types'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, isAbsolute, join } from 'node:path'
import { logger } from '../core/logger'

/**
 * Check if a path is in node_modules
 */
export function isInNodeModules(filePath: string): boolean {
  return filePath.includes('node_modules')
}

/**
 * Get all dependencies from node_modules
 */
export async function getNodeModulesDependencies(projectRoot: string): Promise<string[]> {
  const nodeModulesPath = join(projectRoot, 'node_modules')

  if (!existsSync(nodeModulesPath)) {
    return []
  }

  try {
    const entries = await readdir(nodeModulesPath, { withFileTypes: true })
    const dependencies: string[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith('@')) {
          // Scoped packages
          const scopedPath = join(nodeModulesPath, entry.name)
          const scopedEntries = await readdir(scopedPath, { withFileTypes: true })
          for (const scopedEntry of scopedEntries) {
            if (scopedEntry.isDirectory()) {
              dependencies.push(`${entry.name}/${scopedEntry.name}`)
            }
          }
        }
        else {
          dependencies.push(entry.name)
        }
      }
    }

    return dependencies
  }
  catch {
    return []
  }
}

/**
 * Unbundle mode: preserve file structure without bundling
 */
export async function unbundleTransform(
  ctx: BuildContext,
  entry: TransformEntry,
): Promise<void> {
  // Handle both absolute and relative paths
  const inputDir = isAbsolute(entry.input) ? entry.input : join(ctx.pkgDir, entry.input)
  const outputDir = join(ctx.pkgDir, entry.outDir || 'dist')

  await processDirectoryUnbundled(inputDir, outputDir, entry)
}

/**
 * Process directory in unbundle mode
 */
async function processDirectoryUnbundled(
  inputDir: string,
  outputDir: string,
  entry: TransformEntry,
): Promise<void> {
  const entries = await readdir(inputDir, { withFileTypes: true })

  for (const dirEntry of entries) {
    const inputPath = join(inputDir, dirEntry.name)
    const outputPath = join(outputDir, dirEntry.name)

    if (dirEntry.isDirectory()) {
      // Skip node_modules if configured
      if (entry.skipNodeModules && dirEntry.name === 'node_modules') {
        continue
      }

      await mkdir(dirname(outputPath), { recursive: true })
      await processDirectoryUnbundled(inputPath, outputPath, entry)
    }
    else if (dirEntry.isFile()) {
      await processFileUnbundled(inputPath, outputPath, entry)
    }
  }
}

/**
 * Process individual file in unbundle mode
 */
async function processFileUnbundled(
  inputPath: string,
  outputPath: string,
  entry: TransformEntry,
): Promise<void> {
  const ext = extname(inputPath)

  // Skip non-transformable files
  if (!['.js', '.ts', '.jsx', '.tsx', '.mjs', '.mts', '.cjs', '.cts'].includes(ext)) {
    return
  }

  try {
    const content = await readFile(inputPath, 'utf-8')

    // Transform imports to preserve structure
    const transformedContent = transformImportsForUnbundle(content, inputPath, entry)

    // Determine output extension
    const outputExt = getUnbundleOutputExtension(ext, entry)
    const finalOutputPath = outputPath.replace(ext, outputExt)

    await mkdir(dirname(finalOutputPath), { recursive: true })
    await writeFile(finalOutputPath, transformedContent, 'utf-8')
  }
  catch (error) {
    logger.warn(`Failed to process file ${inputPath}:`, error)
  }
}

/**
 * Transform imports for unbundle mode
 */
function transformImportsForUnbundle(
  content: string,
  _filePath: string,
  entry: TransformEntry,
): string {
  let transformedContent = content

  // Transform relative imports to preserve structure
  transformedContent = transformedContent.replace(
    /from\s+['"]([^'"]+)['"]/g,
    (match, importPath) => {
      if (importPath.startsWith('.')) {
        // Relative import - update extension if needed
        const newImportPath = updateImportExtension(importPath, entry)
        return match.replace(importPath, newImportPath)
      }
      return match
    },
  )

  // Transform require() calls
  transformedContent = transformedContent.replace(
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    (match, importPath) => {
      if (importPath.startsWith('.')) {
        const newImportPath = updateImportExtension(importPath, entry)
        return match.replace(importPath, newImportPath)
      }
      return match
    },
  )

  return transformedContent
}

/**
 * Update import extension for unbundle mode
 */
function updateImportExtension(importPath: string, entry: TransformEntry): string {
  const ext = extname(importPath)

  if (!ext) {
    // No extension - add appropriate one
    return `${importPath}.js`
  }

  if (['.ts', '.tsx', '.mts', '.cts'].includes(ext)) {
    // TypeScript extensions - convert to JavaScript
    const newExt = getUnbundleOutputExtension(ext, entry)
    return importPath.replace(ext, newExt)
  }

  return importPath
}

/**
 * Get output extension for unbundle mode
 */
function getUnbundleOutputExtension(inputExt: string, entry: TransformEntry): string {
  const format = Array.isArray(entry.format) ? entry.format[0] : entry.format || 'es'

  switch (inputExt) {
    case '.ts':
    case '.tsx':
      return format === 'cjs' ? '.cjs' : '.mjs'
    case '.mts':
      return '.mjs'
    case '.cts':
      return '.cjs'
    case '.js':
    case '.jsx':
      return format === 'cjs' ? '.cjs' : '.mjs'
    case '.mjs':
      return '.mjs'
    case '.cjs':
      return '.cjs'
    default:
      return '.js'
  }
}
