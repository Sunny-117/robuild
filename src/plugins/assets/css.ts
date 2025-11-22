import type { RobuildPlugin } from '../../types'

/**
 * Built-in plugin for CSS imports
 */
export function cssPlugin(): RobuildPlugin {
  return {
    name: 'css',
    load: async (id: string) => {
      if (id.endsWith('.css')) {
        try {
          const { readFile } = await import('node:fs/promises')
          const content = await readFile(id, 'utf-8')
          // Simple CSS-in-JS transformation
          return `
const css = ${JSON.stringify(content)};
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}
export default css;
`
        }
        catch (error) {
          console.error(`Failed to load CSS file ${id}:`, error)
          return null
        }
      }
      return null
    },
  }
}
