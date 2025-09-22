import type { RunnerTask, TestContext } from 'vitest'
import type { BuildConfig } from '../src/types'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { build } from '../src/build'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.resolve(dirname, 'temp')
const snapshotsDir = path.resolve(dirname, '__snapshots__')
const fixturesDir = path.resolve(dirname, 'fixtures')

function getTestFilename(task: RunnerTask) {
  return (
    (task.suite ? `${filenamify(task.suite.name)}/` : '')
    + filenamify(task.name)
  )
}

export function getTestDir(testName: RunnerTask | string): string {
  return path.resolve(
    tmpDir,
    typeof testName === 'string' ? testName : getTestFilename(testName),
  )
}

export async function writeFixtures(
  { task }: TestContext,
  files?: Record<string, string>,
  fixtureName?: string,
): Promise<{ testName: string, testDir: string }> {
  const testName = getTestFilename(task)
  const testDir = getTestDir(testName)
  await mkdir(testDir, { recursive: true })

  if (files && fixtureName) {
    throw new Error('Cannot provide both `files` and `fixtureName`')
  }

  if (fixtureName) {
    const fixtureDir = path.resolve(fixturesDir, fixtureName)
    const filePaths = await getAllFiles(fixtureDir)
    files = Object.fromEntries(
      await Promise.all(
        filePaths.map(async (filePath) => {
          const absoluteFilePath = path.resolve(fixtureDir, filePath)
          const content = await readFile(absoluteFilePath, 'utf8')
          return [filePath, content]
        }),
      ),
    )
  }

  if (!files) {
    throw new Error('Either `files` or `fixtureName` must be provided')
  }

  for (const [filename, content] of Object.entries(files)) {
    const filepath = path.resolve(testDir, filename)
    await mkdir(path.dirname(filepath), { recursive: true })
    await writeFile(filepath, content, 'utf8')
  }

  return { testName, testDir }
}

export interface TestBuildOptions {
  context: TestContext

  /**
   * The files to write to the test directory.
   *
   * One of `files` or `fixtureName` must be provided.
   */
  files?: Record<string, string>

  /**
   * The directory name under `test/fixtures` to use as a fixture.
   *
   * One of `files` or `fixtureName` must be provided.
   */
  fixture?: string

  /**
   * The options for the build.
   */
  options?: BuildConfig | ((cwd: string) => BuildConfig)

  /**
   * The working directory of the test. It's a relative path to the test directory.
   *
   * @default '.'
   */
  cwd?: string

  /**
   * A function that will be called before the build.
   */
  beforeBuild?: () => Promise<void>

  expectDir?: string
  expectPattern?: string
}

export async function testBuild({
  context,
  files,
  fixture,
  options,
  cwd,
  expectDir = 'dist',
  expectPattern,
  beforeBuild,
}: TestBuildOptions): Promise<{
  testName: string
  testDir: string
  outputFiles: string[]
  outputDir: string
  snapshot: string
  fileMap: Record<string, string>
}> {
  const { expect } = context
  const { testName, testDir } = await writeFixtures(context, files, fixture)

  const workingDir = path.join(testDir, cwd || '.')
  const restoreCwd = chdir(workingDir)

  const resolvedOptions: BuildConfig = {
    cwd: workingDir,
    entries: ['index.ts'],
    ...(typeof options === 'function' ? options(workingDir) : options),
  }

  // Ensure DTS is disabled by default unless explicitly enabled
  if (resolvedOptions.entries) {
    resolvedOptions.entries = resolvedOptions.entries.map((entry: any) => {
      if (typeof entry === 'string')
        return entry
      if (entry.type === 'bundle' && entry.dts === undefined) {
        return { ...entry, dts: false }
      }
      return entry
    })
  }

  await beforeBuild?.()
  await build(resolvedOptions)
  restoreCwd()

  const outputDir = path.resolve(workingDir, expectDir)
  const {
    files: outputFiles,
    snapshot,
    fileMap,
  } = await expectFilesSnapshot(
    outputDir,
    path.resolve(snapshotsDir, `${testName}.snap.md`),
    { pattern: expectPattern, expect },
  )

  return {
    testName,
    testDir,
    outputFiles,
    outputDir,
    snapshot,
    fileMap,
  }
}

function filenamify(input: string) {
  return input.replace(/^\W+/, '').replaceAll(/\W+/g, '-')
}

export function chdir(dir: string) {
  const oldCwd = process.cwd()
  process.chdir(dir)
  return (): void => process.chdir(oldCwd)
}

// Helper function to get all files recursively
async function getAllFiles(dir: string, basePath = ''): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.join(basePath, entry.name)

    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath, relativePath)
      files.push(...subFiles)
    }
    else if (entry.isFile()) {
      files.push(relativePath)
    }
  }

  return files
}

// Simple implementation of expectFilesSnapshot
export async function expectFilesSnapshot(
  dir: string,
  snapshotPath: string,
  options: { pattern?: string, expect: any },
): Promise<{
  files: string[]
  snapshot: string
  fileMap: Record<string, string>
}> {
  const { expect } = options

  const files = await getAllFiles(dir)

  const fileMap: Record<string, string> = {}
  const snapshotParts: string[] = []

  for (const file of files.sort()) {
    const filePath = path.resolve(dir, file)
    const content = await readFile(filePath, 'utf8')
    fileMap[file] = content

    // Determine file extension for syntax highlighting
    const ext = path.extname(file).slice(1) || 'txt'
    const lang = ext === 'mjs' ? 'js' : ext === 'cjs' ? 'js' : ext === 'mts' ? 'ts' : ext === 'cts' ? 'ts' : ext

    snapshotParts.push(`## ${file}`)
    snapshotParts.push('')
    snapshotParts.push(`\`\`\`${lang}`)
    snapshotParts.push(content)
    snapshotParts.push('```')
    snapshotParts.push('')
  }

  const snapshot = snapshotParts.join('\n')

  // Write snapshot file
  await mkdir(path.dirname(snapshotPath), { recursive: true })
  await writeFile(snapshotPath, snapshot, 'utf8')

  await expect(snapshot).toMatchFileSnapshot(snapshotPath)

  return {
    files,
    snapshot,
    fileMap,
  }
}
