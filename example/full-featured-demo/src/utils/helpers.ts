/**
 * Utility functions for the robuild demo
 */

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone) as T
  }

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * Deep merge multiple objects
 */
export function deepMerge<T extends object>(...objects: Partial<T>[]): T {
  const result = {} as T

  for (const obj of objects) {
    if (!obj) continue

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

      const value = obj[key]
      const existing = result[key as keyof T]

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        typeof existing === 'object' &&
        existing !== null &&
        !Array.isArray(existing)
      ) {
        result[key as keyof T] = deepMerge(existing as object, value as object) as T[keyof T]
      } else {
        result[key as keyof T] = value as T[keyof T]
      }
    }
  }

  return result
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function debounced(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = undefined
    }, delay)
  }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function throttled(...args: Parameters<T>): void {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delay?: number; backoff?: number } = {},
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = 2 } = options

  let lastError: Error | undefined
  let currentDelay = delay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        break
      }

      await sleep(currentDelay)
      currentDelay *= backoff
    }
  }

  throw lastError
}
