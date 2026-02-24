/**
 * A simple greeting function.
 *
 * When cjsDefault is enabled:
 * - ESM: import greet from 'cjs-default-example'
 * - CJS: const greet = require('cjs-default-example')
 *
 * Both work the same way, returning the greet function directly.
 */
export default function greet(name: string = 'World'): string {
  return `Hello, ${name}!`
}
