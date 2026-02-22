/// <reference path="../../types/lightningcss.d.ts" />
import type { Plugin } from 'rolldown'
import type { Target } from '../../types'
import { esbuildTargetToLightningCSS } from '../../utils/lightningcss'

export interface LightningCSSPluginOptions {
  /**
   * Target browsers for CSS transformation.
   * Uses esbuild-style target format (e.g., ['chrome90', 'firefox88']).
   */
  target?: Target | string[]
}

/**
 * Create a LightningCSS plugin for CSS minification and transformation.
 *
 * Uses `unplugin-lightningcss` for modern CSS processing with:
 * - Automatic vendor prefixing
 * - Syntax lowering based on target browsers
 * - Minification
 *
 * @param options - Plugin options
 * @returns Rolldown plugin or undefined if unplugin-lightningcss is not installed
 */
export async function createLightningCSSPlugin(
  options: LightningCSSPluginOptions = {},
): Promise<Plugin | undefined> {
  // Dynamically import unplugin-lightningcss (optional peer dependency)
  const LightningCSS = await import('unplugin-lightningcss/rolldown').catch(
    () => undefined,
  )
  if (!LightningCSS) return undefined

  // Convert target to array format if it's a string
  const targetArray = options.target
    ? Array.isArray(options.target)
      ? options.target
      : [options.target]
    : undefined

  // Convert esbuild-format target to LightningCSS targets
  // Note: Only browser targets like 'chrome90' are valid for LightningCSS
  // ES targets like 'es2022' will be ignored (plugin still works without targets)
  const targets = targetArray && esbuildTargetToLightningCSS(targetArray)

  const plugin = LightningCSS.default({ options: targets ? { targets } : {} })
  return plugin
}
