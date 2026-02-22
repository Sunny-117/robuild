// Hooks Demo
// This file is built with custom hooks logging the build process

export const version = '1.0.0'

export function greet(name: string): string {
  return `Hello, ${name}!`
}

export function add(a: number, b: number): number {
  return a + b
}

console.log('Hooks demo loaded')
