// Stub Mode Demo
// In stub mode, this file is re-exported directly without bundling

export interface User {
  id: number
  name: string
  email: string
}

export function createUser(name: string, email: string): User {
  return {
    id: Date.now(),
    name,
    email,
  }
}

export function greet(user: User): string {
  return `Hello, ${user.name}!`
}

export const VERSION = '1.0.0'

// Default export
export default {
  createUser,
  greet,
  VERSION,
}
