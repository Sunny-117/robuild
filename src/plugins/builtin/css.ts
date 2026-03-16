import type { Plugin } from 'rolldown'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'

/**
 * Built-in CSS plugin for robuild.
 *
 * Since rolldown 1.0.0-rc.9 removed experimental CSS bundling support,
 * this plugin handles CSS files by:
 * 1. Intercepting CSS file resolution and loading them as empty JS modules
 * 2. Tracking the importer chain to assign CSS to the correct output chunk
 * 3. Emitting CSS asset files in generateBundle
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

  // Map from CSS absolute id -> CSS content
  const cssMap = new Map<string, string>()
  // Map from CSS absolute id -> Set of importer absolute ids
  const cssImporters = new Map<string, Set<string>>()

  return {
    name: 'robuild:css',

    resolveId(id, importer) {
      // Track CSS imports to know which JS file imported which CSS
      if (importer && id.endsWith('.css')) {
        const resolved = resolve(dirname(importer), id)
        if (!cssImporters.has(resolved)) {
          cssImporters.set(resolved, new Set())
        }
        cssImporters.get(resolved)!.add(importer)
      }
      return null
    },

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
      return { code: '', moduleType: 'js' as const }
    },

    generateBundle(_outputOptions, bundle) {
      if (cssMap.size === 0) return

      if (!splitting) {
        // Merge all CSS into a single file
        const allCss = [...cssMap.values()].join('\n')
        if (allCss.trim()) {
          this.emitFile({
            type: 'asset',
            fileName,
            source: allCss,
          })
        }
        return
      }

      // splitting: true
      // For each entry chunk, figure out which CSS files belong to it.
      // We use the cssImporters map to trace the import chain back to entries.
      const chunks = Object.values(bundle).filter(c => c.type === 'chunk') as Array<{
        type: 'chunk'
        fileName: string
        isEntry: boolean
        moduleIds: readonly string[]
        facadeModuleId: string | null
        imports: string[]
        dynamicImports: string[]
      }>

      // Build set of all module ids per chunk for quick lookup
      const chunkModuleIds = new Map<string, Set<string>>()
      for (const chunk of chunks) {
        chunkModuleIds.set(chunk.fileName, new Set(chunk.moduleIds))
      }

      // For each CSS file, find which entry chunks can reach it via importers
      // by walking up the importer chain
      function findOwnerChunks(cssId: string): string[] {
        const importers = cssImporters.get(cssId)
        if (!importers || importers.size === 0) {
          // No importer tracked; assign to all entry chunks
          return chunks.filter(c => c.isEntry).map(c => c.fileName)
        }

        const ownerChunks = new Set<string>()
        for (const [chunkFileName, moduleIds] of chunkModuleIds) {
          for (const importerId of importers) {
            if (moduleIds.has(importerId)) {
              ownerChunks.add(chunkFileName)
            }
          }
        }

        // If no chunk claims this CSS, assign to all entry chunks
        if (ownerChunks.size === 0) {
          return chunks.filter(c => c.isEntry).map(c => c.fileName)
        }

        return [...ownerChunks]
      }

      // Group CSS by owner chunk
      const chunkCssMap = new Map<string, string[]>()
      for (const [cssId, cssContent] of cssMap) {
        const ownerChunks = findOwnerChunks(cssId)
        for (const chunkFileName of ownerChunks) {
          if (!chunkCssMap.has(chunkFileName)) {
            chunkCssMap.set(chunkFileName, [])
          }
          chunkCssMap.get(chunkFileName)!.push(cssContent)
        }
      }

      // Emit CSS assets
      for (const [chunkFileName, cssList] of chunkCssMap) {
        const cssContent = cssList.join('\n')
        if (!cssContent.trim()) continue
        const cssFileName = chunkFileName.replace(/\.(m?js|cjs)$/, '.css')
        this.emitFile({
          type: 'asset',
          fileName: cssFileName,
          source: cssContent,
        })
      }
    },
  }
}

