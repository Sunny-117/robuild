import type { BuildConfig, BuildEntry, BundleEntry, Platform, TransformEntry } from '../types'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative } from 'node:path'
import { colors as c } from 'consola/utils'
import { logger } from '../core/logger'
import { getFormatExtension } from '../utils/extensions'

export interface ExportsConfig {
  /**
   * Whether to generate package.json exports field
   */
  enabled?: boolean

  /**
   * Custom exports mapping
   */
  custom?: Record<string, string | { import?: string, require?: string, types?: string }>

  /**
   * Whether to include types in exports
   */
  includeTypes?: boolean

  /**
   * Base directory for exports (relative to package root)
   */
  baseDir?: string

  /**
   * Whether to update package.json automatically
   */
  autoUpdate?: boolean
}

export interface ExportEntry {
  key: string
  import?: string
  require?: string
  types?: string
}

export interface GenerateExportsContext {
  pkgDir: string
  config: BuildConfig
  entries: BuildEntry[]
}

/**
 * Generate package.json exports field based on build configuration
 */
export function generatePackageExports(
  ctx: GenerateExportsContext,
  exportsConfig: ExportsConfig = { enabled: true },
): Record<string, any> {
  if (!exportsConfig.enabled) {
    return {}
  }

  const exports: Record<string, any> = {}
  const includeTypes = exportsConfig.includeTypes !== false

  // Start with custom exports
  if (exportsConfig.custom) {
    Object.assign(exports, exportsConfig.custom)
  }

  // Generate exports from build entries
  for (const entry of ctx.entries) {
    // Check if this entry should generate exports
    if (entry.type === 'bundle') {
      const bundleEntry = entry as BundleEntry
      if (!bundleEntry.generateExports && !exportsConfig.enabled) {
        continue
      }

      const exportEntries = generateExportFromBundleEntry(
        ctx.pkgDir,
        bundleEntry,
        includeTypes,
      )

      for (const exportEntry of exportEntries) {
        exports[exportEntry.key] = createExportValue(exportEntry)
      }
    }
    else if (entry.type === 'transform') {
      const transformEntry = entry as TransformEntry
      if (!exportsConfig.enabled) {
        continue
      }

      const exportEntries = generateExportFromTransformEntry(
        ctx.pkgDir,
        transformEntry,
        includeTypes,
      )

      for (const exportEntry of exportEntries) {
        exports[exportEntry.key] = createExportValue(exportEntry)
      }
    }
  }

  return exports
}

/**
 * Generate export entries from a bundle entry
 */
function generateExportFromBundleEntry(
  pkgDir: string,
  entry: BundleEntry,
  includeTypes: boolean,
): ExportEntry[] {
  const exports: ExportEntry[] = []

  // Get input value
  const inputValue = entry.input ?? entry.entry ?? 'src/index.ts'
  const rawOutDir = entry.outDir || 'dist'
  // Make outDir relative to pkgDir if it's absolute
  const outDir = isAbsolute(rawOutDir) ? relative(pkgDir, rawOutDir) : rawOutDir
  const formats = Array.isArray(entry.format) ? entry.format : [entry.format || 'es']
  const platform = entry.platform || 'node'
  const isMultiFormat = formats.length > 1

  // Handle different input types
  const inputs = normalizeInput(inputValue, pkgDir)

  for (const [name, _srcPath] of Object.entries(inputs)) {
    // Determine export key
    let exportKey: string
    if (entry.exportPath) {
      exportKey = entry.exportPath
    }
    else {
      exportKey = getExportKeyFromName(name)
    }

    const exportEntry: ExportEntry = { key: exportKey }

    // Generate output paths for each format
    for (const format of formats) {
      const extension = getOutputExtension(format, isMultiFormat, platform, entry.fixedExtension)
      const outputPath = `./${join(outDir, `${name}${extension}`)}`

      if (format === 'es' || format === 'esm' || format === 'module') {
        exportEntry.import = outputPath
      }
      else if (format === 'cjs' || format === 'commonjs') {
        exportEntry.require = outputPath
      }
      else if (!exportEntry.import) {
        // For IIFE/UMD, use import as default
        exportEntry.import = outputPath
      }
    }

    // Add types if enabled and DTS is generated
    if (includeTypes && entry.dts !== false) {
      // DTS files use .d.mts or .d.ts extension
      const dtsExtension = entry.fixedExtension ? '.d.mts' : '.d.mts'
      exportEntry.types = `./${join(outDir, `${name}${dtsExtension}`)}`
    }

    exports.push(exportEntry)
  }

  return exports
}

/**
 * Generate export entries from a transform entry
 */
