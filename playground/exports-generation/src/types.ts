export interface User {
  id: number
  name: string
  email: string
  createdAt?: Date
  active?: boolean
}

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  createdAt?: Date
  published?: boolean
  tags?: string[]
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface DatabaseConfig {
  maxUsers?: number
  maxPosts?: number
  enableLogging?: boolean
}
