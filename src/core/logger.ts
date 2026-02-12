import type { LogLevel } from '../types'
import { consola } from 'consola'

/**
 * Logger instance with configurable log level
 */
export class Logger {
  private level: LogLevel = 'info'
  private warningCount = 0
  private errorCount = 0

  constructor(level: LogLevel = 'info') {
    this.level = level
    this.updateConsolaLevel()
  }

  setLevel(level: LogLevel): void {
    this.level = level
    this.updateConsolaLevel()
  }

  private updateConsolaLevel(): void {
    const levelMap = {
      silent: 0,
      error: 1,
      warn: 2,
      info: 3,
      verbose: 4,
    }
    consola.level = levelMap[this.level]
  }

  silent(message: string, ...args: any[]): void {
    // Always log silent messages (bypass log level)
    consola.log(message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this.errorCount++
    consola.error(message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.warningCount++
    consola.warn(message, ...args)
  }

  info(message: string, ...args: any[]): void {
    consola.info(message, ...args)
  }

  verbose(message: string, ...args: any[]): void {
    if (this.level === 'verbose') {
      consola.debug(message, ...args)
    }
  }

  success(message: string, ...args: any[]): void {
    consola.success(message, ...args)
  }

  log(message: string, ...args: any[]): void {
    consola.log(message, ...args)
  }

  /**
   * Debug output - only visible with INSPECT_BUILD env var
   */
  debug(message: string, ...args: any[]): void {
    if (process.env.INSPECT_BUILD) {
      consola.log(message, ...args)
    }
  }

  getWarningCount(): number {
    return this.warningCount
  }

  getErrorCount(): number {
    return this.errorCount
  }

  resetCounts(): void {
    this.warningCount = 0
    this.errorCount = 0
  }

  shouldFailOnWarnings(failOnWarn: boolean): boolean {
    return failOnWarn && this.warningCount > 0
  }
}

// Global logger instance
export const logger: Logger = new Logger()

/**
 * Configure global logger
 */
export function configureLogger(level: LogLevel): void {
  logger.setLevel(level)
}

/**
 * Get current warning and error counts
 */
export function getLogCounts(): { warnings: number, errors: number } {
  return {
    warnings: logger.getWarningCount(),
    errors: logger.getErrorCount(),
  }
}

/**
 * Reset warning and error counts
 */
export function resetLogCounts(): void {
  logger.resetCounts()
}

/**
 * Check if build should fail due to warnings
 */
export function shouldFailOnWarnings(failOnWarn: boolean): boolean {
  return logger.shouldFailOnWarnings(failOnWarn)
}
