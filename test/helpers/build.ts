import type { TestContext } from 'vitest'
import type { BuildConfig } from '../../src/types'
import path from 'node:path'
import process from 'node:process'
import { build } from '../../src/build'
import { cleanTestDir, getTestDir, writeFixtures } from './fixtures'
import { expectSnapshot } from './snapshot'

/**
 * Change working directory temporarily
 */
export function chdir(dir: string): () => void {
  const oldCwd = process.cwd()
  process.chdir(dir)
  return (): void => process.chdir(oldCwd)
}

export interface TestBuildOptions {
  context: TestContext

  /**
   * The files to write to the test directory.
   * One of `files` or `fixture` must be provided.
   */
  files?: Record<string, string>

  /**
   * The directory name under `test/fixtures` to use as a fixture.
   * One of `files` or `fixture` must be provided.
   */
  fixture?: string

  /**
   * The build configuration
   */
  config?: BuildConfig | ((cwd: string) => BuildConfig)

  /**
   * The working directory of the test (relative to test directory)
   * @default '.'
   */
  cwd?: string

  /**
   * The output directory to snapshot (relative to working directory)
   * @default 'dist'
   */
  outDir?: string

  /**
   * Pattern to filter snapshot files
   */
  snapshotPattern?: RegExp

  /**
   * Patterns to exclude from snapshot
   */
  snapshotExclude?: RegExp[]

  /**
   * Hook to run before build
   */
  beforeBuild?: (testDir: string) => Promise<void>

  /**
   * Hook to run after build
   */
  afterBuild?: (outputDir: string) => Promise<void>

  /**
   * Whether to clean test directory before running
   * @default true
   */
  clean?: boolean
}

export interface TestBuildResult {
  testName: string
  testDir: string
  workingDir: string
  outputDir: string
  files: string[]
  snapshot: string
  fileMap: Record<string, string>
}

/**
 * Test build with snapshot assertion
 */
export async function testBuild(options: TestBuildOptions): Promise<TestBuildResult> {
  const {
    context,
    files,
    fixture,
    config,
    cwd = '.',
    outDir = 'dist',
    snapshotPattern,
    snapshotExclude,
    beforeBuild,
    afterBuild,
    clean = true,
  } = options

  // Clean test directory
  if (clean) {
    await cleanTestDir(context.task)
  }

  // Write fixtures
  const { testName, testDir } = await writeFixtures(context, files, fixture)

  // Resolve working directory
  const workingDir = path.join(testDir, cwd)
  const restoreCwd = chdir(workingDir)

  try {
    // Resolve build config
    const resolvedConfig: BuildConfig = {
      cwd: workingDir,
      entries: ['index.ts'],
      ...(typeof config === 'function' ? config(workingDir) : config),
    }

    // Ensure DTS is disabled by default unless explicitly enabled
    if (resolvedConfig.entries) {
      resolvedConfig.entries = resolvedConfig.entries.map((entry: any) => {
        if (typeof entry === 'string')
          return entry
        if (entry.type === 'bundle' && entry.dts === undefined) {
          return { ...entry, dts: false }
        }
        return entry
      })
    }

    // Run before build hook
    await beforeBuild?.(testDir)

    // Build
    await build(resolvedConfig)

    // Resolve output directory
    const outputDir = path.resolve(workingDir, outDir)

    // Run after build hook
    await afterBuild?.(outputDir)

    // Create snapshot
    const result = await expectSnapshot(context, outputDir, {
      pattern: snapshotPattern,
      exclude: snapshotExclude,
    })

    return {
      testName,
      testDir,
      workingDir,
      outputDir,
      ...result,
    }
  }
  finally {
    restoreCwd()
  }
}
