#!/usr/bin/env node
/**
 * CLI entry point - demonstrates CLI bundle with shebang preservation
 */

import { Robuild } from './core'
import { VERSION, formatBytes } from '@utils'

// Parse CLI arguments
const args = process.argv.slice(2)

function printHelp(): void {
  console.log(`
robuild-demo v${VERSION}

Usage:
  demo-cli [command] [options]

Commands:
  build       Build the project
  watch       Build and watch for changes
  version     Show version
  help        Show this help message

Options:
  --minify    Enable minification
  --no-dts    Disable type declarations
  --outDir    Output directory (default: ./dist)

Examples:
  demo-cli build
  demo-cli build --minify
  demo-cli watch --outDir ./output
`)
}

function printVersion(): void {
  console.log(`robuild-demo v${VERSION}`)
}

async function main(): Promise<void> {
  const command = args[0] || 'help'

  switch (command) {
    case 'build': {
      console.log('Building project...')
      const robuild = new Robuild({
        name: 'cli-build',
        plugins: [],
      })
      robuild.use((ctx) => {
        ctx.on('build:start', () => console.log('Build started'))
        ctx.on('build:end', () => console.log('Build completed'))
      })
      console.log(`Build instance created: ${robuild.name}`)
      console.log('Build completed successfully!')
      break
    }

    case 'watch': {
      console.log('Starting watch mode...')
      console.log('Watching for file changes...')
      break
    }

    case 'version':
    case '-v':
    case '--version':
      printVersion()
      break

    case 'help':
    case '-h':
    case '--help':
    default:
      printHelp()
      break
  }
}

main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
