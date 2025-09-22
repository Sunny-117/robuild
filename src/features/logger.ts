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

  setLevel(level: LogLevel) {
    this.level = level
    this.updateConsolaLevel()
  }

  private updateConsolaLevel() {
    const levelMap = {
      silent: 0,
      error: 1,
      warn: 2,
      info: 3,
      verbose: 4,
    }
    consola.level = levelMap[this.level]
  }

  silent(message: string, ...args: any[]) {
    // Always log silent messages
    console.log(message, ...args)
  }

  error(message: string, ...args: any[]) {
    this.errorCount++
    consola.error(message, ...args)
  }

  warn(message: string, ...args: any[]) {
    this.warningCount++
    consola.warn(message, ...args)
  }

  info(message: string, ...args: any[]) {
    consola.info(message, ...args)
  }

  verbose(message: string, ...args: any[]) {
    if (this.level === 'verbose') {
      consola.debug(message, ...args)
    }
  }

  success(message: string, ...args: any[]) {
    consola.success(message, ...args)
  }

  log(message: string, ...args: any[]) {
    consola.log(message, ...args)
  }

  getWarningCount(): number {
    return this.warningCount
  }

  getErrorCount(): number {
    return this.errorCount
  }

  resetCounts() {
    this.warningCount = 0
    this.errorCount = 0
  }

  shouldFailOnWarnings(failOnWarn: boolean): boolean {
    return failOnWarn && this.warningCount > 0
  }
}

// Global logger instance
export const logger = new Logger()

/**
 * Configure global logger
 */
export function configureLogger(level: LogLevel) {
  logger.setLevel(level)
}

/**
 * Get current warning and error counts
 */
export function getLogCounts() {
  return {
    warnings: logger.getWarningCount(),
    errors: logger.getErrorCount(),
  }
}

/**
 * Reset warning and error counts
 */
export function resetLogCounts() {
  logger.resetCounts()
}

/**
 * Check if build should fail due to warnings
 */
export function shouldFailOnWarnings(failOnWarn: boolean): boolean {
  return logger.shouldFailOnWarnings(failOnWarn)
}
