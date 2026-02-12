import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { consola } from 'consola'
import { fmtPath } from '../utils'

/**
 * Clean output directory or specific paths.
 * Used by both bundle and transform builders.
 *
 * @param projectRoot - The project root directory
 * @param outDir - The output directory to clean
 * @param cleanPaths - true to clean outDir, or array of specific paths to clean
 */
export async function cleanOutputDir(
  projectRoot: string,
  outDir: string,
  cleanPaths?: boolean | string[],
): Promise<void> {
  if (!cleanPaths)
    return

  if (cleanPaths === true) {
    // Clean the entire output directory
    if (existsSync(outDir)) {
      consola.log(`🧻 Cleaning up ${fmtPath(outDir)}`)
      await rm(outDir, { recursive: true, force: true })
    }
  }
  else if (Array.isArray(cleanPaths)) {
    // Clean specific paths relative to project root
    for (const path of cleanPaths) {
      const fullPath = resolve(projectRoot, path)
      if (existsSync(fullPath)) {
        consola.log(`🧻 Cleaning up ${fmtPath(fullPath)}`)
        await rm(fullPath, { recursive: true, force: true })
      }
    }
  }
}
