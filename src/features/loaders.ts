import type { LoaderConfig, LoaderType, RobuildPlugin } from '../types'
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'

/**
 * Default loader mappings for common file extensions
 */
export const DEFAULT_LOADERS: Record<string, LoaderType> = {
  '.js': 'js',
  '.mjs': 'js',
  '.cjs': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.mts': 'ts',
  '.cts': 'ts',
  '.tsx': 'tsx',
  '.json': 'json',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.less': 'css',
  '.styl': 'css',
  '.txt': 'text',
  '.md': 'text',
  '.html': 'text',
  '.xml': 'text',
  '.svg': 'text',
  '.png': 'file',
  '.jpg': 'file',
  '.jpeg': 'file',
  '.gif': 'file',
  '.webp': 'file',
  '.ico': 'file',
  '.woff': 'file',
  '.woff2': 'file',
  '.ttf': 'file',
  '.eot': 'file',
  '.mp4': 'file',
  '.webm': 'file',
  '.wav': 'file',
  '.mp3': 'file',
  '.flac': 'file',
  '.aac': 'file',
  '.zip': 'binary',
  '.tar': 'binary',
  '.gz': 'binary',
  '.br': 'binary',
}

/**
 * Get loader type for a file based on its extension
 */
export function getLoaderForFile(filePath: string, loaders?: Record<string, LoaderConfig>): LoaderType {
  const ext = extname(filePath).toLowerCase()

  // Check custom loaders first
  if (loaders?.[ext]) {
    return loaders[ext].loader
  }

  // Fall back to default loaders
  return DEFAULT_LOADERS[ext] || 'file'
}

/**
 * Transform file content based on loader type
 */
export async function transformWithLoader(
  filePath: string,
  content: string,
  loader: LoaderType,
  options?: Record<string, any>,
): Promise<string> {
  switch (loader) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      // JavaScript/TypeScript files are handled by the main transform pipeline
      return content

    case 'json':
      // Parse and re-stringify to ensure valid JSON
      try {
        const parsed = JSON.parse(content)
        return `export default ${JSON.stringify(parsed)}`
      }
      catch {
        // If parsing fails, treat as text
        return `export default ${JSON.stringify(content)}`
      }

    case 'css':
      return transformCssContent(content, options)

    case 'text':
      return `export default ${JSON.stringify(content)}`

    case 'file':
      return transformFileContent(filePath, options)

    case 'dataurl':
      return transformDataUrlContent(filePath, content, options)

    case 'binary':
      return transformBinaryContent(filePath, options)

    case 'empty':
      return 'export default {}'

    default:
      throw new Error(`Unknown loader type: ${loader}`)
  }
}

/**
 * Transform CSS content
 */
function transformCssContent(content: string, options?: Record<string, any>): string {
  if (options?.modules) {
    // CSS Modules support (simplified)
    const classNames = extractCssClassNames(content)
    const moduleExports = classNames.reduce((acc, className) => {
      acc[className] = className
      return acc
    }, {} as Record<string, string>)

    return `export default ${JSON.stringify(moduleExports)}`
  }

  // Regular CSS as string
  return `export default ${JSON.stringify(content)}`
}

/**
 * Transform file content to URL
 */
function transformFileContent(filePath: string, options?: Record<string, any>): string {
  const publicPath = options?.publicPath || '/'
  const fileName = filePath.split('/').pop() || 'file'
  const url = `${publicPath}${fileName}`

  return `export default ${JSON.stringify(url)}`
}

/**
 * Transform file content to data URL
 */
function transformDataUrlContent(filePath: string, content: string, _options?: Record<string, any>): string {
  const ext = extname(filePath).toLowerCase()
  const mimeType = getMimeType(ext)
  const base64 = Buffer.from(content).toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64}`

  return `export default ${JSON.stringify(dataUrl)}`
}

/**
 * Transform binary file content
 */
function transformBinaryContent(filePath: string, _options?: Record<string, any>): string {
  // For binary files, we typically return the file path or a placeholder
  const fileName = filePath.split('/').pop() || 'binary'
  return `export default ${JSON.stringify(fileName)}`
}

/**
 * Extract CSS class names (simplified implementation)
 */
function extractCssClassNames(content: string): string[] {
  const classRegex = /\.([a-z_-][\w-]*)/gi
  const matches = content.match(classRegex) || []
  return Array.from(new Set(matches.map(match => match.slice(1))))
}

/**
 * Get MIME type for file extension
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.xml': 'application/xml',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
  }

  return mimeTypes[ext] || 'application/octet-stream'
}

/**
 * Create a loader plugin for robuild
 */
export function createLoaderPlugin(loaders?: Record<string, LoaderConfig>): RobuildPlugin {
  return {
    name: 'loaders',
    load: async (id: string) => {
      const ext = extname(id)
      const loader = getLoaderForFile(id, loaders)

      // Only handle non-JS files with custom loaders
      if (loader === 'js' || loader === 'jsx' || loader === 'ts' || loader === 'tsx') {
        return null
      }

      // Skip JSON files unless explicitly configured - let rolldown handle them natively
      if (loader === 'json' && !loaders?.[ext]) {
        return null
      }

      try {
        const content = await readFile(id, 'utf-8')
        const options = loaders?.[ext]?.options
        return await transformWithLoader(id, content, loader, options)
      }
      catch {
        // If file doesn't exist or can't be read, let other plugins handle it
        return null
      }
    },
  }
}

/**
 * Get default loader configuration
 */
export function getDefaultLoaderConfig(): Record<string, LoaderConfig> {
  const config: Record<string, LoaderConfig> = {}

  for (const [ext, loader] of Object.entries(DEFAULT_LOADERS)) {
    config[ext] = { loader }
  }

  return config
}

/**
 * Merge loader configurations
 */
export function mergeLoaderConfigs(
  base: Record<string, LoaderConfig>,
  override: Record<string, LoaderConfig>,
): Record<string, LoaderConfig> {
  return {
    ...base,
    ...override,
  }
}
