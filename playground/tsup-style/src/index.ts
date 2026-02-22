// tsup-style configuration example
export const version = '1.0.0'

export interface Config {
  name: string
  debug: boolean
}

export function createConfig(name: string, debug = false): Config {
  return { name, debug }
}

export class Logger {
  constructor(private prefix: string) {}

  log(message: string): void {
    console.log(`[${this.prefix}] ${message}`)
  }
}

export default {
  version,
  createConfig,
  Logger
}
