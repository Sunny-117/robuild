/**
 * WASM Support Example
 *
 * This example demonstrates how to use WebAssembly modules with robuild.
 *
 * The math.wasm file exports a simple `add` function that adds two integers.
 */

// Import the add function from WASM module
// Note: You may need to add type declarations for .wasm files
// @ts-ignore - WASM module import
import { add } from './math.wasm'

/**
 * Add two numbers using WASM
 */
export function wasmAdd(a: number, b: number): number {
  return add(a, b)
}

/**
 * Example usage
 */
export function demo(): void {
  const result = wasmAdd(10, 20)
  console.log(`WASM add(10, 20) = ${result}`)
}

// Re-export the raw WASM function for direct usage
export { add }

console.log(add(1, 2))
