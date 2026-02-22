import type { RunnerTask, TestContext } from 'vitest'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllFiles } from './snapshot'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.resolve(dirname, '../temp')
const fixturesDir = path.resolve(dirname, '../shared-fixtures')

/**
 * Convert test name to filesystem-safe filename
 */
function filenamify(input: string): string {
  return input.replace(/^\W+/, '').replaceAll(/\W+/g, '-')
}

/**
 * Get test filename from task
 */
function getTestFilename(task: RunnerTask): string {
  return (
    (task.suite ? `${filenamify(task.suite.name)}/` : '')
    + filenamify(task.name)
  )
}

/**
 * Get test directory path
 */
export function getTestDir(testName: RunnerTask | string): string {
  return path.resolve(
    tmpDir,
    typeof testName === 'string' ? testName : getTestFilename(testName),
  )
}

/**
 * Clean test directory
 */
export async function cleanTestDir(testName: RunnerTask | string): Promise<void> {
  const dir = getTestDir(testName)
  if (existsSync(dir)) {
    await rm(dir, { recursive: true, force: true })
  }
}

/**
 * Write fixture files to test directory
 */
export async function writeFixtures(
  context: TestContext,
  files?: Record<string, string | Buffer>,
  fixtureName?: string,
): Promise<{ testName: string, testDir: string }> {
  const testName = getTestFilename(context.task)
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
    // Support both string and Buffer content
    if (Buffer.isBuffer(content)) {
      await writeFile(filepath, content)
    }
    else {
      await writeFile(filepath, content, 'utf8')
    }
  }

  return { testName, testDir }
}
