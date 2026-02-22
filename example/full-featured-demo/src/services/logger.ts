/**
 * Logger service - Transform mode example
 * This file will be transformed individually, preserving directory structure
 */

import type { LogLevel } from '../types'

export interface LoggerOptions {
  level: LogLevel
  prefix?: string
  timestamp?: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

export class Logger {
  private level: LogLevel
  private prefix: string
  private timestamp: boolean

  constructor(options: LoggerOptions) {
    this.level = options.level
    this.prefix = options.prefix || ''
    this.timestamp = options.timestamp ?? true
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = []

    if (this.timestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    parts.push(`[${level.toUpperCase()}]`)

    if (this.prefix) {
      parts.push(`[${this.prefix}]`)
    }

    parts.push(message)

    return parts.join(' ')
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  child(prefix: string): Logger {
    return new Logger({
      level: this.level,
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      timestamp: this.timestamp,
    })
  }
}

export function createLogger(options: Partial<LoggerOptions> = {}): Logger {
  return new Logger({
    level: options.level || 'info',
    prefix: options.prefix,
    timestamp: options.timestamp,
  })
}
