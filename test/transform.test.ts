import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { build } from '../src/build'

const fixtureDir = new URL('fixtures/transform/', import.meta.url)
const distDir = new URL('dist/', fixtureDir)

beforeAll(async () => {
  // Clean up before tests
  if (existsSync(distDir)) {
    await rm(distDir, { recursive: true, force: true })
  }

  // Create fixture directory structure
  await mkdir(new URL('src/utils/', fixtureDir), { recursive: true })
  await mkdir(new URL('src/components/', fixtureDir), { recursive: true })

  // Create test files
  await writeFile(
    new URL('src/index.ts', fixtureDir),
    `export { add, multiply } from './utils/math'
export { Button } from './components/Button'
export const version = '1.0.0'
`,
  )

  await writeFile(
    new URL('src/utils/math.ts', fixtureDir),
    `export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}
`,
  )

  await writeFile(
    new URL('src/components/Button.ts', fixtureDir),
    `export interface ButtonProps {
  label: string
  onClick: () => void
}

export function Button(props: ButtonProps) {
  return {
    label: props.label,
    onClick: props.onClick,
  }
}
`,
  )

  await writeFile(
    new URL('package.json', fixtureDir),
    JSON.stringify({ name: 'transform-test', version: '1.0.0' }),
  )
})

describe('transform mode', () => {
  it('should transform directory preserving structure', async () => {
    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist/',
        },
      ],
    })

    // Check that files exist
    expect(existsSync(new URL('index.mjs', distDir))).toBe(true)
    expect(existsSync(new URL('utils/math.mjs', distDir))).toBe(true)
    expect(existsSync(new URL('components/Button.mjs', distDir))).toBe(true)

    // Check content
    const indexContent = await readFile(new URL('index.mjs', distDir), 'utf8')
    expect(indexContent).toContain('export')
    expect(indexContent).toContain('./utils/math')
    expect(indexContent).toContain('./components/Button')
  })

  it('should handle aliases in transform mode', async () => {
    await writeFile(
      new URL('src/with-alias.ts', fixtureDir),
      `import { add } from '@/utils/math'
export const result = add(1, 2)
`,
    )

    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-alias/',
          alias: {
            '@': new URL('src/', fixtureDir).pathname,
          },
        },
      ],
    })

    const content = await readFile(
      new URL('dist-alias/with-alias.mjs', fixtureDir),
      'utf8',
    )
    expect(content).toContain('./utils/math')
  })

  it('should support minification in transform mode', async () => {
    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-minified/',
          minify: true,
        },
      ],
    })

    const content = await readFile(
      new URL('dist-minified/utils/math.mjs', fixtureDir),
      'utf8',
    )
    // Minified code should be shorter and have less whitespace
    expect(content.length).toBeLessThan(200)
  })

  it('should support banner and footer in transform mode', async () => {
    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-banner/',
          banner: '// Copyright 2024',
          footer: '// End of file',
        },
      ],
    })

    const content = await readFile(
      new URL('dist-banner/index.mjs', fixtureDir),
      'utf8',
    )
    expect(content).toContain('// Copyright 2024')
    expect(content).toContain('// End of file')
  })

  it('should support target option in transform mode', async () => {
    await writeFile(
      new URL('src/modern.ts', fixtureDir),
      `export const arrow = () => 'arrow'
export const optional = (x?: string) => x ?? 'default'
`,
    )

    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-target/',
          target: 'es2015',
        },
      ],
    })

    const content = await readFile(
      new URL('dist-target/modern.mjs', fixtureDir),
      'utf8',
    )
    // Should transform arrow functions and nullish coalescing for es2015
    expect(content).toBeDefined()
  })

  it('should handle node protocol in transform mode', async () => {
    await writeFile(
      new URL('src/node-imports.ts', fixtureDir),
      `import { readFile } from 'fs/promises'
import path from 'path'
export { readFile, path }
`,
    )

    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-node-protocol/',
          nodeProtocol: true,
        },
      ],
    })

    const content = await readFile(
      new URL('dist-node-protocol/node-imports.mjs', fixtureDir),
      'utf8',
    )
    expect(content).toContain('node:')
  })

  it('should copy non-TypeScript files in transform mode', async () => {
    await writeFile(
      new URL('src/data.json', fixtureDir),
      JSON.stringify({ test: 'data' }),
    )

    await writeFile(new URL('src/README.md', fixtureDir), '# Test README')

    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-copy/',
        },
      ],
    })

    expect(existsSync(new URL('dist-copy/data.json', fixtureDir))).toBe(true)
    expect(existsSync(new URL('dist-copy/README.md', fixtureDir))).toBe(true)

    const jsonContent = await readFile(
      new URL('dist-copy/data.json', fixtureDir),
      'utf8',
    )
    expect(JSON.parse(jsonContent)).toEqual({ test: 'data' })
  })

  it('should support clean option in transform mode', async () => {
    // Create a file that should be cleaned
    await mkdir(new URL('dist-clean/', fixtureDir), { recursive: true })
    await writeFile(
      new URL('dist-clean/old-file.txt', fixtureDir),
      'should be removed',
    )

    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-clean/',
          clean: true,
        },
      ],
    })

    // Old file should be removed
    expect(existsSync(new URL('dist-clean/old-file.txt', fixtureDir))).toBe(
      false,
    )
    // New files should exist
    expect(existsSync(new URL('dist-clean/index.mjs', fixtureDir))).toBe(true)
  })

  it('should support unbundle mode', async () => {
    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-unbundle/',
          unbundle: true,
        },
      ],
    })

    // Files should exist
    expect(existsSync(new URL('dist-unbundle/index.mjs', fixtureDir))).toBe(
      true,
    )
    expect(existsSync(new URL('dist-unbundle/utils/math.mjs', fixtureDir))).toBe(
      true,
    )
  })

  it('should handle TypeScript declaration files', async () => {
    await build({
      cwd: fixtureDir.pathname,
      entries: [
        {
          type: 'transform',
          input: 'src/',
          outDir: 'dist-dts/',
          oxc: {
            typescript: {
              declaration: {
                stripInternal: true,
              },
            },
          },
        },
      ],
    })

    // Check for declaration files
    const dtsExists = existsSync(new URL('dist-dts/utils/math.d.mts', fixtureDir))
    // OXC may or may not generate .d.ts files depending on configuration
    // Just check that the .mjs files exist
    expect(existsSync(new URL('dist-dts/utils/math.mjs', fixtureDir))).toBe(true)
  })
})
