import type { TestContext } from 'vitest'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Recursively get all files in a directory
 */
export async function getAllFiles(dir: string, basePath = ''): Promise<string[]> {
  if (!existsSync(dir)) {
    return []
  }

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

/**
 * Get file extension for syntax highlighting
 */
function getLanguage(filename: string): string {
  const ext = path.extname(filename).slice(1)
  const langMap: Record<string, string> = {
    mjs: 'js',
    cjs: 'js',
    mts: 'ts',
    cts: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    json: 'json',
    md: 'md',
    css: 'css',
    html: 'html',
  }
  return langMap[ext] || ext || 'txt'
}

/**
 * Create a snapshot of all files in a directory
 */
export async function createSnapshot(
  dir: string,
  options: {
    pattern?: RegExp
    exclude?: RegExp[]
  } = {},
): Promise<{
  files: string[]
  snapshot: string
  fileMap: Record<string, string>
}> {
  const files = await getAllFiles(dir)
  const fileMap: Record<string, string> = {}
  const snapshotParts: string[] = []

  // Filter files
  let filteredFiles = files.sort()
  if (options.pattern) {
    filteredFiles = filteredFiles.filter(f => options.pattern!.test(f))
  }
  if (options.exclude) {
    filteredFiles = filteredFiles.filter(f =>
      !options.exclude!.some(pattern => pattern.test(f)),
    )
  }

  for (const file of filteredFiles) {
    const filePath = path.resolve(dir, file)
    const content = await readFile(filePath, 'utf8')
    fileMap[file] = content

    const lang = getLanguage(file)

    snapshotParts.push(`## ${file}`)
    snapshotParts.push('')
    snapshotParts.push(`\`\`\`${lang}`)
    snapshotParts.push(content.trimEnd())
    snapshotParts.push('```')
    snapshotParts.push('')
  }

  const snapshot = snapshotParts.join('\n')

  return {
    files: filteredFiles,
    snapshot,
    fileMap,
  }
}

/**
 * Assert snapshot matches expected output
 */
export async function expectSnapshot(
  context: TestContext,
  dir: string,
  snapshotPath: string,
  options: {
    pattern?: RegExp
    exclude?: RegExp[]
  } = {},
): Promise<{
  files: string[]
  snapshot: string
  fileMap: Record<string, string>
}> {
  const { expect } = context
  const result = await createSnapshot(dir, options)

  // Write snapshot file
  await mkdir(path.dirname(snapshotPath), { recursive: true })
  await writeFile(snapshotPath, result.snapshot, 'utf8')

  // Assert snapshot matches
  await expect(result.snapshot).toMatchFileSnapshot(snapshotPath)

  return result
}
