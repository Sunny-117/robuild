import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { build } from '../src/build.ts'

const fixtureDir = new URL('clean/', import.meta.url)
const distDir = new URL('dist/', fixtureDir)

describe('clean functionality', () => {
  beforeAll(async () => {
    await rm(fixtureDir, { recursive: true, force: true })
    await mkdir(fixtureDir, { recursive: true })
    await mkdir(new URL('src/', fixtureDir), { recursive: true })

    // Create a simple test file
    await writeFile(
      new URL('src/index.ts', fixtureDir),
      'export const test = "clean test"',
    )
  })

  it('should clean output directory by default', async () => {
    // Create some existing files in dist
    await mkdir(distDir, { recursive: true })
    await writeFile(new URL('old-file.js', distDir), 'old content')
    await writeFile(new URL('another-old.mjs', distDir), 'another old content')

    // Verify files exist before build
    const filesBefore = await readdir(distDir)
    expect(filesBefore).toContain('old-file.js')
    expect(filesBefore).toContain('another-old.mjs')

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
          clean: true, // Default behavior
        },
      ],
    })

    const filesAfter = await readdir(distDir)

    // Old files should be gone
    expect(filesAfter).not.toContain('old-file.js')
    expect(filesAfter).not.toContain('another-old.mjs')

    // New files should be present
    expect(filesAfter).toContain('index.mjs')
  })

  it('should not clean when clean is false', async () => {
    // Create some existing files in dist
    await mkdir(distDir, { recursive: true })
    await writeFile(new URL('keep-this.js', distDir), 'keep this content')

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
          outDir: 'dist',
          clean: false,
        },
      ],
    })

    const filesAfter = await readdir(distDir)

    // Old file should still be there
    expect(filesAfter).toContain('keep-this.js')

    // New file should also be there
    expect(filesAfter).toContain('index.mjs')
  })

  it('should clean specific paths when clean is array', async () => {
    // Create directory structure
    await mkdir(new URL('dist/lib/', fixtureDir), { recursive: true })
    await mkdir(new URL('dist/types/', fixtureDir), { recursive: true })
    await mkdir(new URL('dist/assets/', fixtureDir), { recursive: true })

    // Create files in different directories
    await writeFile(new URL('dist/lib/old.js', fixtureDir), 'old lib')
    await writeFile(new URL('dist/types/old.d.ts', fixtureDir), 'old types')
    await writeFile(new URL('dist/assets/keep.css', fixtureDir), 'keep this')

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
          clean: ['dist/lib', 'dist/types'], // Only clean these paths
          outDir: 'dist',
        },
      ],
    })

    // lib and types should be cleaned
    const libExists = await access(new URL('dist/lib/old.js', fixtureDir)).then(() => true).catch(() => false)
    const typesExists = await access(new URL('dist/types/old.d.ts', fixtureDir)).then(() => true).catch(() => false)

    expect(libExists).toBe(false)
    expect(typesExists).toBe(false)

    // assets should be kept
    const assetsExists = await access(new URL('dist/assets/keep.css', fixtureDir)).then(() => true).catch(() => false)
    expect(assetsExists).toBe(true)

    // New build files should be present
    const distFiles = await readdir(distDir)
    expect(distFiles).toContain('index.mjs')
  })

  it('should handle non-existent directories gracefully', async () => {
    // Remove dist directory completely
    await rm(distDir, { recursive: true, force: true })

    // Should not throw error when trying to clean non-existent directory
    await expect(build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
          clean: true,
        },
      ],
    })).resolves.not.toThrow()

    // Should create directory and build files
    const distFiles = await readdir(distDir)
    expect(distFiles).toContain('index.mjs')
  })

  it('should clean before each build in multi-entry scenario', async () => {
    // Create existing files
    await mkdir(new URL('dist/entry1/', fixtureDir), { recursive: true })
    await mkdir(new URL('dist/entry2/', fixtureDir), { recursive: true })
    await writeFile(new URL('dist/entry1/old.js', fixtureDir), 'old')
    await writeFile(new URL('dist/entry2/old.js', fixtureDir), 'old')

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
          clean: true,
          outDir: 'dist/entry1',
        },
        {
          type: 'bundle',
          input: 'src/index.ts',
          format: 'esm',
          clean: true,
          outDir: 'dist/entry2',
        },
      ],
    })

    // Both directories should be cleaned and have new files
    const entry1Files = await readdir(new URL('dist/entry1/', fixtureDir))
    const entry2Files = await readdir(new URL('dist/entry2/', fixtureDir))

    expect(entry1Files).not.toContain('old.js')
    expect(entry2Files).not.toContain('old.js')
    expect(entry1Files).toContain('index.mjs')
    expect(entry2Files).toContain('index.mjs')
  })

  it('should work with transform entries', async () => {
    // Create transform source
    await mkdir(new URL('src/runtime/', fixtureDir), { recursive: true })
    await writeFile(new URL('src/runtime/test.ts', fixtureDir), 'export const runtime = true')

    // Create existing files in transform output
    await mkdir(new URL('dist/runtime/', fixtureDir), { recursive: true })
    await writeFile(new URL('dist/runtime/old.mjs', fixtureDir), 'old runtime')

    await build({
      cwd: fixtureDir,
      entries: [
        {
          type: 'transform',
          input: 'src/runtime',
          outDir: 'dist/runtime',
          clean: true,
        },
      ],
    })

    const runtimeFiles = await readdir(new URL('dist/runtime/', fixtureDir))

    // Old file should be gone
    expect(runtimeFiles).not.toContain('old.mjs')

    // New file should be present
    expect(runtimeFiles).toContain('test.mjs')
  })
})
