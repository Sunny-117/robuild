import { greet } from './utils'

export const version = '1.0.0'

export function createApp(name: string) {
  return {
    name,
    version,
    greet: (user: string) => greet(user),
    start() {
      console.log(`${name} v${version} started`)
    }
  }
}

export { greet } from './utils'
export type { User } from './types'
