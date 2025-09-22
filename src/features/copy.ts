import type { CopyOptions } from '../types'
import { cp } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { consola } from 'consola'

/**
 * Copy files to output directory
 */
export async function copyFiles(
  cwd: string,
  outDir: string,
  copyOptions: CopyOptions,
): Promise<void> {
  if (!copyOptions || copyOptions.length === 0) {
    return
  }

  consola.debug('📁 Copying files...')

  await Promise.all(
    copyOptions.map(async (entry) => {
      const from = typeof entry === 'string' ? entry : entry.from
      const to = typeof entry === 'string'
        ? resolve(outDir, basename(from))
        : resolve(cwd, entry.to)

      const fromPath = resolve(cwd, from)

      try {
        await cp(fromPath, to, {
          recursive: true,
          force: true,
        })
        consola.debug(`  ${from} → ${to}`)
      }
      catch (error) {
        consola.warn(`Failed to copy ${from} to ${to}:`, error)
      }
    }),
  )

  consola.debug('✅ Files copied successfully')
}
