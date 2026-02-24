import { test } from 'node:test'
import assert from 'node:assert'

test('ESM import works', async () => {
  const { default: greet } = await import('./dist/index.mjs')
  assert.strictEqual(greet('ESM'), 'Hello, ESM!')
})

test('CJS require works', async () => {
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  const greet = require('./dist/index.cjs')
  assert.strictEqual(greet('CJS'), 'Hello, CJS!')
})
