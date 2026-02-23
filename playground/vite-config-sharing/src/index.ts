export const version = '1.0.0'

export interface LibConfig {
  name: string
  debug?: boolean
}

export function createLib(config: LibConfig) {
  return {
    name: config.name,
    version,
    debug: config.debug ?? false,
    log(message: string) {
      if (this.debug) {
        console.log(`[${this.name}] ${message}`)
      }
    },
    info() {
      return `${this.name} v${this.version}`
    },
  }
}

export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}
