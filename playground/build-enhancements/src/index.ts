// Build enhancements demo
// Demonstrates: banner, footer, hash, fixedExtension, nodeProtocol, copy

import { resolve } from 'path'
import { createHash } from 'crypto'

export const version = '1.0.0'

export function getAbsolutePath(relativePath: string): string {
  return resolve(process.cwd(), relativePath)
}

export function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 8)
}

export const config = {
  name: 'build-enhancements-demo',
  version,
  features: {
    banner: true,
    footer: true,
    hash: true,
    fixedExtension: true,
    nodeProtocol: true,
    copy: true,
  },
}

console.log('Build enhancements demo loaded')
console.log('Config:', config)
