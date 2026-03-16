import type { Plugin } from 'rolldown'
import { readFile } from 'node:fs/promises'

/**
 * Built-in CSS plugin for robuild.
 *
 * Since rolldown 1.0.0-rc.9 removed experimental CSS bundling support,
 * this plugin handles CSS files by:
 * 1. Loading CSS file content as text
 * 2. Collecting all CSS content
 * 3. Emitting a combined CSS asset file
 *
 * This allows CSS imports in JS/TS files to work without rolldown errors.
 */
export function createBuiltinCssPlugin(options: {
  /**
   * Output CSS file name (when splitting is disabled)
   * @default 'style.css'
   */
  fileName?: string
  /**
   * Enable CSS code splitting (each entry gets its own CSS file)
   * @default true
   */
  splitting?: boolean
} = {}): Plugin {
  const { fileName = 'style.css', splitting = true } = options
  const cssMap = new Map<string, string>()

  return {
    name: 'robuild:css',

    async load(id) {
      if (!id.endsWith('.css')) return null

      try {
        const content = await readFile(id, 'utf-8')
        cssMap.set(id, content)
      }
      catch {
        cssMap.set(id, '')
      }

      // Return an empty JS module so rolldown doesn't process CSS natively
      return { code: '', moduleType: 'js' }
    },

    generateBundle(_outputOptions, bundle) {
      if (cssMap.size === 0) return

      if (splitting) {
        // For each entry chunk, collect its CSS and emit a corresponding CSS file
        const chunks = Object.values(bundle)
        for (const chunk of chunks) {
          if (chunk.type !== 'chunk' || !chunk.isEntry) continue

          const chunkCss: string[] = []
          const visited = new Set<string>()

          function collectCss(moduleIds: readonly string[]) {
            for (const id of moduleIds) {
              if (visited.has(id)) continue
              visited.add(id)
              if (cssMap.has(id)) {
                chunkCss.push(cssMap.get(id)!)
              }
            }
          }

          collectCss(chunk.moduleIds)

          if (chunkCss.length > 0) {
            const cssContent = chunkCss.join('\n')
            const cssFileName = chunk.fileName.replace(/\.(m?js|cjs)$/, '.css')
            this.emitFile({
              type: 'asset',
              fileName: cssFileName,
              source: cssContent,
            })
          }
        }
      }
      else {
        // Merge all CSS into a single file
        const allCss = [...cssMap.values()].join('\n')
        if (allCss.trim()) {
          this.emitFile({
            type: 'asset',
            fileName,
            source: allCss,
          })
        }
      }
    },
  }
}
