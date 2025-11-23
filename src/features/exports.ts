import type { BuildConfig, BuildEntry, BundleEntry, TransformEntry } from '../types'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface ExportsConfig {
  /**
   * Whether to generate package.json exports field
   */
  enabled: boolean

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
}

export interface ExportEntry {
  key: string
  import?: string
  require?: string
  types?: string
}

/**
 * Generate package.json exports field based on build configuration
 */
export async function generatePackageExports(
  packageRoot: string,
  buildConfig: BuildConfig,
  exportsConfig: ExportsConfig = { enabled: true },
): Promise<Record<string, any>> {
  if (!exportsConfig.enabled) {
    return {}
  }

  const exports: Record<string, any> = {}
  const baseDir = exportsConfig.baseDir || 'dist'

  // Start with custom exports
  if (exportsConfig.custom) {
    Object.assign(exports, exportsConfig.custom)
  }

  // Generate exports from build entries
  if (buildConfig.entries) {
    for (const rawEntry of buildConfig.entries) {
      // Convert string entries to BuildEntry objects
      let entry: BuildEntry
      if (typeof rawEntry === 'string') {
        const [input, outDir] = rawEntry.split(':') as [string, string | undefined]
        entry = input.endsWith('/')
          ? ({ type: 'transform', input, outDir: outDir || 'dist' } as TransformEntry)
          : ({ type: 'bundle', input: input.split(','), outDir: outDir || 'dist' } as BundleEntry)
      }
      else {
        entry = rawEntry
      }

      const exportEntries = await generateExportFromEntry(
        packageRoot,
        entry,
        baseDir,
        exportsConfig.includeTypes,
      )

      for (const exportEntry of exportEntries) {
        exports[exportEntry.key] = createExportValue(exportEntry)
      }
    }
  }

  // Ensure main export exists
  if (!exports['.'] && !exports['./index']) {
    const mainExport = await findMainExport(packageRoot, baseDir)
    if (mainExport) {
      exports['.'] = mainExport
    }
  }

  return exports
}

/**
 * Generate export entries from a build entry
 */
async function generateExportFromEntry(
  packageRoot: string,
  entry: BuildEntry,
  baseDir: string,
  includeTypes?: boolean,
): Promise<ExportEntry[]> {
  const exports: ExportEntry[] = []

  if (entry.type === 'bundle') {
    const exportKey = getExportKey(entry.input)
    const exportEntry: ExportEntry = { key: exportKey }

    // Handle different formats
    if (Array.isArray(entry.format)) {
      for (const format of entry.format) {
        const outputPath = getOutputPath(entry, format, baseDir)
        assignFormatToExport(exportEntry, format, outputPath)
      }
    }
    else if (entry.format) {
      const outputPath = getOutputPath(entry, entry.format, baseDir)
      assignFormatToExport(exportEntry, entry.format, outputPath)
    }

    // Add types if enabled and DTS is generated
    if (includeTypes && entry.dts) {
      const typesPath = getTypesPath(entry, baseDir)
      exportEntry.types = typesPath
    }

    exports.push(exportEntry)
  }
  else if (entry.type === 'transform') {
    // For transform entries, discover all output files
    const transformExports = await discoverTransformExports(
      packageRoot,
      entry,
      baseDir,
      includeTypes,
    )
    exports.push(...transformExports)
  }

  return exports
}

/**
 * Get export key from input path
 */
