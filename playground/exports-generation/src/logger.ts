import type { LogLevel } from './types'

export class Logger {
  private level: LogLevel

  constructor(level: LogLevel = 'info') {
    this.level = level
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`)
    }
  }

  info(message: string): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`)
    }
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`)
    }
  }

  error(message: string): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }
}

export function createLogger(level: LogLevel = 'info'): Logger {
  return new Logger(level)
}
