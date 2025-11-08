import type { BuildConfig, BuildEntry } from '../types'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface MigrationResult {
  config: BuildConfig
  warnings: string[]
  suggestions: string[]
}

/**
 * Migrate from tsup configuration
 */
export async function migrateFromTsup(configPath: string, configContent?: string): Promise<MigrationResult> {
  const warnings: string[] = []
  const suggestions: string[] = []

  try {
    const content = configContent || await readFile(configPath, 'utf-8')
    let tsupConfig: any

    // Try to parse as JSON first, then as JS module
    try {
      tsupConfig = JSON.parse(content)
    }
    catch {
      // For JS config files, we'd need to evaluate them
      // This is a simplified implementation
      warnings.push('JavaScript config files require manual migration')
      return { config: {}, warnings, suggestions }
    }

    const config: BuildConfig = {}
    const entries: BuildEntry[] = []

    // Migrate entry points
    if (tsupConfig.entry) {
      const entryPoints = Array.isArray(tsupConfig.entry) ? tsupConfig.entry : [tsupConfig.entry]

      for (const entry of entryPoints) {
        const buildEntry: BuildEntry = {
          type: 'bundle',
          input: entry,
        }

        // Migrate format
        if (tsupConfig.format) {
          buildEntry.format = Array.isArray(tsupConfig.format) ? tsupConfig.format : [tsupConfig.format]
        }

        // Migrate platform
        if (tsupConfig.platform) {
          buildEntry.platform = tsupConfig.platform
        }

        // Migrate target
        if (tsupConfig.target) {
          buildEntry.target = tsupConfig.target
        }

        // Migrate external
        if (tsupConfig.external) {
          buildEntry.external = tsupConfig.external
        }

        // Migrate noExternal
        if (tsupConfig.noExternal) {
          buildEntry.noExternal = tsupConfig.noExternal
        }

        // Migrate DTS
        if (tsupConfig.dts !== undefined) {
          buildEntry.dts = tsupConfig.dts
        }

        // Migrate minify
        if (tsupConfig.minify !== undefined) {
          buildEntry.minify = tsupConfig.minify
        }

        // Migrate globalName
        if (tsupConfig.globalName) {
          buildEntry.globalName = tsupConfig.globalName
        }

        entries.push(buildEntry)
      }
    }

    config.entries = entries

    // Migrate global options
    if (tsupConfig.outDir) {
      config.outDir = tsupConfig.outDir
    }

    if (tsupConfig.clean !== undefined) {
      config.clean = tsupConfig.clean
    }

    if (tsupConfig.watch !== undefined) {
      config.watch = tsupConfig.watch
    }

    // Handle unsupported options
    if (tsupConfig.splitting) {
      warnings.push('Code splitting is not directly supported, consider using multiple entries')
    }

    if (tsupConfig.treeshake) {
      suggestions.push('Tree shaking is enabled by default in robuild')
    }

    if (tsupConfig.sourcemap) {
      // Source map support is available; preserve the configuration where possible.
      // We don't warn anymore.
    }

    return { config, warnings, suggestions }
  }
  catch (error) {
    throw new Error(`Failed to migrate tsup config: ${error}`)
  }
}

/**
 * Migrate from unbuild configuration
 */
