import type { ChunkAddon, OutputFormat } from '../types'

/**
 * Resolve banner/footer addon for specific format
 */
export function resolveChunkAddon(
  addon: string | ChunkAddon | undefined,
  format: OutputFormat,
): string | undefined {
  if (!addon) {
    return undefined
  }

  if (typeof addon === 'string') {
    return addon
  }

  // Handle format-specific addons
  const formatKey = format === 'esm' ? 'js' : format
  return addon[formatKey] || addon.js
}

/**
 * Add banner to content
 */
export function addBanner(content: string, banner?: string): string {
  if (!banner) {
    return content
  }
  return `${banner}\n${content}`
}

/**
 * Add footer to content
 */
export function addFooter(content: string, footer?: string): string {
  if (!footer) {
    return content
  }
  return `${content}\n${footer}`
}

/**
 * Add both banner and footer to content
 */
export function addBannerFooter(
  content: string,
  banner?: string,
  footer?: string,
): string {
  let result = content
  result = addBanner(result, banner)
  result = addFooter(result, footer)
  return result
}
