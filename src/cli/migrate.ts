#!/usr/bin/env node

import type { MigrationResult } from '../features/migration'
import { join, resolve } from 'node:path'
import { cac } from 'cac'
import { consola } from 'consola'
import {
  detectMigrationSources,
  generateRobuildConfig,

  performMigration,
} from '../features/migration'

const cli = cac('robuild-migrate')

cli
  .command('detect', 'Detect configuration files that can be migrated')
  .option('--cwd <dir>', 'Working directory', { default: process.cwd() })
  .action(async (options) => {
    try {
      const cwd = resolve(options.cwd)
      const sources = await detectMigrationSources(cwd)

      if (sources.length === 0) {
        consola.info('No migration sources detected')
        return
      }

      consola.info('Detected configuration files:')
      sources.forEach((source) => {
        consola.info(`  - ${source}`)
      })

      consola.info('\nTo migrate from a specific tool, run:')
      consola.info('  robuild-migrate from <tool> <config-file>')
    }
    catch (error) {
      consola.error('Detection failed:', error)
      process.exit(1)
    }
  })

cli
  .command('from <tool> <config>', 'Migrate from a specific build tool')
  .option('--output <file>', 'Output configuration file', { default: 'robuild.config.ts' })
  .option('--dry-run', 'Show migration result without writing files')
  .option('--cwd <dir>', 'Working directory', { default: process.cwd() })
  .action(async (tool: string, configFile: string, options) => {
    try {
      const cwd = resolve(options.cwd)
      const configPath = resolve(cwd, configFile)
      const outputPath = resolve(cwd, options.output)

      consola.start(`Migrating from ${tool}...`)

      // Perform migration
      const result: MigrationResult = await performMigration(tool, configPath)

      // Show warnings and suggestions
      if (result.warnings.length > 0) {
        consola.warn('Migration warnings:')
        result.warnings.forEach((warning) => {
          consola.warn(`  - ${warning}`)
        })
      }

      if (result.suggestions.length > 0) {
        consola.info('Migration suggestions:')
        result.suggestions.forEach((suggestion) => {
          consola.info(`  - ${suggestion}`)
        })
      }

      // Show configuration preview
      consola.info('\nGenerated configuration:')
      console.log(JSON.stringify(result.config, null, 2))

      if (options.dryRun) {
        consola.info('\nDry run completed. No files were written.')
        return
      }

      // Generate configuration file
      await generateRobuildConfig(result.config, outputPath)

      consola.success(`Migration completed! Configuration written to ${options.output}`)

      // Show next steps
      consola.info('\nNext steps:')
      consola.info('1. Review the generated configuration')
      consola.info('2. Install robuild: npm install robuild')
      consola.info('3. Test the build: npx robuild')

      if (result.warnings.length > 0) {
        consola.info('4. Address any migration warnings listed above')
      }
    }
    catch (error) {
      consola.error('Migration failed:', error)
      process.exit(1)
    }
  })

cli
  .command('init', 'Initialize a new robuild configuration')
  .option('--template <template>', 'Configuration template', {
    default: 'library',
    choices: ['library', 'app', 'monorepo'],
  })
  .option('--output <file>', 'Output configuration file', { default: 'robuild.config.ts' })
  .option('--cwd <dir>', 'Working directory', { default: process.cwd() })
  .action(async (options) => {
    try {
      const cwd = resolve(options.cwd)
      const outputPath = resolve(cwd, options.output)

      let config: any

      switch (options.template) {
        case 'library':
          config = {
            entries: [{
              type: 'bundle',
              input: 'src/index.ts',
              format: ['esm', 'cjs'],
              dts: true,
            }],
            clean: true,
            exports: {
              enabled: true,
              includeTypes: true,
              autoUpdate: true,
            },
          }
          break

        case 'app':
          config = {
            entries: [{
              type: 'bundle',
              input: 'src/main.ts',
              format: ['esm'],
              platform: 'browser',
              minify: true,
            }],
            clean: true,
          }
          break

        case 'monorepo':
          config = {
            workspace: {
              packages: ['packages/*', 'apps/*'],
              dependencyOrder: true,
            },
            entries: [{
              type: 'bundle',
              input: 'src/index.ts',
              format: ['esm', 'cjs'],
              dts: true,
            }],
            clean: true,
            exports: {
              enabled: true,
              includeTypes: true,
              autoUpdate: true,
            },
          }
          break

        default:
          throw new Error(`Unknown template: ${options.template}`)
      }

      await generateRobuildConfig(config, outputPath)

      consola.success(`Configuration initialized! Created ${options.output}`)

      if (options.template === 'monorepo') {
        consola.info('\nFor monorepo builds, also run:')
        consola.info('  npx robuild-workspace')
      }
    }
    catch (error) {
      consola.error('Initialization failed:', error)
      process.exit(1)
    }
  })

cli
  .command('compare <tool> <config>', 'Compare current robuild config with another tool')
  .option('--cwd <dir>', 'Working directory', { default: process.cwd() })
  .action(async (tool: string, configFile: string, options) => {
    try {
      const cwd = resolve(options.cwd)
      const configPath = resolve(cwd, configFile)

      // Load current robuild config
      let currentConfig: any = {}
      try {
        const robuildConfigPath = join(cwd, 'robuild.config.ts')
        const { default: config } = await import(robuildConfigPath)
        currentConfig = config
      }
      catch {
        consola.warn('No robuild configuration found')
      }

      // Migrate from other tool
      const migrationResult = await performMigration(tool, configPath)

      consola.info(`Comparing robuild config with ${tool} config:\n`)

      consola.info('Current robuild config:')
      console.log(JSON.stringify(currentConfig, null, 2))

      consola.info(`\nMigrated ${tool} config:`)
      console.log(JSON.stringify(migrationResult.config, null, 2))

      if (migrationResult.warnings.length > 0) {
        consola.warn('\nMigration warnings:')
        migrationResult.warnings.forEach((warning) => {
          consola.warn(`  - ${warning}`)
        })
      }
    }
    catch (error) {
      consola.error('Comparison failed:', error)
      process.exit(1)
    }
  })

cli.help()
cli.version('1.0.0')

if (require.main === module) {
  cli.parse()
}

export { cli }
