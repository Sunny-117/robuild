/**
 * Utils module - re-exports all utility functions
 */

export * from './helpers'
export * from './string'

// Version info (will be replaced by define)
declare const __VERSION__: string
declare const __BUILD_TIME__: string

export const VERSION: string = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0-dev'
export const BUILD_TIME: string = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString()
