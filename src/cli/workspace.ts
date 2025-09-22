#!/usr/bin/env node

import type { WorkspacePackage } from '../features/workspace'
import type { BuildConfig } from '../types'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cac } from 'cac'
import { consola } from 'consola'
import { build } from '../build'
import { generatePackageExports, updatePackageJsonExports } from '../features/exports'
import {
  buildWorkspacePackages,
  discoverWorkspacePackages,
  filterWorkspacePackages,
  loadWorkspaceConfig,

} from '../features/workspace'

const cli = cac('robuild-workspace')

cli
  .command('[...packages]', 'Build workspace packages')
  .option('--filter <pattern>', 'Filter packages by name or path pattern')
  .option('--exclude <pattern>', 'Exclude packages by name or path pattern')
  .option('--parallel', 'Build packages in parallel (default)')
  .option('--sequential', 'Build packages sequentially')
  .option('--dry-run', 'Show what would be built without actually building')
  .option('--generate-exports', 'Generate package.json exports for each package')
  .option('--cwd <dir>', 'Working directory', { default: process.cwd() })
  .action(async (packages: string[], options) => {
    try {
      const workspaceRoot = resolve(options.cwd)

      // Load workspace configuration
      const workspaceConfig = await loadWorkspaceConfig(workspaceRoot)
      if (!workspaceConfig) {
        consola.error('No workspace configuration found. Please ensure you have a package.json with workspaces field, pnpm-workspace.yaml, or lerna.json')
        process.exit(1)
      }

      // Discover packages
      consola.info('Discovering workspace packages...')
      const allPackages = await discoverWorkspacePackages(workspaceRoot, workspaceConfig.packages)

      if (allPackages.length === 0) {
        consola.warn('No packages found in workspace')
        return
      }

      consola.info(`Found ${allPackages.length} packages`)

      // Filter packages
      let filteredPackages = allPackages

      if (packages.length > 0) {
        // Filter by specific package names
        filteredPackages = filteredPackages.filter(pkg =>
          packages.some(p => pkg.name.includes(p) || pkg.path.includes(p)),
        )
      }

      if (options.filter || options.exclude) {
        filteredPackages = filterWorkspacePackages(
          filteredPackages,
          options.filter,
          options.exclude,
        )
      }

      if (filteredPackages.length === 0) {
        consola.warn('No packages match the filter criteria')
        return
      }

      consola.info(`Building ${filteredPackages.length} packages:`)
      filteredPackages.forEach((pkg) => {
        consola.info(`  - ${pkg.name} (${pkg.path})`)
      })

      if (options.dryRun) {
        consola.info('Dry run completed')
        return
      }

      // Build packages
      const buildPackage = async (pkg: WorkspacePackage) => {
        consola.start(`Building ${pkg.name}...`)

        try {
          // Load package-specific build config
          const buildConfig = await loadPackageBuildConfig(pkg.path)

          if (!buildConfig.entries || buildConfig.entries.length === 0) {
            consola.warn(`No build entries found for ${pkg.name}, skipping`)
            return
          }

          // Build the package
          await build({
            ...buildConfig,
            cwd: pkg.path,
          })

          // Generate exports if requested
          if (options.generateExports && buildConfig.exports?.enabled) {
            const exports = await generatePackageExports(pkg.path, buildConfig, buildConfig.exports)
            if (buildConfig.exports.autoUpdate) {
              await updatePackageJsonExports(pkg.path, exports)
              consola.info(`Updated exports for ${pkg.name}`)
            }
          }

          consola.success(`Built ${pkg.name}`)
        }
        catch (error) {
          consola.error(`Failed to build ${pkg.name}:`, error)
          throw error
        }
      }

      // Execute builds
      if (options.sequential) {
        for (const pkg of filteredPackages) {
          await buildPackage(pkg)
        }
      }
      else {
        await buildWorkspacePackages(filteredPackages, buildPackage)
      }

      consola.success(`Successfully built ${filteredPackages.length} packages`)
    }
    catch (error) {
      consola.error('Workspace build failed:', error)
      process.exit(1)
    }
  })

cli
  .command('list', 'List workspace packages')
  .option('--filter <pattern>', 'Filter packages by name or path pattern')
  .option('--exclude <pattern>', 'Exclude packages by name or path pattern')
  .option('--json', 'Output as JSON')
  .option('--cwd <dir>', 'Working directory', { default: process.cwd() })
  .action(async (options) => {
    try {
      const workspaceRoot = resolve(options.cwd)

      // Load workspace configuration
      const workspaceConfig = await loadWorkspaceConfig(workspaceRoot)
      if (!workspaceConfig) {
        consola.error('No workspace configuration found')
        process.exit(1)
      }

      // Discover packages
      const allPackages = await discoverWorkspacePackages(workspaceRoot, workspaceConfig.packages)

      // Filter packages
      const filteredPackages = filterWorkspacePackages(
        allPackages,
        options.filter,
        options.exclude,
      )

      if (options.json) {
        console.log(JSON.stringify(filteredPackages, null, 2))
      }
      else {
        consola.info(`Found ${filteredPackages.length} packages:`)
        filteredPackages.forEach((pkg) => {
          consola.info(`  ${pkg.name} - ${pkg.path}`)
        })
      }
    }
    catch (error) {
      consola.error('Failed to list packages:', error)
      process.exit(1)
    }
  })

cli.help()
cli.version('1.0.0')

/**
 * Load build configuration for a specific package
 */
async function loadPackageBuildConfig(packagePath: string): Promise<BuildConfig> {
  const configFiles = [
    'robuild.config.ts',
    'robuild.config.js',
    'robuild.config.json',
  ]

  for (const configFile of configFiles) {
    try {
      const configPath = resolve(packagePath, configFile)

      if (configFile.endsWith('.json')) {
        const content = await readFile(configPath, 'utf-8')
        return JSON.parse(content)
      }
      else {
        // For JS/TS files, we'd need to import them
        // This is a simplified implementation
        const { default: config } = await import(configPath)
        return config
      }
    }
    catch {
      continue
    }
  }

  // Fallback to default configuration
  return {
    entries: [{
      type: 'bundle',
      input: 'src/index.ts',
      format: ['esm', 'cjs'],
      dts: true,
    }],
  }
}

if (require.main === module) {
  cli.parse()
}

export { cli }
