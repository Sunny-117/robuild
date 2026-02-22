export class Logger {
  private prefix: string

  constructor(prefix = 'LOG') {
    this.prefix = prefix
  }

  info(message: string): void {
    console.log(`[${this.prefix}] INFO: ${message}`)
  }

  warn(message: string): void {
    console.warn(`[${this.prefix}] WARN: ${message}`)
  }

  error(message: string): void {
    console.error(`[${this.prefix}] ERROR: ${message}`)
  }
}
