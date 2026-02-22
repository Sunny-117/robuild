#!/usr/bin/env node
import { cac } from 'cac'

const cli = cac('my-cli')

cli
  .command('greet <name>', 'Greet someone')
  .option('-u, --uppercase', 'Output in uppercase')
  .action((name: string, options: { uppercase?: boolean }) => {
    const message = `Hello, ${name}!`
    console.log(options.uppercase ? message.toUpperCase() : message)
  })

cli.help()
cli.version('0.0.0')
cli.parse()