export async function migrateFromUnbuild(configPath: string, configContent?: string): Promise<MigrationResult> {
  const warnings: string[] = []
  const suggestions: string[] = []

  try {
    const content = configContent || await readFile(configPath, 'utf-8')
    let unbuildConfig: any

    try {
      unbuildConfig = JSON.parse(content)
    }
    catch {
      warnings.push('JavaScript config files require manual migration')
      return { config: {}, warnings, suggestions }
    }

    const config: BuildConfig = {}
    const entries: BuildEntry[] = []

    // Migrate entries
    if (unbuildConfig.entries) {
      for (const entry of unbuildConfig.entries) {
        const buildEntry: BuildEntry = {
          type: 'bundle',
          input: entry.input || entry,
        }

        // Migrate format (unbuild uses different format names)
        if (entry.format) {
          const formatMap: Record<string, string> = {
            esm: 'esm',
            cjs: 'cjs',
            iife: 'iife',
            umd: 'umd',
          }
          buildEntry.format = formatMap[entry.format] || entry.format
        }

        // Migrate other options
        if (entry.name) {
          buildEntry.globalName = entry.name
        }

        if (entry.external) {
          buildEntry.external = entry.external
        }

        entries.push(buildEntry)
      }
    }

    config.entries = entries

    // Migrate global options
    if (unbuildConfig.outDir) {
      config.outDir = unbuildConfig.outDir
    }

    if (unbuildConfig.clean !== undefined) {
      config.clean = unbuildConfig.clean
    }

    // Handle unbuild-specific options
    if (unbuildConfig.declaration) {
      suggestions.push('Use dts: true in entry configuration for TypeScript declarations')
    }

    if (unbuildConfig.rollup) {
      warnings.push('Custom Rollup options are not directly supported')
    }

    return { config, warnings, suggestions }
  }
  catch (error) {
    throw new Error(`Failed to migrate unbuild config: ${error}`)
  }
}

/**
 * Migrate from Vite library mode configuration
 */
export async function migrateFromViteLib(_configPath: string): Promise<MigrationResult> {
  const warnings: string[] = []
  const suggestions: string[] = []

  // This is a simplified implementation
  // In practice, you'd need to parse the Vite config more carefully
  warnings.push('Vite config migration requires manual review')
  suggestions.push('Use the fromVite option in robuild for automatic Vite config loading')

  const config: BuildConfig = {
    entries: [{
      type: 'bundle',
      input: 'src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    }],
  }

  return { config, warnings, suggestions }
}

/**
 * Migrate from webpack configuration
 */
export async function migrateFromWebpack(_configPath: string): Promise<MigrationResult> {
  const warnings: string[] = []
  const suggestions: string[] = []

  warnings.push('Webpack migration is complex and requires manual review')
  suggestions.push('Consider using robuild\'s simpler configuration approach')
  suggestions.push('Focus on entry points and output formats for initial migration')

  const config: BuildConfig = {
    entries: [{
      type: 'bundle',
      input: 'src/index.ts',
      format: ['esm'],
    }],
  }

  return { config, warnings, suggestions }
}

/**
 * Generate robuild configuration file
 */
export async function generateRobuildConfig(
  config: BuildConfig,
  outputPath: string = 'robuild.config.ts',
): Promise<void> {
  const configContent = `import type { BuildConfig } from 'robuild'

export default ${JSON.stringify(config, null, 2)} satisfies BuildConfig
`

  await writeFile(outputPath, configContent, 'utf-8')
}

/**
 * Auto-detect configuration files and suggest migration
 */
export async function detectMigrationSources(cwd: string): Promise<string[]> {
  const sources: string[] = []

  const configFiles = [
    { file: 'tsup.config.ts', tool: 'tsup' },
    { file: 'tsup.config.js', tool: 'tsup' },
    { file: 'tsup.config.json', tool: 'tsup' },
    { file: 'build.config.ts', tool: 'unbuild' },
    { file: 'build.config.js', tool: 'unbuild' },
    { file: 'vite.config.ts', tool: 'vite' },
    { file: 'vite.config.js', tool: 'vite' },
    { file: 'webpack.config.js', tool: 'webpack' },
    { file: 'webpack.config.ts', tool: 'webpack' },
  ]

  for (const { file, tool } of configFiles) {
    try {
      const configPath = join(cwd, file)
      await readFile(configPath, 'utf-8')
      sources.push(`${tool}: ${file}`)
    }
    catch {
      // File doesn't exist, skip
    }
  }

  return sources
}

/**
 * Perform migration based on detected tool
 */
export async function performMigration(
  tool: string,
  configPath: string,
): Promise<MigrationResult> {
  switch (tool.toLowerCase()) {
    case 'tsup':
      return migrateFromTsup(configPath)
    case 'unbuild':
      return migrateFromUnbuild(configPath)
    case 'vite':
      return migrateFromViteLib(configPath)
    case 'webpack':
      return migrateFromWebpack(configPath)
    default:
      throw new Error(`Unsupported migration tool: ${tool}`)
  }
}
