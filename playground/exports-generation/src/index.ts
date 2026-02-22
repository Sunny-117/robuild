export { createLogger, Logger } from './logger'
export { Database } from './database'
export type { User, Post, LogLevel } from './types'

export const version = '1.0.0'

export function createApp() {
  return {
    version,
    start() {
      console.log(`App v${version} started`)
    }
  }
}
