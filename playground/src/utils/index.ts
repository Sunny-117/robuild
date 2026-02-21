/**
 * Utils module for exports generation demo
 */

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0)
}
