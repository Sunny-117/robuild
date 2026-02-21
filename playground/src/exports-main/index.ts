/**
 * Main entry point for exports generation demo
 */

export const name = 'robuild-demo'
export const version = '1.0.0'

export function greet(name: string): string {
  return `Hello, ${name}!`
}

export function add(a: number, b: number): number {
  return a + b
}
