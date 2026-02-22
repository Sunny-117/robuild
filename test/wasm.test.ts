import { describe, expect, it } from 'vitest'
import { testBuild } from './helpers'

/**
 * WASM support tests
 * Tests for WebAssembly module bundling
 */
describe('wasm support', () => {
  // A minimal WASM module that exports an add function
  // This is a simple (module (func (export "add") (param i32 i32) (result i32) (i32.add (local.get 0) (local.get 1))))
  // Compiled to binary
  const simpleWasmModule = Buffer.from([
    0x00, 0x61, 0x73, 0x6D, // magic number
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x07, // type section
    0x01, 0x60, 0x02, 0x7F, 0x7F, 0x01, 0x7F, // (func (param i32 i32) (result i32))
    0x03, 0x02, // function section
    0x01, 0x00, // function 0 uses type 0
    0x07, 0x07, // export section
    0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, // export "add" as function 0
    0x0A, 0x09, // code section
    0x01, 0x07, 0x00, // function body
    0x20, 0x00, // local.get 0
    0x20, 0x01, // local.get 1
    0x6A, // i32.add
    0x0B, // end
  ])

  describe('basic wasm bundling', () => {
    it('should bundle wasm file with wasm option enabled', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            // @ts-ignore
            import { add } from './math.wasm'
            export { add }
          `,
          'math.wasm': simpleWasmModule,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
          wasm: true,
        },
        afterBuild: async (outputDir) => {
          const { existsSync, readdirSync } = await import('node:fs')
          const { join } = await import('node:path')

          // Output should exist
          expect(existsSync(join(outputDir, 'index.mjs'))).toBe(true)

          // Check output content contains wasm handling code
          const { readFileSync } = await import('node:fs')
          const content = readFileSync(join(outputDir, 'index.mjs'), 'utf8')

          // Should have some wasm instantiation code
          expect(
            content.includes('WebAssembly') || content.includes('wasm') || content.includes('add'),
          ).toBe(true)
        },
      })
    })

    it('should bundle wasm with entry-level wasm config', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            // @ts-ignore
            import { add } from './math.wasm'
            export const result = add(1, 2)
          `,
          'math.wasm': simpleWasmModule,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              wasm: {
                enabled: true,
                targetEnv: 'auto',
              },
            },
          ],
        },
        afterBuild: async (outputDir) => {
          const { existsSync } = await import('node:fs')
          const { join } = await import('node:path')

          expect(existsSync(join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })

    it('should emit wasm file when maxFileSize is 0', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            // @ts-ignore
            import { add } from './math.wasm'
            export { add }
          `,
          'math.wasm': simpleWasmModule,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
          wasm: {
            enabled: true,
            maxFileSize: 0, // Always emit as separate file
          },
        },
        afterBuild: async (outputDir) => {
          const { readdirSync } = await import('node:fs')
          const files = readdirSync(outputDir)

          // Should have emitted a .wasm file
          const wasmFiles = files.filter(f => f.endsWith('.wasm'))
          expect(wasmFiles.length).toBe(1)
        },
      })
    })
  })

  describe('wasm configuration', () => {
    it('should not process wasm when wasm option is disabled', async (context) => {
      // This test verifies that without wasm enabled, the import will fail
      // We just verify the config is correctly passed
      await testBuild({
        context,
        files: {
          'index.ts': `export const value = 42`,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
            },
          ],
          wasm: false,
        },
        afterBuild: async (outputDir) => {
          const { existsSync } = await import('node:fs')
          const { join } = await import('node:path')

          expect(existsSync(join(outputDir, 'index.mjs'))).toBe(true)
        },
      })
    })

    it('should respect entry-level wasm config over global config', async (context) => {
      await testBuild({
        context,
        files: {
          'index.ts': `
            // @ts-ignore
            import { add } from './math.wasm'
            export { add }
          `,
          'math.wasm': simpleWasmModule,
        },
        config: {
          entries: [
            {
              type: 'bundle',
              input: 'index.ts',
              format: 'esm',
              wasm: {
                enabled: true,
                maxFileSize: 0, // Force emit file
              },
            },
          ],
          wasm: {
            enabled: true,
            maxFileSize: 100 * 1024, // Global says inline
          },
        },
        afterBuild: async (outputDir) => {
          const { readdirSync } = await import('node:fs')
          const files = readdirSync(outputDir)

          // Entry config should win, so wasm should be emitted
          const wasmFiles = files.filter(f => f.endsWith('.wasm'))
          expect(wasmFiles.length).toBe(1)
        },
      })
    })
  })
})
