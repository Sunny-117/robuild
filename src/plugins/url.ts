import type { RobuildPlugin } from '../types'

/**
 * Built-in plugin for URL imports (assets)
 */
export function urlPlugin(extensions: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']): RobuildPlugin {
  return {
    name: 'url',
    load: async (id: string) => {
      if (extensions.some(ext => id.endsWith(ext))) {
        // In a real implementation, you might copy the file to output directory
        // and return the public URL
        const { basename } = await import('node:path')
        const filename = basename(id)
        return `export default "./${filename}"`
      }
      return null
    },
  }
}
