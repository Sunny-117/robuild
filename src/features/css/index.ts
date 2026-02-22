/**
 * CSS processing configuration options for robuild.
 *
 * Provides control over how CSS files are bundled and output.
 */
export interface CssOptions {
  /**
   * Enable/disable CSS code splitting.
   *
   * When set to `false`, all CSS in the entire project will be extracted into a single CSS file.
   * When set to `true`, CSS imported in async JS chunks will be preserved as separate chunks.
   *
   * @default true
   */
  splitting?: boolean

  /**
   * Specify the name of the combined CSS file when splitting is disabled.
   *
   * @default 'style.css'
   */
  fileName?: string

  /**
   * Enable LightningCSS for CSS minification and transformation.
   *
   * LightningCSS provides modern CSS processing with automatic vendor prefixing
   * and syntax lowering based on the target browsers.
   *
   * Requires `unplugin-lightningcss` to be installed as a peer dependency.
   *
   * @default false
   */
  lightningcss?: boolean
}

/**
 * Default CSS bundle file name when splitting is disabled.
 */
export const defaultCssBundleName = 'style.css'

/**
 * Resolve CSS options with defaults.
 */
export function resolveCssOptions(
  options: CssOptions = {},
): Required<CssOptions> {
  return {
    splitting: options.splitting ?? true,
    fileName: options.fileName ?? defaultCssBundleName,
    lightningcss: options.lightningcss ?? false,
  }
}
