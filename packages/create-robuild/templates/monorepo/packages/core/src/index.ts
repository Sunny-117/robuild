import { capitalize } from '@my-monorepo/utils'

export function greet(name: string): string {
  return `Hello, ${capitalize(name)}!`
}
