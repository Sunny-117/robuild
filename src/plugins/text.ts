import type { RobuildPlugin } from '../types'
import { logger } from '../features/logger'

/**
 * Built-in plugin for text file imports
 */
export function textPlugin(extensions: string[] = ['.txt', '.md']): RobuildPlugin {
  return {
    name: 'text',
    load: async (id: string) => {
      if (extensions.some(ext => id.endsWith(ext))) {
        try {
          const { readFile } = await import('node:fs/promises')
          const content = await readFile(id, 'utf-8')
          return `export default ${JSON.stringify(content)}`
        }
        catch (error) {
          logger.error(`Failed to load text file ${id}:`, error)
          return null
        }
      }
      return null
    },
  }
}
