/**
 * String manipulation utilities
 */

/**
 * Convert string to camelCase
 */
export function camelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase())
}

/**
 * Convert string to PascalCase
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Convert string to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * Convert string to snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

/**
 * Pad string to specified length
 */
export function pad(str: string, length: number, char = ' ', position: 'left' | 'right' = 'left'): string {
  const padLength = length - str.length
  if (padLength <= 0) return str

  const padding = char.repeat(padLength)
  return position === 'left' ? padding + str : str + padding
}

/**
 * Check if string is empty or whitespace
 */
export function isBlank(str: string | null | undefined): boolean {
  return str === null || str === undefined || str.trim().length === 0
}

/**
 * Template literal tag for trimming indentation
 */
export function dedent(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? String(values[i]) : '')
  }, '')

  // Find minimum indentation
  const lines = result.split('\n')
  const minIndent = lines
    .filter((line) => line.trim().length > 0)
    .reduce((min, line) => {
      const match = line.match(/^(\s*)/)
      const indent = match ? match[1].length : 0
      return Math.min(min, indent)
    }, Infinity)

  // Remove common indentation
  if (minIndent < Infinity) {
    result = lines.map((line) => line.slice(minIndent)).join('\n')
  }

  return result.trim()
}
