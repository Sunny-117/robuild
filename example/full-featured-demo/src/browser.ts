/**
 * Browser-specific entry point - demonstrates IIFE bundle for browsers
 */

import { generateId, formatBytes, camelCase, pascalCase, kebabCase, snakeCase } from '@utils'
import type { UserConfig, BuildOptions } from '@types'

declare const __VERSION__: string
declare const __DEV__: boolean

/**
 * Browser-compatible version of Robuild
 */
export class RobuildBrowser {
  private config: UserConfig

  constructor(config: UserConfig) {
    this.config = config
  }

  getConfig(): UserConfig {
    return { ...this.config }
  }

  static version(): string {
    return typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0'
  }

  static isDev(): boolean {
    return typeof __DEV__ !== 'undefined' ? __DEV__ : true
  }
}

// Utility functions exposed to browser
export const utils = {
  generateId,
  formatBytes,
  strings: {
    camelCase,
    pascalCase,
    kebabCase,
    snakeCase,
  },
}

// Types re-exported for browser usage
export type { UserConfig, BuildOptions }

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  ;(window as { RobuildDemo?: typeof RobuildBrowser & { utils: typeof utils } }).RobuildDemo = Object.assign(
    RobuildBrowser,
    { utils },
  )
  console.log(`[RobuildDemo] v${RobuildBrowser.version()} loaded`)
}
