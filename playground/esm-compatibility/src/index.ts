// ESM Compatibility Demo
// This library demonstrates ESM features supported by robuild

/**
 * Add two numbers
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Multiply two numbers
 */
export function multiply(a: number, b: number): number {
  return a * b
}

/**
 * Library version
 */
export const version = '1.0.0'

/**
 * Example async function that demonstrates dynamic import support
 */
export async function loadFeature(name: string) {
  // Dynamic import - preserved in ESM output
  const module = await import(`./features/${name}.js`)
  return module.default
}

/**
 * Get the current module URL (ESM-specific)
 */
export function getModuleUrl(): string {
  return import.meta.url
}

// Default export for CommonJS compatibility
export default {
  add,
  multiply,
  version,
}
