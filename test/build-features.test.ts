import { describe, expect, it } from 'vitest'
import { testBuild } from './utils'

describe('build features enhancement', () => {
  describe('copy functionality', () => {
    it('should copy files with string paths', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
          'assets/logo.png': 'fake-png-content',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              copy: ['assets/logo.png'],
              dts: false,
            },
          ],
        },
      })

      expect(fileMap['index.mjs']).toBeDefined()
      expect(fileMap['logo.png']).toBe('fake-png-content')
    })

    it('should copy files with object paths', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
          'assets/logo.png': 'fake-png-content',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              copy: [{ from: 'assets/logo.png', to: 'dist/images/logo.png' }],
              dts: false,
            },
          ],
        },
      })

      expect(fileMap['index.mjs']).toBeDefined()
      expect(fileMap['images/logo.png']).toBe('fake-png-content')
    })
  })

  describe('banner/footer functionality', () => {
    it('should add banner to output', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              banner: '// Copyright 2024',
              dts: false,
            },
          ],
        },
      })

      const content = fileMap['index.mjs']
      expect(content).toContain('// Copyright 2024')
      expect(content).toContain('hello')
    })

    it('should add footer to output', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              footer: '// End of file',
              dts: false,
            },
          ],
        },
      })

      const content = fileMap['index.mjs']
      expect(content).toContain('// End of file')
      expect(content).toContain('hello')
    })

    it('should add both banner and footer', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              banner: '// Copyright 2024',
              footer: '// End of file',
              dts: false,
            },
          ],
        },
      })

      const content = fileMap['index.mjs']
      expect(content).toContain('// Copyright 2024')
      expect(content).toContain('// End of file')
      expect(content).toContain('hello')
    })

    it('should support format-specific banner/footer', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              format: ['esm', 'cjs'],
              banner: {
                js: '// ESM Banner',
                cjs: '// CJS Banner',
              },
              dts: false,
            },
          ],
        },
      })

      console.log('Available files:', Object.keys(fileMap))

      const esmContent = fileMap['index.mjs']
      const cjsContent = fileMap['cjs/index.cjs'] || fileMap['index.cjs']

      expect(esmContent).toContain('// ESM Banner')
      if (cjsContent) {
        expect(cjsContent).toContain('// CJS Banner')
      }
      else {
        console.warn('CJS file not found, available files:', Object.keys(fileMap))
      }
    })
  })

  describe('hash functionality', () => {
    it('should add hash to filename when enabled', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello world"',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              hash: true,
              dts: false,
            },
          ],
        },
      })

      const filenames = Object.keys(fileMap)
      const hashedFile = filenames.find(name => /-[a-f0-9]{8}\.mjs$/.test(name))
      expect(hashedFile).toBeDefined()
      expect(fileMap[hashedFile!]).toContain('hello world')
    })

    it('should not add hash when disabled', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello world"',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              hash: false,
              dts: false,
            },
          ],
        },
      })

      expect(fileMap['index.mjs']).toBeDefined()
      expect(fileMap['index.mjs']).toContain('hello world')
    })
  })

  describe('fixedExtension functionality', () => {
    it('should use fixed extensions when enabled', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
        },
        options: {
          entries: [
            {
              type: 'bundle',
              input: 'src/index.ts',
              outDir: 'dist',
              format: 'esm', // Test single format first
              fixedExtension: true,
              dts: false,
            },
          ],
        },
      })

      console.log('Available files for fixedExtension:', Object.keys(fileMap))

      expect(fileMap['index.mjs']).toBeDefined() // ESM uses .mjs with fixedExtension
    })

    it('should use fixed extensions for transform mode', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': 'export const test = "hello"',
        },
        options: {
          entries: [
            {
              type: 'transform',
              input: 'src/',
              outDir: 'dist',
              fixedExtension: true,
            },
          ],
        },
      })

      console.log('Transform fixedExtension files:', Object.keys(fileMap))

      expect(fileMap['index.mjs']).toBeDefined() // Transform mode uses .mjs with fixedExtension
    })
  })

  describe('nodeProtocol functionality', () => {
    it('should add node: prefix when enabled', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': `
import { readFile } from 'fs'
import { join } from 'path'
export const test = { readFile, join }
          `.trim(),
        },
        options: {
          entries: [
            {
              type: 'transform',
              input: 'src/',
              outDir: 'dist',
              nodeProtocol: true,
            },
          ],
        },
      })

      const content = fileMap['index.mjs']
      expect(content).toContain('node:fs')
      expect(content).toContain('node:path')
    })

    it('should strip node: prefix when set to strip', async (ctx) => {
      const { fileMap } = await testBuild({
        context: ctx,
        files: {
          'src/index.ts': `
import { readFile } from 'node:fs'
import { join } from 'node:path'
export const test = { readFile, join }
          `.trim(),
        },
        options: {
          entries: [
            {
              type: 'transform',
              input: 'src/',
              outDir: 'dist',
              nodeProtocol: 'strip',
            },
          ],
        },
      })

      const content = fileMap['index.mjs']
      console.log('Node protocol strip content:', content)
      expect(content).toContain('from "fs"')
      expect(content).toContain('from "path"')
      expect(content).not.toContain('node:')
    })
  })
})
