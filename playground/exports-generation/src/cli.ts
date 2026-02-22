#!/usr/bin/env node

export interface CliOptions {
  verbose?: boolean
  output?: string
}

export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {}
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i]
    }
  }
  
  return options
}

export function runCli(args: string[] = process.argv.slice(2)): void {
  const options = parseArgs(args)
  
  if (options.verbose) {
    console.log('Running in verbose mode')
  }
  
  console.log('CLI executed successfully')
}
