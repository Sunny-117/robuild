import type { BuildContext, RobuildPlugin, TransformEntry } from '../types'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'

/**
 * Create skip node_modules plugin
 */
export function createSkipNodeModulesPlugin(options?: {
  noExternal?: (string | RegExp)[]
}): RobuildPlugin {
  const noExternalPatterns = options?.noExternal || []

  // Helper function to check if a module should be inlined
  const shouldInline = (id: string): boolean => {
    for (const pattern of noExternalPatterns) {
      if (typeof pattern === 'string') {
        if (id === pattern || id.startsWith(`${pattern}/`)) {
          return true
        }
      }
      else if (pattern instanceof RegExp) {
        if (pattern.test(id)) {
          return true
        }
      }
    }
    return false
  }

  return {
    name: 'skip-node-modules',
    resolveId: async (id: string) => {
      // Always inline modules matching noExternal patterns
      if (shouldInline(id)) {
        return null
      }

      // Skip resolution for node_modules dependencies
      if (id.includes('node_modules') || (!id.startsWith('.') && !id.startsWith('/'))) {
        return { id, external: true }
      }
      return null
    },
  }
}

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
  catch (error) {
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
  const inputDir = join(ctx.pkgDir, entry.input)
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
    console.warn(`Failed to process file ${inputPath}:`, error)
  }
}

/**
 * Transform imports for unbundle mode
 */
function transformImportsForUnbundle(
  content: string,
  filePath: string,
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
  const format = Array.isArray(entry.format) ? entry.format[0] : entry.format || 'esm'

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

/**
 * Create unbundle plugin
 */
export function createUnbundlePlugin(): RobuildPlugin {
  return {
    name: 'unbundle',
    buildStart: async () => {
      // Unbundle mode is handled at the build level, not plugin level
      // This plugin serves as a marker
    },
  }
}

/**
 * Analyze project structure for unbundle recommendations
 */
export async function analyzeProjectStructure(projectRoot: string): Promise<{
  totalFiles: number
  jsFiles: number
  tsFiles: number
  directories: number
  hasNodeModules: boolean
  recommendUnbundle: boolean
  recommendSkipNodeModules: boolean
}> {
  const stats = {
    totalFiles: 0,
    jsFiles: 0,
    tsFiles: 0,
    directories: 0,
    hasNodeModules: false,
    recommendUnbundle: false,
    recommendSkipNodeModules: false,
  }

  await analyzeDirectory(projectRoot, stats)

  // Recommendations based on analysis
  stats.recommendUnbundle = stats.directories > 3 && stats.jsFiles > 10
  stats.recommendSkipNodeModules = stats.hasNodeModules && stats.jsFiles < 50

  return stats
}

/**
 * Analyze directory recursively
 */
async function analyzeDirectory(
  dirPath: string,
  stats: any,
  depth: number = 0,
): Promise<void> {
  if (depth > 5)
    return // Prevent infinite recursion

  try {
    const entries = await readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)

      if (entry.isDirectory()) {
        stats.directories++

        if (entry.name === 'node_modules') {
          stats.hasNodeModules = true
          continue // Don't analyze node_modules
        }

        await analyzeDirectory(fullPath, stats, depth + 1)
      }
      else if (entry.isFile()) {
        stats.totalFiles++

        const ext = extname(entry.name)
        if (['.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
          stats.jsFiles++
        }
        else if (['.ts', '.tsx', '.mts', '.cts'].includes(ext)) {
          stats.tsFiles++
        }
      }
    }
  }
  catch (error) {
    // Ignore errors (permission issues, etc.)
  }
}

/**
 * Get external dependencies configuration for skip node_modules
 */
export function getSkipNodeModulesExternalConfig(dependencies: string[]): (string | RegExp)[] {
  return [
    ...dependencies,
    // Common Node.js built-ins
    /^node:/,
    /^fs$/,
    /^path$/,
    /^url$/,
    /^util$/,
    /^events$/,
    /^stream$/,
    /^buffer$/,
    /^crypto$/,
    /^os$/,
    /^process$/,
    // Common patterns
    /^@types\//,
    /^@babel\//,
    /^@rollup\//,
    /^@vitejs\//,
  ]
}

/**
 * Check if unbundle mode is suitable for the project
 */
export function isUnbundleSuitable(
  projectStructure: Awaited<ReturnType<typeof analyzeProjectStructure>>,
): boolean {
  return (
    projectStructure.directories > 2
    && projectStructure.jsFiles > 5
    && projectStructure.jsFiles < 100 // Not too large
  )
}

/**
 * Get recommended build configuration for advanced options
 */
export function getRecommendedAdvancedConfig(
  projectStructure: Awaited<ReturnType<typeof analyzeProjectStructure>>,
): {
  skipNodeModules: boolean
  unbundle: boolean
  reasoning: string[]
} {
  const reasoning: string[] = []
  let skipNodeModules = false
  let unbundle = false

  if (projectStructure.hasNodeModules && projectStructure.jsFiles < 50) {
    skipNodeModules = true
    reasoning.push('Small project with node_modules - recommend skipping node_modules bundling')
  }

  if (isUnbundleSuitable(projectStructure)) {
    unbundle = true
    reasoning.push('Project structure suitable for unbundle mode - preserves file organization')
  }

  if (projectStructure.directories > 5) {
    reasoning.push('Complex directory structure detected - consider unbundle mode')
  }

  return {
    skipNodeModules,
    unbundle,
    reasoning,
  }
}