function generateExportFromTransformEntry(
  pkgDir: string,
  entry: TransformEntry,
  includeTypes: boolean,
): ExportEntry[] {
  const exports: ExportEntry[] = []

  const rawOutDir = entry.outDir || 'dist'
  // Make outDir relative to pkgDir if it's absolute
  const outDir = isAbsolute(rawOutDir) ? relative(pkgDir, rawOutDir) : rawOutDir

  // For transform entries, we typically export the main index file
  const exportEntry: ExportEntry = {
    key: '.',
    import: `./${join(outDir, 'index.mjs')}`,
  }

  if (includeTypes) {
    exportEntry.types = `./${join(outDir, 'index.d.mts')}`
  }

  exports.push(exportEntry)

  return exports
}

/**
 * Normalize input to a Record<string, string> format
 */
function normalizeInput(input: string | string[] | Record<string, string>, pkgDir?: string): Record<string, string> {
  if (typeof input === 'object' && !Array.isArray(input)) {
    // If input is already a record, normalize the names
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(input)) {
      result[key] = value
    }
    return result
  }

  const result: Record<string, string> = {}
  const inputs = Array.isArray(input) ? input : [input]

  for (const src of inputs) {
    const name = getNameFromPath(src, pkgDir)
    result[name] = src
  }

  return result
}

/**
 * Get name from source path
 */
function getNameFromPath(srcPath: string, pkgDir?: string): string {
  let path = srcPath

  // If srcPath is absolute and pkgDir is provided, make it relative
  if (pkgDir && isAbsolute(srcPath)) {
    path = relative(pkgDir, srcPath)
  }

  // Remove ./ prefix if present
  path = path.replace(/^\.\//, '')
  // Remove src/ prefix if present
  path = path.replace(/^src\//, '')
  // Remove file extension
  path = path.replace(/\.(ts|js|tsx|jsx|mts|mjs|cts|cjs)$/, '')
  // Get basename for simple paths, or preserve directory structure
  const dir = dirname(path)
  const base = basename(path)

  if (dir === '.' || dir === '') {
    return base
  }

  return join(dir, base)
}

/**
 * Get export key from entry name
 */
function getExportKeyFromName(name: string): string {
  if (name === 'index') {
    return '.'
  }

  // If it's a path like utils/index, convert to ./utils
  if (name.endsWith('/index')) {
    return `./${name.replace(/\/index$/, '')}`
  }

  return `./${name}`
}

/**
 * Get output file extension
 */
function getOutputExtension(
  format: string,
  isMultiFormat: boolean,
  platform: Platform,
  fixedExtension?: boolean,
): string {
  if (isMultiFormat) {
    if (format === 'cjs' || format === 'commonjs') {
      return '.cjs'
    }
    else if (format === 'es' || format === 'esm' || format === 'module') {
      return '.mjs'
    }
    else if (format === 'iife' || format === 'umd') {
      return '.js'
    }
  }

  return getFormatExtension(format, platform, fixedExtension)
}

/**
 * Create export value from export entry
 */
function createExportValue(entry: ExportEntry): any {
  const value: any = {}

  // Types should come first in the export value (Node.js resolution order)
  if (entry.types) {
    value.types = entry.types
  }
  if (entry.import) {
    value.import = entry.import
  }
  if (entry.require) {
    value.require = entry.require
  }

  // If only one format (excluding types), return string directly
  const nonTypeKeys = Object.keys(value).filter(k => k !== 'types')
  if (nonTypeKeys.length === 1 && !entry.types) {
    return value[nonTypeKeys[0]]
  }

  return value
}

/**
 * Update package.json with generated exports
 */
export function updatePackageJsonExports(
  packageRoot: string,
  exports: Record<string, any>,
): void {
  const packageJsonPath = join(packageRoot, 'package.json')

  try {
    const content = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    // Update exports field
    packageJson.exports = exports

    // Write back to file with proper formatting
    const updatedContent = `${JSON.stringify(packageJson, null, 2)}\n`
    writeFileSync(packageJsonPath, updatedContent, 'utf-8')

    logger.info(`${c.cyan('Exports')} Updated package.json exports field`)
  }
  catch (error) {
    throw new Error(`Failed to update package.json: ${error}`)
  }
}

/**
 * Read existing package.json exports
 */
export function readPackageJsonExports(packageRoot: string): Record<string, any> | undefined {
  const packageJsonPath = join(packageRoot, 'package.json')

  try {
    if (!existsSync(packageJsonPath)) {
      return undefined
    }

    const content = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    return packageJson.exports
  }
  catch {
    return undefined
  }
}

/**
 * Merge generated exports with existing exports
 */
export function mergeExports(
  existing: Record<string, any> | undefined,
  generated: Record<string, any>,
): Record<string, any> {
  if (!existing) {
    return generated
  }

  // Generated exports take precedence
  return {
    ...existing,
    ...generated,
  }
}
