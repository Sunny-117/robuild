export interface User {
  id: number
  name: string
  email: string
  active?: boolean
}

export interface AppConfig {
  name: string
  version: string
  debug?: boolean
}
