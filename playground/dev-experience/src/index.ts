// Developer Experience Demo
// Demonstrates: onSuccess, logLevel, failOnWarn, ignoreWatch

export const version = '1.0.0'

export function greet(name: string): string {
  return `Hello, ${name}!`
}

export function add(a: number, b: number): number {
  return a + b
}

export const config = {
  name: 'dev-experience-demo',
  version,
  features: {
    onSuccess: true,
    logLevel: true,
    failOnWarn: true,
    ignoreWatch: true,
  },
}

console.log('Dev experience demo loaded')
