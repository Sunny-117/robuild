import type { User } from './types'

export function greet(name: string): string {
  return `Hello, ${name}!`
}

export function formatUser(user: User): string {
  return `${user.name} (${user.email})`
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
