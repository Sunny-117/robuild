import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { BuildResult, OnSuccessCallback } from '../types'
import { logger } from './logger'

const execAsync = promisify(exec)

/**
 * Execute onSuccess callback after successful build
 */
export async function executeOnSuccess(
  onSuccess: OnSuccessCallback | undefined,
  result: BuildResult,
  cwd: string,
): Promise<void> {
  if (!onSuccess) {
    return
  }

  try {
    if (typeof onSuccess === 'string') {
      // Execute command
      logger.verbose(`Executing onSuccess command: ${onSuccess}`)
      const { stdout, stderr } = await execAsync(onSuccess, { cwd })
      
      if (stdout) {
        logger.verbose(`onSuccess stdout: ${stdout.trim()}`)
      }
      if (stderr) {
        logger.warn(`onSuccess stderr: ${stderr.trim()}`)
      }
    } else {
      // Execute function
      logger.verbose('Executing onSuccess callback function')
      await onSuccess(result)
    }
    
    logger.verbose('onSuccess callback completed successfully')
  } catch (error) {
    logger.error('onSuccess callback failed:', error)
    throw error
  }
}

/**
 * Create build result object
 */
export function createBuildResult(
  entries: Array<{
    format: any
    name: string
    exports: string[]
    deps: string[]
    size: number
    gzipSize: number
    sideEffectSize: number
  }>,
  startTime: number,
): BuildResult {
  return {
    entries: entries.map(entry => ({
      ...entry,
      format: entry.format,
    })),
    duration: Date.now() - startTime,
  }
}
