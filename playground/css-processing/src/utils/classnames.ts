/**
 * Classname utility - similar to clsx/classnames
 */

export type ClassValue = string | number | boolean | null | undefined | ClassValue[]

/**
 * Merge class names conditionally
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input))
    } else if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) {
        classes.push(nested)
      }
    }
  }

  return classes.join(' ')
}
