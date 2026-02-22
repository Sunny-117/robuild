/**
 * Type definitions for the robuild demo
 */

/**
 * User configuration options
 */
export interface UserConfig {
  /** User's display name */
  name: string
  /** User's email address */
  email?: string
  /** User preferences */
  preferences?: UserPreferences
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Theme setting */
  theme: 'light' | 'dark' | 'auto'
  /** Language setting */
  language: string
  /** Enable notifications */
  notifications: boolean
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T
  /** Success indicator */
  success: boolean
  /** Error message if failed */
  error?: string
  /** Response timestamp */
  timestamp: number
}

/**
 * Build options
 */
export interface BuildOptions {
  /** Enable minification */
  minify?: boolean
  /** Enable source maps */
  sourcemap?: boolean
  /** Target platform */
  platform?: 'node' | 'browser' | 'neutral'
  /** Output directory */
  outDir?: string
}

/**
 * Logger levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

/**
 * Event handler type
 */
export type EventHandler<T = unknown> = (event: T) => void | Promise<void>

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Deep partial type helper
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T