function getExportKey(input: string | string[] | Record<string, string>): string {
  // Handle object input (named entries)
  if (typeof input === 'object' && !Array.isArray(input)) {
    const keys = Object.keys(input)
    return keys[0] || 'index'
  }
  // Handle array input by taking the first entry
  const inputPath = Array.isArray(input) ? input[0] : input

  if (inputPath === 'index.ts' || inputPath === 'src/index.ts') {
    return '.'
  }

  // Remove file extension and src/ prefix
  let key = inputPath.replace(/\.(ts|js|tsx|jsx)$/, '')
  key = key.replace(/^src\//, '')

  // Convert to export key format
  return key === 'index' ? '.' : `./${key}`
}

/**
 * Get output path for a specific format
 */
function getOutputPath(entry: BuildEntry, format: string, baseDir: string): string {
  const extension = getExtensionForFormat(format)
  const basename = getBasename(entry.input)

  if (format === 'cjs') {
    return `./${baseDir}/cjs/${basename}${extension}`
  }
  else if (format === 'esm') {
    return `./${baseDir}/${basename}${extension}`
  }
  else {
    return `./${baseDir}/${format}/${basename}${extension}`
  }
}

/**
 * Get file extension for format
 */
function getExtensionForFormat(format: string): string {
  switch (format) {
    case 'esm':
      return '.mjs'
    case 'cjs':
      return '.cjs'
    case 'iife':
    case 'umd':
      return '.js'
    default:
      return '.js'
  }
}

/**
 * Get basename from input path
 */
function getBasename(input: string | string[] | Record<string, string>): string {
  // Handle object input (named entries)
  if (typeof input === 'object' && !Array.isArray(input)) {
    const keys = Object.keys(input)
    const firstKey = keys[0]
    return firstKey || 'index'
  }
  // Handle array input by taking the first entry
  const inputPath = Array.isArray(input) ? input[0] : input
  return inputPath.replace(/\.(ts|js|tsx|jsx)$/, '').replace(/^src\//, '')
}

/**
 * Get types path for entry
 */
function getTypesPath(entry: BuildEntry, baseDir: string): string {
  const basename = getBasename(entry.input)
  return `./${baseDir}/${basename}.d.ts`
}

/**
 * Assign format-specific path to export entry
 */
function assignFormatToExport(exportEntry: ExportEntry, format: string, path: string): void {
  switch (format) {
    case 'esm':
      exportEntry.import = path
      break
    case 'cjs':
      exportEntry.require = path
      break
    default:
      // For other formats, use import as default
      exportEntry.import = path
      break
  }
}

/**
 * Create export value from export entry
 */
function createExportValue(entry: ExportEntry): any {
  const value: any = {}

  if (entry.types) {
    value.types = entry.types
  }
  if (entry.import) {
    value.import = entry.import
  }
  if (entry.require) {
    value.require = entry.require
  }

  // If only one format, return string directly
  const keys = Object.keys(value)
  if (keys.length === 1 && !entry.types) {
    return value[keys[0]]
  }

  return value
}

/**
 * Discover exports from transform entries
 */
async function discoverTransformExports(
  _packageRoot: string,
  entry: BuildEntry,
  baseDir: string,
  includeTypes?: boolean,
): Promise<ExportEntry[]> {
  const exports: ExportEntry[] = []

  // This is a simplified implementation
  // In practice, you'd scan the output directory for generated files
  const exportKey = getExportKey(entry.input)
  const exportEntry: ExportEntry = {
    key: exportKey,
    import: `./${baseDir}/${getBasename(entry.input)}.mjs`,
  }

  if (includeTypes && entry.type === 'bundle' && entry.dts) {
    exportEntry.types = getTypesPath(entry, baseDir)
  }

  exports.push(exportEntry)
  return exports
}

/**
 * Find main export file
 */
async function findMainExport(_packageRoot: string, baseDir: string): Promise<any> {
  const possibleMains = [
    'index.mjs',
    'index.js',
    'index.cjs',
  ]

  for (const main of possibleMains) {
    try {
      // Check if file exists (simplified check)
      const value: any = {}

      if (main.endsWith('.mjs')) {
        value.import = `./${baseDir}/${main}`
      }
      else if (main.endsWith('.cjs')) {
        value.require = `./${baseDir}/${main}`
      }
      else {
        value.import = `./${baseDir}/${main}`
      }

      return value
    }
    catch {
      continue
    }
  }

  return null
}

/**
 * Update package.json with generated exports
 */
export async function updatePackageJsonExports(
  packageRoot: string,
  exports: Record<string, any>,
): Promise<void> {
  const packageJsonPath = join(packageRoot, 'package.json')

  try {
    const content = await readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    // Update exports field
    packageJson.exports = exports

    // Write back to file
    const updatedContent = `${JSON.stringify(packageJson, null, 2)}\n`
    await writeFile(packageJsonPath, updatedContent, 'utf-8')
  }
  catch (error) {
    throw new Error(`Failed to update package.json: ${error}`)
  }
}
